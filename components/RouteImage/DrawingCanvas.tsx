import React, { useRef, useReducer, useEffect } from "react";
import {
  View,
  ViewStyle,
} from "react-native";
import { Svg, Path } from "react-native-svg";
import { IPath, Segment } from "./RouteImage";
import { FittedImageRectOutput } from "@/utils/ImageUtils";
import { crossPlatformTouchHandler } from "@/utils/touchHandler";

export interface DrawProps {
  data: IPath[];
  fittedImageRect: FittedImageRectOutput;
  onAddPath?: (newPath: IPath) => void;
  color?: string;
  style?: ViewStyle;
  canDraw?: boolean;
  interactable?: boolean;
}

const DrawingCanvas: React.FC<DrawProps> = ({
  data,
  fittedImageRect,
  onAddPath,
  color = "black",
  style,
  canDraw = true,
  interactable = true,
}) => {
  const [, forceUpdate] = useReducer(x => x + 1, 0);

  const isDrawing = useRef(false);
  const colorRef = useRef(color);
  const fittedImageRectRef = useRef(fittedImageRect);
  const currentPathRef = useRef<IPath | null>(null);

  useEffect(() => {
    colorRef.current = color;
  }, [color]);

  useEffect(() => {
    fittedImageRectRef.current = fittedImageRect;
  }, [fittedImageRect]);

  const calculateDistance = (segments: Segment[]): number => {
    let total = 0;
    for (let i = 1; i < segments.length; i++) {
      const prev = segments[i - 1];
      const cur = segments[i];
      const dx = cur.x - prev.x;
      const dy = cur.y - prev.y;
      total += Math.sqrt(dx * dx + dy * dy);
    }
    return total;
  };

  // Drawing event handlers for the cross-platform hook
  const onDrawStart = (point: { x: number; y: number }) => {
    if (!interactable || !canDraw) return;

    const newPath: IPath = {
      segments: [{
        x: point.x,
        y: point.y 
      }],
      color: colorRef.current,
    };

    currentPathRef.current = newPath;
    isDrawing.current = true;
  };

  const onDrawMove = (point: { x: number; y: number }) => {
    if (!isDrawing.current) return;

    const currentPath = currentPathRef.current;

    if (currentPath) {
      currentPath.segments.push({ 
        x: (point.x), 
        y: (point.y)
      });
      forceUpdate();
    }
  };

  const onDrawEnd = (point: { x: number; y: number }) => {
    if (!isDrawing.current) return;

    const currentPath = currentPathRef.current;
    isDrawing.current = false;
    currentPathRef.current = null;

    if (currentPath && calculateDistance(currentPath.segments) >= 10) {
      onAddPath?.(currentPath);
    }
  };

  // Use the cross-platform touch handler
  const { eventHandlers, pointerEvents } = crossPlatformTouchHandler(
    interactable && canDraw,
    fittedImageRect,
    onDrawStart,
    onDrawMove,
    onDrawEnd
  );

  return (
    <View style={style} pointerEvents={pointerEvents}>
      <Svg 
        width="100%" 
        height="100%" 
        style={{ position: "absolute" }}
        pointerEvents={pointerEvents}
        {...eventHandlers}
      >
        {[...data, ...(currentPathRef.current ? [currentPathRef.current] : [])].map((p, index) => {
          const { scaleX, scaleY, offsetX, offsetY } = fittedImageRectRef.current;
          const pathString = p.segments
            .map((s, i) => `${i === 0 ? "M" : "L"} ${s.x} ${s.y}`)
            .join(" ");

          return (
            <Path
              key={index}
              d={pathString}
              fill="none"
              stroke={p.color}
              strokeWidth={4 * scaleX}
              strokeLinecap="round"
            />
          );
        })}
      </Svg>
    </View>
  );
};

export default DrawingCanvas;