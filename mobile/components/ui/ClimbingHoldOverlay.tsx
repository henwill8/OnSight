import React, { useReducer } from "react";
import { Svg, Polygon, Rect, Mask } from "react-native-svg";
import { SIZES } from "@/constants/theme";
import { HOLD_SELECTION, HOLD_SELECTION_COLORS, ClimbingHold } from "@/constants/holdSelection";

const selectionOrder = [
  HOLD_SELECTION.UNSELECTED,
  HOLD_SELECTION.INTERMEDIATE,
  HOLD_SELECTION.START,
  HOLD_SELECTION.END,
];

interface ClimbingHoldOverlayProps {
  climbingHoldsRef: React.RefObject<ClimbingHold[]>;
  showUnselectedHolds?: boolean;
}

const ClimbingHoldOverlay: React.FC<ClimbingHoldOverlayProps> = ({
  climbingHoldsRef,
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
    hold.holdSelectionState = selectionOrder[nextIndex];
    forceUpdate(); // Trigger re-render
  };

  // Filter out unselected holds for polygons
  const selectedHolds = climbingHoldsRef.current.filter(
    (hold) => hold.holdSelectionState !== HOLD_SELECTION.UNSELECTED
  );

  // Create a mask to "cut out" the area of the polygons from the gray background
  const polygonPaths = selectedHolds.map((hold) => {
    const coordsString = hold.coordinates
      .map((c, i) => (i % 2 === 0 ? `${c},` : c))
      .join(" ");
    return coordsString;
  });

  // If there are no selected holds, don't render the gray background
  const shouldRenderGrayBackground = selectedHolds.length > 0;

  return (
    <Svg width="100%" height="100%" style={{ position: "absolute" }}>
      {/* Mask to hide areas covered by polygons (excluding unselected ones) */}
      <Mask id="mask1">
        <Rect x="0" y="0" width="100%" height="100%" fill="white" />
        {polygonPaths.map((coords, index) => (
          <Polygon key={index} points={coords} fill="black" />
        ))}
      </Mask>

      {/* Apply the mask to the gray background */}
      {shouldRenderGrayBackground && (
        <Rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgb(0, 0, 0)"
          opacity={0.2}
          mask="url(#mask1)"
          rx={SIZES.borderRadius}
          ry={SIZES.borderRadius}
        />
      )}

      {/* Polygons representing climbing holds */}
      {climbingHoldsRef.current.map((hold, index) => {
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
