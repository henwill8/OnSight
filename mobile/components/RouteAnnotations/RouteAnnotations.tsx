import React, {
  useState,
  useImperativeHandle,
  forwardRef,
  ForwardRefRenderFunction,
} from "react";
import { View, ViewStyle } from "react-native";
import DrawingCanvas from "@/components/RouteAnnotations/DrawingCanvas";
import ClimbingHoldOverlay from "@/components/RouteAnnotations/ClimbingHoldOverlay";
import { HOLD_SELECTION } from "@/constants/holdSelection";

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

interface RouteAnnotationsProps {
  scaleX: number;
  scaleY: number;
  interactable?: boolean;
  style?: ViewStyle;

  climbingHoldOverlayProps?: Partial<{
    showUnselectedHolds: boolean;
  }>;

  drawingCanvasProps?: Partial<{
    canDraw?: boolean;
    color?: string;
  }>;
}

export interface RouteAnnotationsRef {
  undo: () => void;
  exportAnnotationJSON: () => string;
  loadAnnotationJSON: (json: string) => void;
  loadPredictedClimbingHolds: (climbingHolds: ClimbingHold[]) => void;
}

const RouteAnnotations: ForwardRefRenderFunction<RouteAnnotationsRef, RouteAnnotationsProps> = (
  {
    scaleX,
    scaleY,
    interactable = false,
    style,
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
    return JSON.stringify(exportData, null, 2);
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

  useImperativeHandle(ref, () => ({
    undo,
    exportAnnotationJSON,
    loadAnnotationJSON,
    loadPredictedClimbingHolds,
  }));

  return (
    <View style={style}>
      <ClimbingHoldOverlay
        data={annotationData.climbingHolds}
        onHoldStateChange={updateClimbingHold}
        scaleX={scaleX}
        scaleY={scaleY}
        interactable={interactable}
        {...climbingHoldOverlayProps}
      />
      <DrawingCanvas
        data={annotationData.drawingPaths}
        onAddPath={addDrawingPath}
        scaleX={scaleX}
        scaleY={scaleY}
        interactable={interactable}
        {...drawingCanvasProps}
      />
    </View>
  );
};

export default forwardRef(RouteAnnotations);
