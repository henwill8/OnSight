
export interface ClimbingHold {
  coordinates: number[];
  holdSelectionState: HOLD_SELECTION;
}

export interface Segment {
  x: number;
  y: number;
}

export interface IPath {
  segments: Segment[];
  color?: string;
}

export interface ChangeLogEntry {
  type: "ADD_PATH" | "UPDATE_HOLD_STATE";
  data: any;
}

export interface AnnotationsData {
  climbingHolds: ClimbingHold[];
  drawingPaths: IPath[];
  history: ChangeLogEntry[];
}

export enum HOLD_SELECTION {
  UNSELECTED = "unselected",
  INTERMEDIATE = "intermediate",
  START = "start",
  END = "end"
}

export const HOLD_SELECTION_COLORS = {
  intermediate: "rgb(255, 255, 255)",
  start: "rgba(0, 255, 0, 1)",
  end: "rgba(216, 0, 0, 1)"
}