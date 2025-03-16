import React, { useState, useEffect, useRef } from "react";
import { View, PanResponder, GestureResponderEvent, PanResponderGestureState, ViewStyle } from "react-native";
import { Canvas, Path } from "@shopify/react-native-skia";

interface IPath {
  segments: string[];
  color?: string;
}

interface DrawProps {
  style?: ViewStyle; // Allow passing a custom style
}

const Draw: React.FC<DrawProps> = ({ style }) => {
  const [paths, setPaths] = useState<IPath[]>([]);
  const isDrawing = useRef(false);

  useEffect(() => {
    return () => {};
  }, []);

  const handleStart = (e: GestureResponderEvent, gestureState: PanResponderGestureState) => {
    if (gestureState.numberActiveTouches !== 1) return;

    e.persist();

    if (!e.nativeEvent) return;

    setPaths((prevPaths) => [
      ...prevPaths,
      {
        segments: [`M ${e.nativeEvent.locationX} ${e.nativeEvent.locationY}`],
        color: "#06d6a0",
      },
    ]);

    isDrawing.current = true;
  };

  const handleMove = (e: GestureResponderEvent, gestureState: PanResponderGestureState) => {
    if (!isDrawing.current || gestureState.numberActiveTouches !== 1) return;

    e.persist(); // Prevent event recycling

    if (!e.nativeEvent) return; // Safeguard against null event

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
    <View style={[ style ]} {...panResponder.panHandlers}>
      <Canvas style={{ flex: 1 }}>
        {paths.map((p, index) => (
          <Path
            key={index}
            path={p.segments.join(" ")}
            strokeWidth={2.5}
            style="stroke"
            color={p.color}
          />
        ))}
      </Canvas>
    </View>
  );
};

export default Draw;
