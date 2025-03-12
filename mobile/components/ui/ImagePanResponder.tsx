import React, { useRef, useEffect, useState } from "react";
import { Animated, PanResponder, View, StyleSheet, TouchableOpacity } from "react-native";

interface ImagePanResponderProps {
  children: React.ReactNode;
}

const ImagePanResponder: React.FC<ImagePanResponderProps> = ({ children }) => {
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const rotation = useRef(new Animated.Value(0)).current;

  // Store previous scale, rotation, and position values
  const lastDistance = useRef<number | null>(null);
  const lastRotation = useRef<number | null>(null);
  const lastTranslateX = useRef<number | null>(null);
  const lastTranslateY = useRef<number | null>(null);

  // PanResponder logic
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (evt, gestureState) => {
        // Prevent the PanResponder from intercepting touch events for TouchableOpacity buttons
        if (gestureState.numberActiveTouches > 1) {
          return true; // Allow gestures (e.g., pinch to zoom or rotate)
        }
        return false; // Don't capture touch for individual elements like buttons
      },
      onMoveShouldSetPanResponder: (evt, gestureState) => {
        // Prevent the PanResponder from intercepting touch events for TouchableOpacity buttons
        if (gestureState.numberActiveTouches > 1) {
          return true; // Allow gestures (e.g., pinch to zoom or rotate)
        }
        return false; // Don't capture touch for individual elements like buttons
      },
      onPanResponderGrant: () => {
        lastDistance.current = null;
        lastRotation.current = null;
        lastTranslateX.current = null;
        lastTranslateY.current = null;
      },
      onPanResponderMove: (event, gesture) => {
        const { touches } = event.nativeEvent;

        if (touches.length === 2) {
          const dx = touches[0].pageX - touches[1].pageX;
          const dy = touches[0].pageY - touches[1].pageY;
          const currentDistance = Math.sqrt(dx * dx + dy * dy);

          if (lastDistance.current !== null) {
            const distanceChange = currentDistance - lastDistance.current;
            const newScale = distanceChange / 200; // Adjust for sensitivity
            scale.setValue(scale.__getValue() * (newScale + 1));
          }

          lastDistance.current = currentDistance;

          const angle = Math.atan2(dy, dx) * (180 / Math.PI);
          if (lastRotation.current !== null) {
            const rotationChange = angle - lastRotation.current;
            rotation.setValue(rotation.__getValue() + rotationChange);
          }

          lastRotation.current = angle;

          const centerX = (touches[0].pageX + touches[1].pageX) / 2;
          const centerY = (touches[0].pageY + touches[1].pageY) / 2;

          if (lastTranslateX.current !== null && lastTranslateY.current !== null) {
            const translateXChange = centerX - lastTranslateX.current;
            const translateYChange = centerY - lastTranslateY.current;
            translateX.setValue(translateX.__getValue() + translateXChange);
            translateY.setValue(translateY.__getValue() + translateYChange);
          }

          lastTranslateX.current = centerX;
          lastTranslateY.current = centerY;
        }
      },
    })
  ).current;

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        {
          transform: [
            { translateX },
            { translateY },
            { scale },
            {
              rotate: rotation.interpolate({
                inputRange: [-360, 360],
                outputRange: ["-360deg", "360deg"],
              }),
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
};

export default ImagePanResponder;
