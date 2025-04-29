import React, { useReducer, useMemo } from "react";
import { Svg, Rect, Mask, Path } from "react-native-svg";
import { View, ViewStyle } from "react-native";
import { SIZES } from "@/constants/theme";
import { HOLD_SELECTION, HOLD_SELECTION_COLORS } from "@/constants/holdSelection";
import { ClimbingHold } from "./RouteImage";
import { FittedImageRectOutput } from "@/utils/ImageUtils";

interface ClimbingHoldOverlayProps {
  data: ClimbingHold[];
  fittedImageRect: FittedImageRectOutput;
  showUnselectedHolds?: boolean;
  interactable?: boolean;
  onHoldStateChange?: (index: number, newState: HOLD_SELECTION, prevState: HOLD_SELECTION) => void;
  style?: ViewStyle;
  simplifyTolerance?: number; // Tolerance for simplification (higher = more simplified)
  smoothingFactor?: number; // How much to smooth (0 = no smoothing, 1 = max smoothing)
}

// Function to simplify a polygon using the Ramer-Douglas-Peucker algorithm
// coords is a flat array of [x1, y1, x2, y2, ...]
const simplifyPolygon = (coords: number[], tolerance: number): number[] => {
  if (coords.length <= 4) return coords; // Need at least 3 points (6 numbers) to simplify

  // Convert flat array to points format for algorithm
  const points: number[][] = [];
  for (let i = 0; i < coords.length; i += 2) {
    points.push([coords[i], coords[i + 1]]);
  }

  // Find the point with the maximum distance
  let maxDistance = 0;
  let maxIndex = 0;
  
  const firstPoint = points[0];
  const lastPoint = points[points.length - 1];
  
  for (let i = 1; i < points.length - 1; i++) {
    const distance = perpendicularDistance(points[i], firstPoint, lastPoint);
    if (distance > maxDistance) {
      maxDistance = distance;
      maxIndex = i;
    }
  }
  
  // If the maximum distance is greater than tolerance, recursively simplify
  if (maxDistance > tolerance) {
    // Split the points and recursively simplify
    const firstHalfPoints = points.slice(0, maxIndex + 1);
    const secondHalfPoints = points.slice(maxIndex);
    
    // Convert points back to flat arrays for recursive calls
    const firstHalfCoords: number[] = [];
    const secondHalfCoords: number[] = [];
    
    firstHalfPoints.forEach(p => {
      firstHalfCoords.push(p[0], p[1]);
    });
    
    secondHalfPoints.forEach(p => {
      secondHalfCoords.push(p[0], p[1]);
    });
    
    const simplifiedFirst = simplifyPolygon(firstHalfCoords, tolerance);
    const simplifiedSecond = simplifyPolygon(secondHalfCoords, tolerance);
    
    // Combine results, avoiding duplicate points
    // Convert back to flat arrays
    const combinedCoords: number[] = [];
    
    // Add all points from first half except the last one
    for (let i = 0; i < simplifiedFirst.length - 2; i += 2) {
      combinedCoords.push(simplifiedFirst[i], simplifiedFirst[i + 1]);
    }
    
    // Add all points from second half
    for (let i = 0; i < simplifiedSecond.length; i += 2) {
      combinedCoords.push(simplifiedSecond[i], simplifiedSecond[i + 1]);
    }
    
    return combinedCoords;
  } else {
    // All points in this segment are within tolerance, so simplify to just the endpoints
    return [firstPoint[0], firstPoint[1], lastPoint[0], lastPoint[1]];
  }
};

// Calculate perpendicular distance from a point to a line (the shortest possible distance from the point to any part of the line)
const perpendicularDistance = (point: number[], lineStart: number[], lineEnd: number[]): number => {
  const dx = lineEnd[0] - lineStart[0];
  const dy = lineEnd[1] - lineStart[1];
  
  // Normalize
  const mag = Math.sqrt(dx * dx + dy * dy);
  if (mag === 0) return 0;
  
  const nx = dx / mag;
  const ny = dy / mag;
  
  const pvx = point[0] - lineStart[0];
  const pvy = point[1] - lineStart[1];
  
  // Get dot product
  const pvdot = nx * pvx + ny * pvy;
  
  // Get perpendicular distance squared
  const ax = pvx - pvdot * nx;
  const ay = pvy - pvdot * ny;
  
  return Math.sqrt(ax * ax + ay * ay);
};

// Create a smooth bezier curve SVG path from coordinate array
const createSmoothPath = (coords: number[], smoothingFactor: number): string => {
  if (coords.length < 6) { // Need at least 3 points to smooth
    // Just create a simple path
    let path = `M ${coords[0]},${coords[1]}`;
    for (let i = 2; i < coords.length; i += 2) {
      path += ` L ${coords[i]},${coords[i + 1]}`;
    }
    return path;
  }
  
  // Convert flat array to points for easier processing
  const points: number[][] = [];
  for (let i = 0; i < coords.length; i += 2) {
    points.push([coords[i], coords[i + 1]]);
  }
  
  // Ensure the path is closed by adding the first point at the end if needed
  if (points[0][0] !== points[points.length - 1][0] || 
      points[0][1] !== points[points.length - 1][1]) {
    points.push([...points[0]]);
  }
  
  let path = `M ${points[0][0]},${points[0][1]}`;
  
  for (let i = 0; i < points.length - 1; i++) {
    const curr = points[i];
    const next = points[i + 1];
    
    // Calculate control points
    const controlPointLength = smoothingFactor * Math.hypot(next[0] - curr[0], next[1] - curr[1]) / 2;
    
    // Previous and next points for tangent calculation
    const prev = i > 0 ? points[i - 1] : points[points.length - 2];
    const nextNext = i < points.length - 2 ? points[i + 2] : points[1];
    
    // Calculate tangent vectors
    const tangent1 = [
      next[0] - prev[0],
      next[1] - prev[1]
    ];
    
    const tangent2 = [
      nextNext[0] - curr[0],
      nextNext[1] - curr[1]
    ];
    
    // Normalize tangents
    const tan1Mag = Math.sqrt(tangent1[0] * tangent1[0] + tangent1[1] * tangent1[1]);
    const tan2Mag = Math.sqrt(tangent2[0] * tangent2[0] + tangent2[1] * tangent2[1]);
    
    const tan1Norm = [
      tan1Mag ? tangent1[0] / tan1Mag : 0,
      tan1Mag ? tangent1[1] / tan1Mag : 0
    ];
    
    const tan2Norm = [
      tan2Mag ? tangent2[0] / tan2Mag : 0,
      tan2Mag ? tangent2[1] / tan2Mag : 0
    ];
    
    // Calculate control points
    const cp1 = [
      curr[0] + tan1Norm[0] * controlPointLength,
      curr[1] + tan1Norm[1] * controlPointLength
    ];
    
    const cp2 = [
      next[0] - tan2Norm[0] * controlPointLength,
      next[1] - tan2Norm[1] * controlPointLength
    ];
    
    // Add the cubic bezier curve command
    path += ` C ${cp1[0]},${cp1[1]} ${cp2[0]},${cp2[1]} ${next[0]},${next[1]}`;
  }
  
  return path;
};

const ClimbingHoldOverlay: React.FC<ClimbingHoldOverlayProps> = ({
  data,
  fittedImageRect,
  showUnselectedHolds = false,
  interactable = true,
  onHoldStateChange,
  style,
  simplifyTolerance = 4.0,
  smoothingFactor = 0.5,
}) => {
  const [, forceUpdate] = useReducer(x => x + 1, 0);

  const { smoothPaths, shouldRenderGrayBackground } = useMemo(() => {
    const { scaleX, scaleY, offsetX, offsetY } = fittedImageRect;

    const smoothPaths = data.map((hold) => {
      // First scale and translate the coordinates
      const scaledCoords = hold.coordinates.map((c, i) => 
        i % 2 === 0 ? c * scaleX + offsetX : c * scaleY + offsetY
      );
      
      // Simplify the polygon to reduce the number of points
      const simplifiedCoords = simplifyPolygon(scaledCoords, simplifyTolerance * scaleX);
      
      // Convert simplified points to a smooth path
      return createSmoothPath(simplifiedCoords, smoothingFactor);
    });

    const shouldRenderGrayBackground = data.some(
      (hold) => hold.holdSelectionState !== HOLD_SELECTION.UNSELECTED
    );

    return { smoothPaths, shouldRenderGrayBackground };
  }, [data, fittedImageRect, simplifyTolerance, smoothingFactor]);

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

    hold.holdSelectionState = newState;
    forceUpdate();
    onHoldStateChange?.(index, newState, prevState);
  };

  const { scaleX } = fittedImageRect; // Used to scale the stroke width

  return (
    <View style={style}>
      <Svg width="100%" height="100%" style={{ position: "absolute" }} pointerEvents={interactable ? "auto" : "none"}>
        <Mask id="mask1">
          <Rect x="0" y="0" width="100%" height="100%" fill="white" />
          {smoothPaths.map((pathData, index) => {
            const hold = data[index];
            if (hold.holdSelectionState !== HOLD_SELECTION.UNSELECTED) {
              return <Path key={index} d={pathData} fill="black" />;
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

        {smoothPaths.map((pathData, index) => {
          const hold = data[index];
          if (hold.holdSelectionState == HOLD_SELECTION.UNSELECTED && !interactable) return null;

          const strokeColor = colorMap[hold.holdSelectionState];

          return (
            <Path
              key={index}
              d={pathData}
              fill="none"
              stroke={strokeColor}
              strokeWidth={4 * scaleX}
              strokeLinejoin="round"
              strokeLinecap="round"
              onPressIn={() => handlePolygonPress(hold, index)}
            />
          );
        })}
      </Svg>
    </View>
  );
};

export default ClimbingHoldOverlay;