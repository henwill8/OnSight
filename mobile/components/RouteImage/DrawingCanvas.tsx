import React, { useRef, useReducer, useEffect } from "react";
import {
  View,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
  ViewStyle,
  Platform,
} from "react-native";
import { Canvas, Path } from "@shopify/react-native-skia";
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

const Draw: React.FC<DrawProps> = ({
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

  const handleStart = (x: number, y: number) => {
    if (!interactable) return;

    const { scaleX, scaleY, offsetX, offsetY } = fittedImageRectRef.current;

    const newPath: IPath = {
      segments: [
        { x: (x - offsetX) / scaleX, y: (y - offsetY) / scaleY },
      ],
      color: colorRef.current,
    };

    currentPathRef.current = newPath;
    isDrawing.current = true;
  };

  const handleMove = (x: number, y: number) => {
    if (!isDrawing.current) return;

    const { scaleX, scaleY, offsetX, offsetY } = fittedImageRectRef.current;
    const currentPath = currentPathRef.current;

    if (currentPath) {
      currentPath.segments.push({ x: (x - offsetX) / scaleX, y: (y - offsetY) / scaleY });
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

  // Mobile PanResponder
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (_, gestureState) =>
        gestureState.numberActiveTouches === 1 && interactable && canDraw && colorRef.current != null,
      onMoveShouldSetPanResponder: (_, gestureState) =>
        gestureState.numberActiveTouches === 1 && (isDrawing.current || interactable),
      onPanResponderGrant: (e, _) => handleStart(e.nativeEvent.locationX, e.nativeEvent.locationY),
      onPanResponderMove: (e, _) => handleMove(e.nativeEvent.locationX, e.nativeEvent.locationY),
      onPanResponderRelease: handleEnd,
      onPanResponderTerminate: handleEnd,
    })
  ).current;

  // Web pointer events
  const webHandlers =
    Platform.OS === "web"
      ? {
          onPointerDown: (e: any) => handleStart(e.nativeEvent.offsetX, e.nativeEvent.offsetY),
          onPointerMove: (e: any) => handleMove(e.nativeEvent.offsetX, e.nativeEvent.offsetY),
          onPointerUp: handleEnd,
          onPointerLeave: handleEnd,
        }
      : {};

  return (
    <View
      style={style}
      {...(Platform.OS === "web" ? webHandlers : panResponder.panHandlers)}
      pointerEvents={interactable && canDraw ? "auto" : "none"}
    >
      <Canvas style={{ flex: 1 }}>
        {[...data, ...(currentPathRef.current ? [currentPathRef.current] : [])].map((p, index) => {
          const { scaleX, scaleY, offsetX, offsetY } = fittedImageRectRef.current;
          const pathString = p.segments
            .map((s, i) => `${i === 0 ? "M" : "L"} ${s.x * scaleX + offsetX} ${s.y * scaleY + offsetY}`)
            .join(" ");
          return <Path key={index} path={pathString} strokeWidth={4 * scaleX} style="stroke" color={p.color} />;
        })}
      </Canvas>
    </View>
  );
};

export default Draw;
