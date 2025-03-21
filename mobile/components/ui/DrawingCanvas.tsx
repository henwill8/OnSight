import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from "react";
import { View, PanResponder, GestureResponderEvent, PanResponderGestureState, ViewStyle } from "react-native";
import { Canvas, Color, Path } from "@shopify/react-native-skia";

interface IPath {
  segments: string[];
  color?: string;
}

interface DrawProps {
  color?: string;  // Optional color prop, which defaults to black
  style?: ViewStyle;
  enabled?: boolean;
}

// Using forwardRef to pass a ref to the Draw component
const Draw: React.FC<DrawProps> = forwardRef(({ color = 'black', style, enabled = true }, ref) => {
  const [paths, setPaths] = useState<IPath[]>([]);
  const isDrawing = useRef(false);
  const colorRef = useRef(color);

  // Expose the undo method to parent components or external code
  useImperativeHandle(ref, () => ({
    undo: () => {
      setPaths((prevPaths) => prevPaths.slice(0, -1));  // Remove the last path from the array
    }
  }));

  useEffect(() => {
    console.log("DrawCanvas switched color:", color);
    colorRef.current = color;
  }, [color]);

  const handleStart = (e: GestureResponderEvent, gestureState: PanResponderGestureState) => {
    if (gestureState.numberActiveTouches !== 1) return;

    e.persist();

    if (!e.nativeEvent) return;

    setPaths((prevPaths) => [
      ...prevPaths,
      {
        segments: [`M ${e.nativeEvent.locationX} ${e.nativeEvent.locationY}`],
        color: colorRef.current,
      },
    ]);

    isDrawing.current = true;
  };

  const handleMove = (e: GestureResponderEvent, gestureState: PanResponderGestureState) => {
    if (!isDrawing.current || gestureState.numberActiveTouches !== 1) return;

    e.persist();

    if (!e.nativeEvent) return;

    setPaths((prevPaths) => {
      if (prevPaths.length === 0) return prevPaths;

      const index = prevPaths.length - 1;
      const newPaths = [...prevPaths];

      if (newPaths[index]?.segments) {
        newPaths[index].segments.push(`L ${e.nativeEvent.locationX} ${e.nativeEvent.locationY}`);
      }

      return newPaths;
    });
  };

  const handleEnd = () => {
    isDrawing.current = false;
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: handleStart,
      onPanResponderMove: handleMove,
      onPanResponderRelease: handleEnd,
      onPanResponderTerminate: handleEnd,
    })
  ).current;

  return (
    <View 
      style={[style]} 
      {...(enabled ? panResponder.panHandlers : {})} 
      pointerEvents={enabled ? "auto" : "none"}
    >
      <Canvas style={{ flex: 1 }}>
        {paths.map((p, index) => (
          <Path
            key={index}
            path={p.segments.join(" ")}
            strokeWidth={2}
            style="stroke"
            color={p.color}
          />
        ))}
      </Canvas>
    </View>
  );
});

// Export Draw with ref
export default Draw;
