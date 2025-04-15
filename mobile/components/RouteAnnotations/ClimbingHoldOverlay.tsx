import React, { useReducer } from "react";
import { Svg, Polygon, Rect, Mask } from "react-native-svg";
import { SIZES } from "@/constants/theme";
import { HOLD_SELECTION, HOLD_SELECTION_COLORS } from "@/constants/holdSelection";
import { ClimbingHold } from "./RouteAnnotations";

interface ClimbingHoldOverlayProps {
  data: ClimbingHold[];
  scaleX: number;
  scaleY: number;
  showUnselectedHolds?: boolean;
  interactable?: boolean;
  onHoldStateChange?: (index: number, newState: HOLD_SELECTION) => void;
}

const ClimbingHoldOverlay: React.FC<ClimbingHoldOverlayProps> = ({ data, scaleX, scaleY, showUnselectedHolds = false, interactable = true, onHoldStateChange }) => {
  const [, forceUpdate] = useReducer(x => x + 1, 0); // Dummy state to force re-render

  const colorMap: Record<HOLD_SELECTION, string> = {
    [HOLD_SELECTION.UNSELECTED]: showUnselectedHolds ? "black" : "none",
    [HOLD_SELECTION.INTERMEDIATE]: HOLD_SELECTION_COLORS.intermediate,
    [HOLD_SELECTION.START]: HOLD_SELECTION_COLORS.start,
    [HOLD_SELECTION.END]: HOLD_SELECTION_COLORS.end,
  };

  const handlePolygonPress = (hold: ClimbingHold, index: number) => {
    if (!interactable) return;

    const selectionValues = Object.values(HOLD_SELECTION);
    const currentIndex = selectionValues.indexOf(hold.holdSelectionState);
    const nextIndex = (currentIndex + 1) % selectionValues.length;
    const newState = selectionValues[nextIndex] as HOLD_SELECTION;

    // Local update for immediate feedback
    hold.holdSelectionState = newState;
    forceUpdate(); // force re-render to show the changed state

    // Notify parent of the change
    onHoldStateChange?.(index, newState);
  };

  const selectedHolds = data.filter(
    (hold) => hold.holdSelectionState !== HOLD_SELECTION.UNSELECTED
  );

  const polygonPaths = selectedHolds.map((hold) => {
    const coordsString = hold.coordinates
      .map((c, i) => (i % 2 === 0 ? `${c},` : c))
      .join(" ");
    return coordsString;
  });

  const shouldRenderGrayBackground = selectedHolds.length > 0;

  return (
    <Svg width="100%" height="100%" style={{ position: "absolute" }}>
      <Mask id="mask1">
        <Rect x="0" y="0" width="100%" height="100%" fill="white" />
        {polygonPaths.map((coords, index) => (
          <Polygon key={index} points={coords} fill="black" />
        ))}
      </Mask>

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

      {data.map((hold, index) => {
        const coordsString = hold.coordinates
          .map((c, i) => (i % 2 === 0 ? `${c * scaleX},` : `${c * scaleY}`))
          .join(" ");
        const strokeColor = colorMap[hold.holdSelectionState];

        return (
          <Polygon
            key={index}
            points={coordsString}
            fill="none"
            stroke={strokeColor}
            strokeWidth={2}
            strokeLinejoin="round"
            onPressIn={() => handlePolygonPress(hold, index)}
          />
        );
      })}
    </Svg>
  );
};

export default ClimbingHoldOverlay;
