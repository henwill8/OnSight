import React, { useRef, useReducer, useEffect } from "react";
import { View, PanResponder, GestureResponderEvent, PanResponderGestureState, ViewStyle } from "react-native";
import { Canvas, Path } from "@shopify/react-native-skia";
import { IPath, Segment } from "./RouteImage";
import { FittedImageRectOutput } from "@/utils/ImageUtils"; // Assuming this is the correct import

interface DrawProps {
  data: IPath[];
  fittedImageRect: FittedImageRectOutput; // Fitted image rect as a prop
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
  interactable = true
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
    let totalDistance = 0;
    for (let i = 1; i < segments.length; i++) {
      const prev = segments[i - 1];
      const current = segments[i];
      const dx = current.x - prev.x;
      const dy = current.y - prev.y;
      totalDistance += Math.sqrt(dx * dx + dy * dy);
    }
    return totalDistance;
  };

  const handleStart = (
    e: GestureResponderEvent,
    gestureState: PanResponderGestureState
  ) => {
    if (gestureState.numberActiveTouches !== 1 || !interactable) return;

    const { locationX, locationY } = e.nativeEvent;
    const { scaleX, scaleY, offsetX, offsetY } = fittedImageRectRef.current;

    const newPath: IPath = {
      segments: [
        {
          x: (locationX - offsetX) / scaleX, // Adjust based on scale and offset
          y: (locationY - offsetY) / scaleY, // Adjust based on scale and offset
        },
      ],
      color: colorRef.current,
    };

    currentPathRef.current = newPath;
    isDrawing.current = true;
  };

  const handleMove = (
    e: GestureResponderEvent,
    gestureState: PanResponderGestureState
  ) => {
    if (gestureState.numberActiveTouches > 1) {
      handleEnd();
      return;
    }

    if (!isDrawing.current) return;

    const { locationX, locationY } = e.nativeEvent;
    const { scaleX, scaleY, offsetX, offsetY } = fittedImageRectRef.current;
    const currentPath = currentPathRef.current;

    if (currentPath) {
      currentPath.segments.push({
        x: (locationX - offsetX) / scaleX, // Adjust based on scale and offset
        y: (locationY - offsetY) / scaleY, // Adjust based on scale and offset
      });
      forceUpdate();
    }
  };

  const handleEnd = () => {
    if (!isDrawing.current) return;

    const currentPath = currentPathRef.current;
    isDrawing.current = false;
    currentPathRef.current = null;

    if (currentPath) {
      const length = calculateDistance(currentPath.segments);
      if (length >= 10) {
        onAddPath?.(currentPath);
      }
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => {
        // Only try to claim responder for single-touch events when in drawing mode
        return gestureState.numberActiveTouches === 1 && interactable && canDraw && colorRef.current != null;
      },
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Only handle single-touch movements
        return gestureState.numberActiveTouches === 1 && (isDrawing.current || interactable);
      },
      // Give up responder when a second touch is detected
      onPanResponderTerminationRequest: (evt, gestureState) => {
        return gestureState.numberActiveTouches > 1;
      },
      onPanResponderGrant: handleStart,
      onPanResponderMove: handleMove,
      onPanResponderRelease: handleEnd,
      onPanResponderTerminate: handleEnd,
    })
  ).current;

  return (
    <View
      style={{ width: "100%", height: "100%" }}
      {...(interactable ? panResponder.panHandlers : {})}
      pointerEvents={interactable && canDraw ? "auto" : "none"}
    >
      <Canvas style={{ flex: 1 }}>
        {[...data, ...(currentPathRef.current ? [currentPathRef.current] : [])].map((p, index) => {
          const { scaleX, scaleY, offsetX, offsetY } = fittedImageRectRef.current;

          const pathString = p.segments
            .map((s, i) => {
              const x = s.x * scaleX + offsetX; // Apply scale and offset
              const y = s.y * scaleY + offsetY; // Apply scale and offset
              return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`;
            })
            .join(" ");

          return <Path key={index} path={pathString} strokeWidth={4 * scaleX} style="stroke" color={p.color} />;
        })}
      </Canvas>
    </View>
  );
};

export default Draw;
