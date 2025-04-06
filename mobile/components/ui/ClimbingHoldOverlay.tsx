import React, { useReducer, useState } from "react";
import { Svg, Polygon } from "react-native-svg";
import { HOLD_SELECTION_COLORS } from "@/constants/theme";
import { HOLD_SELECTION, ClimbingHold } from "@/constants/holdSelection";

const selectionOrder = [
  HOLD_SELECTION.UNSELECTED,
  HOLD_SELECTION.INTERMEDIATE,
  HOLD_SELECTION.START,
  HOLD_SELECTION.END,
];

interface ClimbingHoldOverlayProps {
  climbingHolds: ClimbingHold[];
  showUnselectedHolds?: boolean;
}

const ClimbingHoldOverlay: React.FC<ClimbingHoldOverlayProps> = ({
  climbingHolds,
  showUnselectedHolds = false,
}) => {
  const [, forceUpdate] = useReducer(x => x + 1, 0); // Dummy state to force re-render

  const colorMap: Record<HOLD_SELECTION, string> = {
    [HOLD_SELECTION.UNSELECTED]: showUnselectedHolds ? "black" : "none",
    [HOLD_SELECTION.INTERMEDIATE]: HOLD_SELECTION_COLORS.intermediate,
    [HOLD_SELECTION.START]: HOLD_SELECTION_COLORS.start,
    [HOLD_SELECTION.END]: HOLD_SELECTION_COLORS.end,
  };

  const handlePolygonPress = (hold: ClimbingHold) => {
    const currentIndex = selectionOrder.indexOf(hold.holdSelectionState);
    const nextIndex = (currentIndex + 1) % selectionOrder.length;
    hold.holdSelectionState = selectionOrder[nextIndex]; // Mutate the object
    forceUpdate(); // Trigger re-render
  };

  return (
    <Svg
      width="100%"
      height="100%"
      style={{ position: "absolute" }}
    >
      {climbingHolds.map((hold, index) => {
        const coordsString = hold.coordinates
          .map((c, i) => (i % 2 === 0 ? `${c},` : c))
          .join(" ");

        const strokeColor = colorMap[hold.holdSelectionState];

        return (
          <Polygon
            key={index}
            points={coordsString}
            fill="none"
            stroke={strokeColor}
            strokeWidth={2}
            onPressIn={() => handlePolygonPress(hold)}
          />
        );
      })}
    </Svg>
  );
};

export default ClimbingHoldOverlay;
