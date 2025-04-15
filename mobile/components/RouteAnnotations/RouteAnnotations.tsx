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
  canDraw?: boolean;
  showUnselectedHolds?: boolean;
  style?: ViewStyle;
}

export interface RouteAnnotationsRef {
  exportAnnotationJSON: () => string;
  loadAnnotationJSON: (json: string) => void;
  loadPredictedClimbingHolds: (climbingHolds: ClimbingHold[]) => void;
}

const RouteAnnotations: ForwardRefRenderFunction<RouteAnnotationsRef, RouteAnnotationsProps> = ({ scaleX, scaleY, interactable = true, canDraw = false, showUnselectedHolds = false, style }, ref) => {
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
      { type: "ADD_PATH", data: [] }, // Don't need any data as we can assume it was the most recently created path that should be removed
    ]);
  };

  const updateClimbingHold = (index: number, newState: HOLD_SELECTION) => {
    setAnnotationData((prev) => {
      const updatedHolds = [...prev.climbingHolds];
      if (updatedHolds[index]) {
        updatedHolds[index] = {
          ...updatedHolds[index],
          holdSelectionState: newState,
        };
      }

      return {
        ...prev,
        climbingHolds: updatedHolds,
      };
    });

    setChangeHistory((prev) => [
      ...prev,
      {
        type: "UPDATE_HOLD_STATE",
        data: { index, newState },
      },
    ]);
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
      const parsed = JSON.parse(json)

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
    setAnnotationData(prev => ({
      ...prev,
      climbingHolds: climbingHolds,
    }));
  };

  useImperativeHandle(ref, () => ({
    exportAnnotationJSON,
    loadAnnotationJSON,
    loadPredictedClimbingHolds
  }));

  return (
    <View style={style}>
      <ClimbingHoldOverlay
        data={annotationData.climbingHolds}
        onHoldStateChange={updateClimbingHold}
        interactable={interactable}
        scaleX={scaleX}
        scaleY={scaleY}
        showUnselectedHolds={showUnselectedHolds}
      />
      <DrawingCanvas
        data={annotationData.drawingPaths}
        onAddPath={addDrawingPath}
        interactable={interactable && canDraw}
        scaleX={scaleX}
        scaleY={scaleY}
      />
    </View>
  );
};

export default forwardRef(RouteAnnotations);
