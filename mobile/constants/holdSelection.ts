
export enum HOLD_SELECTION {
  UNSELECTED,
  INTERMEDIATE,
  START,
  END
}

export type ClimbingHold = {
  coordinates: number[],
  holdSelectionState: HOLD_SELECTION
};