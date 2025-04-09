
export enum HOLD_SELECTION {
  UNSELECTED,
  INTERMEDIATE,
  START,
  END
}

export const HOLD_SELECTION_COLORS = {
  intermediate: "rgb(255, 255, 255)",
  start: "rgba(0, 255, 0, 1)",
  end: "rgba(216, 0, 0, 1)"
}

export type ClimbingHold = {
  coordinates: number[],
  holdSelectionState: HOLD_SELECTION,
  scaled: boolean
};