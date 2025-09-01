import React, { useReducer, useMemo, useRef } from "react";
import { Svg, Rect, Mask, Path, Defs } from "react-native-svg";
import { View, ViewStyle } from "react-native";
import { HOLD_SELECTION, HOLD_SELECTION_COLORS } from "@/constants/holdSelection";
import { ClimbingHold } from "./RouteImage";
import { FittedImageRectOutput } from "@/utils/ImageUtils";
import { crossPlatformTouchHandler } from "@/utils/touchHandler";
import { simplifyPolygon, createSmoothPath, pointInPolygon } from "@/utils/geometricUtils";

interface ClimbingHoldOverlayProps {
  data: ClimbingHold[];
  fittedImageRect: FittedImageRectOutput;
  showUnselectedHolds?: boolean;
  interactable?: boolean;
  onHoldStateChange?: (index: number, newState: HOLD_SELECTION, prevState: HOLD_SELECTION) => void;
  style?: ViewStyle;
  simplifyTolerance?: number;
  smoothingFactor?: number;
  clickThreshold?: number;
}

const SELECTION_VALUES = Object.values(HOLD_SELECTION);

const ClimbingHoldOverlay: React.FC<ClimbingHoldOverlayProps> = ({
  data,
  fittedImageRect,
  showUnselectedHolds = false,
  interactable = true,
  onHoldStateChange,
  style,
  simplifyTolerance = 4.0,
  smoothingFactor = 0.5,
  clickThreshold = 5,
}) => {
  const [, forceUpdate] = useReducer(x => x + 1, 0);

  // Generate unique mask ID for this instance
  const maskId = useMemo(() => `holdMask_${Math.random().toString(36).substr(2, 9)}`, []);

  // Process hold coordinates and paths
  const { smoothPaths, scaledCoordinates, shouldRenderGrayBackground } = useMemo(() => {
    const { scaleX, scaleY, offsetX, offsetY } = fittedImageRect;

    const scaledCoordinates = data.map((hold) => 
      hold.coordinates.map((c, i) => 
        i % 2 === 0 ? c * scaleX + offsetX : c * scaleY + offsetY
      )
    );

    const smoothPaths = scaledCoordinates.map((coords) => {
      const simplifiedCoords = simplifyPolygon(coords, simplifyTolerance * scaleX);
      return createSmoothPath(simplifiedCoords, smoothingFactor);
    });

    const shouldRenderGrayBackground = data.some(
      (hold) => hold.holdSelectionState !== HOLD_SELECTION.UNSELECTED
    );

    return { smoothPaths, scaledCoordinates, shouldRenderGrayBackground };
  }, [data, fittedImageRect, simplifyTolerance, smoothingFactor]);

  // Color mapping for different hold states
  const colorMap: Record<HOLD_SELECTION, string> = useMemo(() => ({
    [HOLD_SELECTION.UNSELECTED]: showUnselectedHolds ? "black" : "none",
    [HOLD_SELECTION.INTERMEDIATE]: HOLD_SELECTION_COLORS.intermediate,
    [HOLD_SELECTION.START]: HOLD_SELECTION_COLORS.start,
    [HOLD_SELECTION.END]: HOLD_SELECTION_COLORS.end,
  }), [showUnselectedHolds]);

  // Handle hold selection cycling
  const handlePolygonPress = (hold: ClimbingHold, index: number) => {
    if (!interactable) return;

    const currentIndex = SELECTION_VALUES.indexOf(hold.holdSelectionState);
    const nextIndex = (currentIndex + 1) % SELECTION_VALUES.length;
    const newState = SELECTION_VALUES[nextIndex] as HOLD_SELECTION;
    const prevState = hold.holdSelectionState;

    hold.holdSelectionState = newState;
    forceUpdate();
    onHoldStateChange?.(index, newState, prevState);
  };

  // Touch handling state
  const touchStartPoint = useRef<{ x: number; y: number } | null>(null);
  const isValidClick = useRef(true);

  const onTouchStart = (point: { x: number; y: number }) => {
    touchStartPoint.current = point;
    isValidClick.current = true;
  };

  const onTouchMove = (point: { x: number; y: number }) => {
    if (!touchStartPoint.current || !isValidClick.current) return;

    const dx = point.x - touchStartPoint.current.x;
    const dy = point.y - touchStartPoint.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > clickThreshold) {
      isValidClick.current = false;
    }
  };

  const onTouchEnd = (point: { x: number; y: number }) => {
    if (!interactable || !isValidClick.current || !touchStartPoint.current) {
      touchStartPoint.current = null;
      isValidClick.current = true;
      return;
    }

    // Use start point for more accurate hit detection
    const hitPoint = touchStartPoint.current;

    // Find the topmost hold that was touched (iterate backwards for z-order)
    for (let i = data.length - 1; i >= 0; i--) {
      const hold = data[i];
      if (pointInPolygon([hitPoint.x, hitPoint.y], scaledCoordinates[i])) {
        handlePolygonPress(hold, i);
        break;
      }
    }

    touchStartPoint.current = null;
    isValidClick.current = true;
  };

  // Apply cross-platform touch handling
  const { eventHandlers, pointerEvents } = crossPlatformTouchHandler(
    interactable,
    onTouchStart,
    onTouchMove,
    onTouchEnd
  );

  const { scaleX } = fittedImageRect;

  return (
    <View style={style} pointerEvents={pointerEvents}>
      <Svg 
        width="100%" 
        height="100%" 
        style={{ position: "absolute" }} 
        pointerEvents={pointerEvents}
        {...eventHandlers}
      >
        <Defs>
          <Mask id={maskId} x="0" y="0" width="100%" height="100%">
            <Rect x="0" y="0" width="100%" height="100%" fill="white" />
            {smoothPaths.map((pathData, index) => {
              const hold = data[index];
              return hold.holdSelectionState !== HOLD_SELECTION.UNSELECTED ? (
                <Path key={index} d={pathData} fill="black" />
              ) : null;
            })}
          </Mask>
        </Defs>

        {shouldRenderGrayBackground && (
          <Rect
            x="0"
            y="0"
            width="100%"
            height="100%"
            fill="rgb(0, 0, 0)"
            opacity={0.5}
            mask={`url(#${maskId})`}
          />
        )}

        {smoothPaths.map((pathData, index) => {
          const hold = data[index];
          
          // Skip unselected holds when not interactable
          if (hold.holdSelectionState === HOLD_SELECTION.UNSELECTED && !interactable) {
            return null;
          }

          const strokeColor = colorMap[hold.holdSelectionState];
          if (strokeColor === "none") return null;

          return (
            <Path
              key={index}
              d={pathData}
              fill="none"
              stroke={strokeColor}
              strokeWidth={4 * scaleX}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          );
        })}
      </Svg>
    </View>
  );
};

export default ClimbingHoldOverlay;