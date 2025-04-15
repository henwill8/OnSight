import React, { useRef, useReducer, useEffect, useImperativeHandle, forwardRef } from "react";
import {
  View,
  PanResponder,
  GestureResponderEvent,
  PanResponderGestureState,
  ViewStyle
} from "react-native";
import { Canvas, Path } from "@shopify/react-native-skia";
import { IPath, Segment } from "./RouteAnnotations";

interface DrawProps {
  data: IPath[];
  scaleX: number;
  scaleY: number;
  onAddPath?: (newPath: IPath) => void;
  color?: string;
  style?: ViewStyle;
  canDraw?: boolean;
  interactable?: boolean;
}

const Draw: React.FC<DrawProps> = ({ data, scaleX, scaleY, onAddPath, canDraw = true, color = "black", style, interactable = true }) => {
  const [, forceUpdate] = useReducer(x => x + 1, 0);

  const isDrawing = useRef(false);
  const colorRef = useRef(color);
  const scaleXRef = useRef(scaleX);
  const scaleYRef = useRef(scaleY);
  const currentPathRef = useRef<IPath | null>(null);

  useEffect(() => {
    colorRef.current = color;
  }, [color]);

  useEffect(() => {
    scaleXRef.current = scaleX;
  }, [scaleX]);
  
  useEffect(() => {
    scaleYRef.current = scaleY;
  }, [scaleY]);

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

    const newPath: IPath = {
      segments: [{ x: locationX / scaleXRef.current, y: locationY / scaleYRef.current }], // Divide by scale to get the coordinates in the size of the actual image, not the scaled image
      color: colorRef.current
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
    const currentPath = currentPathRef.current;

    if (currentPath) {
      currentPath.segments.push({ x: locationX / scaleXRef.current, y: locationY / scaleYRef.current }); // same reasoning for scaling as above
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
        return gestureState.numberActiveTouches === 1 && interactable && canDraw && colorRef.current != null;;
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
      onPanResponderTerminate: handleEnd
    })
  ).current;

  return (
    <View
      style={{ width: '100%', height: '100%' }}
      {...(interactable ? panResponder.panHandlers : {})}
      pointerEvents={interactable ? "auto" : "none"}
    >
      <Canvas style={{ flex: 1 }}>
        {[...data, ...(currentPathRef.current ? [currentPathRef.current] : [])].map((p, index) => {
          const pathString = p.segments
            .map((s, i) => (i === 0 ? `M ${s.x * scaleX} ${s.y * scaleY}` : `L ${s.x * scaleX} ${s.y * scaleY}`))
            .join(" ");
          return (
            <Path
              key={index}
              path={pathString}
              strokeWidth={2}
              style="stroke"
              color={p.color}
            />
          );
        })}
      </Canvas>
    </View>
  );
};

export default Draw;
