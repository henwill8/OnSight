import React, {
  useState,
  useMemo,
  useEffect,
  useImperativeHandle,
  forwardRef,
  ForwardRefRenderFunction,
} from "react";
import { View, ViewStyle, LayoutChangeEvent, Image, ImageProps, ImageResizeMode } from "react-native";
import DrawingCanvas from "@/components/RouteImage/DrawingCanvas";
import ClimbingHoldOverlay from "@/components/RouteImage/ClimbingHoldOverlay";
import { HOLD_SELECTION } from "@/constants/holdSelection";
import { getFittedImageRect } from "@/utils/ImageUtils";

export interface ClimbingHold {
  coordinates: number[];
  holdSelectionState: HOLD_SELECTION;
  scaled: boolean;
}

export interface Segment {
  x: number;
  y: number;
}

export interface IPath {
  segments: Segment[];
  color?: string;
}

interface AnnotationsData {
  climbingHolds: ClimbingHold[];
  drawingPaths: IPath[];
}

type ChangeType = "ADD_PATH" | "UPDATE_HOLD_STATE";

interface ChangeLogEntry {
  type: ChangeType;
  data: any;
}

interface RouteImageProps {
  imageURI: string;
  interactable?: boolean;
  dataJSON?: string;
  dataURL?: string;
  style?: ViewStyle;
  
  imageProps?: Partial<ImageProps>;

  climbingHoldOverlayProps?: Partial<{
    showUnselectedHolds: boolean;
  }>;

  drawingCanvasProps?: Partial<{
    canDraw?: boolean;
    color?: string;
  }>;
}

export interface RouteImageRef {
  undo: () => void;
  exportAnnotationJSON: () => string;
  loadAnnotationJSON: (json: string) => void;
  loadPredictedClimbingHolds: (climbingHolds: ClimbingHold[]) => void;
}

const RouteImage: ForwardRefRenderFunction<RouteImageRef, RouteImageProps> = (
  {
    imageURI,
    interactable = false,
    dataJSON = "",
    dataURL = "",
    style,
    imageProps = {},
    climbingHoldOverlayProps = {},
    drawingCanvasProps = {},
  },
  ref
) => {
  const [annotationData, setAnnotationData] = useState<AnnotationsData>({
    climbingHolds: [],
    drawingPaths: [],
  });

  const [changeHistory, setChangeHistory] = useState<ChangeLogEntry[]>([]);

  const [imageSize, setImageSize] = useState<{ width: number; height: number } | null>(null);
  const [containerSize, setContainerSize] = useState<{ width: number; height: number } | null>(null);

  useEffect(() => {
    Image.getSize(imageURI, (width, height) => {
      setImageSize({ width, height });
    });
  }, [imageURI]);

  const onContainerLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setContainerSize({ width, height });
  };

  const fittedImage = useMemo(() => {
    if (!imageSize || !containerSize) return null;

    return getFittedImageRect({
      containerWidth: containerSize.width,
      containerHeight: containerSize.height,
      imageWidth: imageSize.width,
      imageHeight: imageSize.height,
      resizeMode: imageProps.resizeMode as ImageResizeMode,
    });
  }, [imageSize, containerSize]);

  const addDrawingPath = (newPath: IPath) => {
    setAnnotationData((prev) => ({
      ...prev,
      drawingPaths: [...prev.drawingPaths, newPath],
    }));

    setChangeHistory((prev) => [
      ...prev,
      { type: "ADD_PATH", data: [] },
    ]);
  };

  const updateClimbingHold = (index: number, newState: HOLD_SELECTION, prevState: HOLD_SELECTION) => {
    setAnnotationData((prev) => {
      const updatedHolds = [...prev.climbingHolds];
  
      if (updatedHolds[index]) {
        updatedHolds[index] = {
          ...updatedHolds[index],
          holdSelectionState: newState,
        };
      }
  
      setChangeHistory((prevHistory) => [
        ...prevHistory,
        {
          type: "UPDATE_HOLD_STATE",
          data: { index, prevState },
        },
      ]);
  
      return {
        ...prev,
        climbingHolds: updatedHolds,
      };
    });
  };

  const undo = () => {
    if (changeHistory.length === 0) return;
  
    const lastChange = changeHistory[changeHistory.length - 1];
  
    switch (lastChange.type) {
      case "ADD_PATH": {
        setAnnotationData((prev) => ({
          ...prev,
          drawingPaths: prev.drawingPaths.slice(0, -1),
        }));
        break;
      }
      case "UPDATE_HOLD_STATE": {
        const { index, prevState } = lastChange.data;

        setAnnotationData((prev) => {
          const updatedHolds = [...prev.climbingHolds];
          if (updatedHolds[index]) {
            // Revert to previous state if stored, or UNSELECTED if not
            updatedHolds[index] = {
              ...updatedHolds[index],
              holdSelectionState: prevState ?? HOLD_SELECTION.UNSELECTED,
            };
          }

          return {
            ...prev,
            climbingHolds: updatedHolds,
          };
        });
        break;
      }
    }
  
    setChangeHistory(changeHistory.slice(0, -1));
  };

  const exportAnnotationJSON = () => {
    const exportData = {
      annotations: annotationData,
      history: changeHistory,
    };
    return JSON.stringify(exportData, null);
  };

  const loadAnnotationJSON = (json: string) => {
    try {
      const parsed = JSON.parse(json);

      if (parsed.annotations && parsed.history) {
        setAnnotationData(parsed.annotations);
        setChangeHistory(parsed.history);
      } else {
        console.warn("Invalid annotation JSON format");
      }
    } catch (err) {
      console.error("Failed to load annotation JSON:", err);
    }
  };

  const loadPredictedClimbingHolds = (climbingHolds: ClimbingHold[]) => {
    setAnnotationData((prev) => ({
      ...prev,
      climbingHolds,
    }));
  };

  useEffect(() => {
    if (dataJSON !== "") {
      loadAnnotationJSON(dataJSON);
    } else if (dataURL !== "") {
      (async () => {
        try {
          const response = await fetch(dataURL);
          if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
          const jsonText = await response.text();
          loadAnnotationJSON(jsonText);
        } catch (err) {
          console.error("Failed to fetch or load annotation data from URL:", err);
        }
      })();
    }
  }, [dataJSON, dataURL]);

  useImperativeHandle(ref, () => ({
    undo,
    exportAnnotationJSON,
    loadAnnotationJSON,
    loadPredictedClimbingHolds,
  }));

  return (
    <View style={[style, { position: 'relative', overflow: 'hidden' }]} onLayout={onContainerLayout}>
      {fittedImage != null && (
        <>
          <Image
            source={{ uri: imageURI }}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: containerSize?.width,
              height: containerSize?.height,
            }}
            {...imageProps}
          />
          <ClimbingHoldOverlay
            data={annotationData.climbingHolds}
            onHoldStateChange={updateClimbingHold}
            fittedImageRect={fittedImage}
            interactable={interactable}
            {...climbingHoldOverlayProps}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
            }}
          />
          <DrawingCanvas
            data={annotationData.drawingPaths}
            onAddPath={addDrawingPath}
            fittedImageRect={fittedImage}
            interactable={interactable}
            {...drawingCanvasProps}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
            }}
          />
        </>
      )}
    </View>
  );
};

export default forwardRef(RouteImage);
