import React, { useState, useReducer } from "react";
import { Svg, Polygon, Rect, Mask } from "react-native-svg";
import { View, ViewStyle } from "react-native";
import { SIZES } from "@/constants/theme";
import { HOLD_SELECTION, HOLD_SELECTION_COLORS } from "@/constants/holdSelection";
import { ClimbingHold } from "./RouteAnnotations";
import { FittedImageRectOutput } from "@/utils/ImageUtils"; // Assuming this is the correct import

interface ClimbingHoldOverlayProps {
  data: ClimbingHold[];
  fittedImageRect: FittedImageRectOutput; // Fitted image rect as a prop
  showUnselectedHolds?: boolean;
  interactable?: boolean;
  onHoldStateChange?: (index: number, newState: HOLD_SELECTION, prevState: HOLD_SELECTION) => void;
  style?: ViewStyle;
}

const ClimbingHoldOverlay: React.FC<ClimbingHoldOverlayProps> = ({
  data,
  fittedImageRect,
  showUnselectedHolds = false,
  interactable = true,
  onHoldStateChange,
  style,
}) => {
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
    const prevState = hold.holdSelectionState;

    // Local update for immediate feedback
    hold.holdSelectionState = newState;
    forceUpdate(); // force re-render to show the changed state

    // Notify parent of the change
    onHoldStateChange?.(index, newState, prevState);
  };

  // Destructure scale and offset from the fitted image rect
  const { scaleX, scaleY, offsetX, offsetY } = fittedImageRect;

  // Generate polygon paths and apply the scale and offset
  const polygonPaths = data.map((hold) =>
    hold.coordinates
      .map((c, i) => {
        // Apply scale and offset
        return i % 2 === 0 ? `${c * scaleX + offsetX},` : `${c * scaleY + offsetY}`;
      })
      .join(" ")
  );

  const selectedHolds = data.filter(
    (hold) => hold.holdSelectionState !== HOLD_SELECTION.UNSELECTED
  );

  const shouldRenderGrayBackground = selectedHolds.length > 0;

  return (
    <View style={style}>
      <Svg width="100%" height="100%" style={{ position: "absolute" }} pointerEvents={interactable ? "auto" : "none"}>
        {/* Mask for selected holds */}
        <Mask id="mask1">
          <Rect x="0" y="0" width="100%" height="100%" fill="white" />
          {polygonPaths.map((coords, index) => {
            const hold = data[index];
            // Only add to mask if hold is selected
            if (hold.holdSelectionState !== HOLD_SELECTION.UNSELECTED) {
              return <Polygon key={index} points={coords} fill="black" />;
            }
            return null;
          })}
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

        {/* Render all holds as polygons */}
        {polygonPaths.map((coordsString, index) => {
          const hold = data[index];
          const strokeColor = colorMap[hold.holdSelectionState];

          return (
            <Polygon
              key={index} // Add key for each polygon
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
    </View>
  );
};

export default ClimbingHoldOverlay;
