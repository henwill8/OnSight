import React, { useRef, useReducer, useEffect } from "react";
import {
  View,
  ViewStyle,
  Platform,
} from "react-native";
import { Svg, Path } from "react-native-svg";
import { IPath, Segment } from "./RouteImage";
import { FittedImageRectOutput } from "@/utils/ImageUtils";

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

  const eventToPoint = (event: any) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = (event.clientX - rect.left) / (rect.width / fittedImageRectRef.current.width);
    const y = (event.clientY - rect.top) / (rect.height / fittedImageRectRef.current.height);
    return { x, y };
  }

  const handleStart = (event: any) => {
    if (!interactable) return;

    const { scaleX, scaleY, offsetX, offsetY } = fittedImageRectRef.current;
    const { x, y } = eventToPoint(event);

    const newPath: IPath = {
      segments: [
        { x: (x - offsetX) / scaleX, y: (y - offsetY) / scaleY },
      ],
      color: colorRef.current,
    };

    currentPathRef.current = newPath;
    isDrawing.current = true;
  };

  const handleMove = (event: any) => {
    if (!isDrawing.current) return;

    const { scaleX, scaleY, offsetX, offsetY } = fittedImageRectRef.current;
    const { x, y } = eventToPoint(event);
    const currentPath = currentPathRef.current;

    if (currentPath) {
      currentPath.segments.push(
        { x: (x - offsetX) / scaleX, y: (y - offsetY) / scaleY }
      );
      forceUpdate();
    }
  };

  const handleEnd = () => {
    if (!isDrawing.current) return;

    const currentPath = currentPathRef.current;
    isDrawing.current = false;
    currentPathRef.current = null;

    if (currentPath && calculateDistance(currentPath.segments) >= 10) {
      onAddPath?.(currentPath);
    }
  };

  return (
    <View style={style} pointerEvents={interactable && canDraw ? "auto" : "none"}>
      <Svg 
        width="100%" 
        height="100%" 
        style={{ position: "absolute" }}
        pointerEvents={interactable && canDraw ? "auto" : "none"}
        onPointerDown={canDraw ? handleStart : undefined}
        onPointerMove={canDraw ? handleMove : undefined}
        onPointerUp={canDraw ? handleEnd : undefined}
      >
        {[...data, ...(currentPathRef.current ? [currentPathRef.current] : [])].map((p, index) => {
          const { scaleX, scaleY, offsetX, offsetY } = fittedImageRectRef.current;
          const pathString = p.segments
            .map((s, i) => `${i === 0 ? "M" : "L"} ${ s.x * scaleX + offsetX} ${s.y * scaleY + offsetY}`)
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
