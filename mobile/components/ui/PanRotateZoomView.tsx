import React, { useRef, useImperativeHandle, forwardRef, useState } from "react";
import { Animated, PanResponder, View, StyleSheet } from "react-native";
import ViewShot from "react-native-view-shot";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";

interface Props {
  children: React.ReactNode;
}

export interface PanRotateZoomViewRef {
  exportView: () => Promise<void>;
}

const PanRotateZoomView = forwardRef<PanRotateZoomViewRef, Props>(({ children }, ref) => {
  const scale = useRef(new Animated.Value(1)).current;
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const rotation = useRef(new Animated.Value(0)).current;

  const [transformEnabled, setTransformEnabled] = useState(true);

  // Store previous scale values
  const lastDistance = useRef<number | null>(null);
  const lastTranslateX = useRef<number | null>(null);
  const lastTranslateY = useRef<number | null>(null);
  const lastRotation = useRef<number | null>(null);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: (_, gestureState) =>
        gestureState.numberActiveTouches > 1,
      onMoveShouldSetPanResponder: (_, gestureState) =>
        gestureState.numberActiveTouches > 1,
      onPanResponderGrant: () => {
        lastDistance.current = null;
        lastRotation.current = null;
        lastTranslateX.current = null;
        lastTranslateY.current = null;
      },
      onPanResponderMove: (event) => {
        const { touches } = event.nativeEvent;
        if (touches.length === 2) {
          const dx = touches[0].pageX - touches[1].pageX;
          const dy = touches[0].pageY - touches[1].pageY;
          const currentDistance = Math.sqrt(dx * dx + dy * dy);

          if (lastDistance.current !== null) {
            const distanceChange = currentDistance - lastDistance.current;
            const newScale = distanceChange / 200;
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

  const viewShotRef = useRef<ViewShot>(null);

  useImperativeHandle(ref, () => ({
    exportView: async () => {
      if (viewShotRef.current) {
        try {
          setTransformEnabled(false);

          const uri = await viewShotRef.current.capture();
          if (uri) {
            console.log("Captured image URI:", uri);

            // Save to local storage
            const fileUri = `${FileSystem.cacheDirectory}exported-image.jpg`;
            await FileSystem.copyAsync({ from: uri, to: fileUri });

            // Share the image
            if (await Sharing.isAvailableAsync()) {
              await Sharing.shareAsync(fileUri);
            }
          }
        } catch (error) {
          console.error("Error exporting view:", error);
        } finally {
          // ➡️ Restore transformations after capture
          setTransformEnabled(true);
        }
      } else {
        console.error("ViewShot reference is undefined");
      }
    },
  }));

  return (
    <ViewShot ref={viewShotRef} options={{ format: "jpg", quality: 0.9 }}>
      <Animated.View
        {...panResponder.panHandlers}
        style={[
          transformEnabled
            ? {
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
              }
            : {},
        ]}
      >
        {children}
      </Animated.View>
    </ViewShot>
  );
});

export default PanRotateZoomView;
