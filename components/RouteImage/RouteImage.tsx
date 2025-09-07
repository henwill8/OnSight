import React, {
  useState,
  useEffect,
  useImperativeHandle,
  forwardRef,
  ForwardRefRenderFunction,
  useCallback,
} from "react";
import { View, ViewStyle, LayoutChangeEvent, Image, ImageProps, ImageResizeMode, StyleSheet, ActivityIndicator } from "react-native";
import DrawingCanvas from "./DrawingCanvas";
import ClimbingHoldOverlay from "./ClimbingHoldOverlay";
import { HOLD_SELECTION, AnnotationsData, ClimbingHold, IPath, ChangeLogEntry } from "@/types/annotationTypes";
import { getFittedImageRect } from "@/utils/imageUtils";
import Zoomable from "@/components/ui/Zoomable";
import { useTheme } from "@/constants/theme";
import { useRouteStore, Route } from "@/storage/routeStore";

interface RouteImageProps {
  interactable?: boolean;
  style?: ViewStyle;
  imageProps?: Partial<ImageProps>;
  climbingHoldOverlayProps?: Partial<{ showUnselectedHolds: boolean }>;
  drawingCanvasProps?: Partial<{ canDraw?: boolean; color?: string }>;
  mode?: 'create' | 'view'; // Explicit mode selection

  // Props for viewing mode
  routeData?: Route; // Pass route data directly for viewing
}

export interface RouteImageRef {
  undo: () => void;
}

const getStyles = (colors: any) => StyleSheet.create({
  imageContainer: { position: "relative", overflow: "hidden" },
  fullOverlay: { position: "absolute", top: 0, left: 0, width: "100%", height: "100%" },
  loadingOverlay: { flex: 1, justifyContent: "center", alignItems: "center" },
});

const RouteImage: ForwardRefRenderFunction<RouteImageRef, RouteImageProps> = (
  {
    interactable = false, 
    style, 
    imageProps = {}, 
    climbingHoldOverlayProps = {}, 
    drawingCanvasProps = {},
    routeData: externalRouteData,
    mode = 'view'
  },
  ref
) => {
  const { colors, global } = useTheme();
  const { data: storeRouteData, updateData } = useRouteStore();
  const styles = getStyles(colors);

  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);
  const [containerSize, setContainerSize] = useState<{ width: number; height: number } | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // Determine data source based on mode
  const isCreateMode = mode === 'create';
  const currentRouteData = externalRouteData ? externalRouteData : storeRouteData;

  console.log(currentRouteData)

  const onContainerLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setContainerSize({ width, height });
  };

  useEffect(() => {
    if (currentRouteData?.imageUri) {
      Image.getSize(currentRouteData.imageUri, (width, height) => setImageSize({ width, height }));
    }
  }, [currentRouteData?.imageUri]);

  const fittedImage = useCallback(() => {
    if (!imageSize || !containerSize) return null;
    return getFittedImageRect({
      containerWidth: containerSize.width,
      containerHeight: containerSize.height,
      imageWidth: imageSize.width,
      imageHeight: imageSize.height,
      resizeMode: imageProps.resizeMode as ImageResizeMode,
    });
  }, [imageSize, containerSize, imageProps.resizeMode]);

  // Helper function to get safe annotations with fallback
  const getSafeAnnotations = useCallback((): AnnotationsData => {
    if (!currentRouteData?.annotations) {
      return {
        climbingHolds: [],
        drawingPaths: [],
        history: []
      };
    }
    return currentRouteData.annotations;
  }, [currentRouteData?.annotations]);

  // Helper function to check if annotations exist and have data
  const hasAnnotations = useCallback((): boolean => {
    const annotations = currentRouteData?.annotations;
    return annotations !== null && annotations !== undefined;
  }, [currentRouteData?.annotations]);

  // Helper function to check if we should show overlays
  const shouldShowOverlays = useCallback((): boolean => {
    return imageLoaded && fittedImage() && hasAnnotations();
  }, [imageLoaded, fittedImage, hasAnnotations]);

  const updateAnnotations = (newAnnotations: Partial<AnnotationsData>, historyEntry?: ChangeLogEntry) => {
    if (!isCreateMode) return;

    const currentAnnotations = getSafeAnnotations();
    
    const updated: AnnotationsData = {
      climbingHolds: newAnnotations.climbingHolds ?? currentAnnotations.climbingHolds,
      drawingPaths: newAnnotations.drawingPaths ?? currentAnnotations.drawingPaths,
      history: [...currentAnnotations.history, historyEntry].filter(Boolean),
    };

    updateData({ annotations: updated });
  };

  const addDrawingPath = (newPath: IPath) => {
    // Only allow drawing in interactive mode
    if (!interactable) return;
    
    const currentAnnotations = getSafeAnnotations();
    updateAnnotations({ drawingPaths: [...currentAnnotations.drawingPaths, newPath] }, { type: "ADD_PATH", data: [] });
  };

  const updateClimbingHold = (index: number, newState: HOLD_SELECTION, prevState: HOLD_SELECTION) => {
    // Only allow hold updates in interactive mode
    if (!interactable) return;
    
    const currentAnnotations = getSafeAnnotations();
    const updatedHolds = [...currentAnnotations.climbingHolds];
    if (updatedHolds[index]) updatedHolds[index] = { ...updatedHolds[index], holdSelectionState: newState };
    updateAnnotations({ climbingHolds: updatedHolds }, { type: "UPDATE_HOLD_STATE", data: { index, prevState } });
  };

  const undo = () => {
    if (!interactable || !isCreateMode) return;
    
    const currentAnnotations = getSafeAnnotations();
    const history = currentAnnotations.history;
    if (!history.length) return;

    const lastChange = history[history.length - 1];
    const updatedAnnotations: AnnotationsData = {
      climbingHolds: [...currentAnnotations.climbingHolds],
      drawingPaths: [...currentAnnotations.drawingPaths],
      history: history.slice(0, -1),
    };

    switch (lastChange.type) {
      case "ADD_PATH":
        updatedAnnotations.drawingPaths.pop();
        break;
      case "UPDATE_HOLD_STATE":
        const { index, prevState } = lastChange.data;
        if (updatedAnnotations.climbingHolds[index]) {
          updatedAnnotations.climbingHolds[index].holdSelectionState = prevState ?? HOLD_SELECTION.UNSELECTED;
        }
        break;
    }

    updateData({ annotations: updatedAnnotations });
  };

  useImperativeHandle(ref, () => ({ undo }));

  // Early return if no route data
  if (!currentRouteData) {
    return (
      <View style={[style, styles.imageContainer]}>
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <Zoomable 
      style={{ flex: 1 }} 
      interactable={interactable}
    >
      <View style={[style, styles.imageContainer]} onLayout={onContainerLayout}>
        <Image
          source={{ uri: currentRouteData.imageUri }}
          onLoad={() => setImageLoaded(true)}
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: containerSize?.width,
            height: containerSize?.height,
            opacity: imageLoaded ? 1 : 0,
          }}
          {...imageProps}
        />

        {!imageLoaded && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        )}

        {shouldShowOverlays() && (
          <>
            <ClimbingHoldOverlay
              data={getSafeAnnotations().climbingHolds}
              onHoldStateChange={updateClimbingHold}
              fittedImageRect={fittedImage()}
              interactable={interactable && isCreateMode}
              {...climbingHoldOverlayProps}
              style={styles.fullOverlay}
            />
            <DrawingCanvas
              data={getSafeAnnotations().drawingPaths}
              onAddPath={addDrawingPath}
              fittedImageRect={fittedImage()}
              interactable={interactable && isCreateMode}
              {...drawingCanvasProps}
              style={styles.fullOverlay}
            />
          </>
        )}
      </View>
    </Zoomable>
  );
};

export default forwardRef(RouteImage);