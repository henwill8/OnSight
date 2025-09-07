import React from "react";
import { Platform, View, StyleSheet } from "react-native";
import ReactNativeZoomableView from "react-native-zoomable-view/src/ReactNativeZoomableView";
import { useTheme } from "@/constants/theme";

import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

type Props = {
  children: React.ReactNode;
  zoomEnabled?: boolean;
  panEnabled?: boolean;
  interactable?: boolean;
  style?: any;
};

export default function Zoomable({ children, zoomEnabled = true, panEnabled = true, interactable = true, style }: Props) {
  const { sizes } = useTheme();
  if (Platform.OS === "web") {
    return (
      <View>
        {children}
      </View> // TODO: figure out why styling doesnt work with transform wrapper/component
      // <TransformWrapper
      //   doubleClick={{ disabled: true }}
      //   wheel={{ step: 50, disabled: !interactable }}
      //   pinch={{ step: 5, disabled: !interactable }}
      //   panning={{ 
      //     disabled: true,
      //   }}
      //   onPanningStart={(ref, event) => {
      //     // Check if it's a TouchEvent and has only one touch
      //     if (!interactable || (event instanceof TouchEvent && event.touches.length === 1)) {
      //       return false; // Prevent panning on single touch
      //     }
      //     return true;
      //   }}
      // >
      //   <TransformComponent
      //     wrapperStyle={style}
      //     contentStyle={style}
      //   >
      //     {children}
      //   </TransformComponent>
      // </TransformWrapper>
    );
  }

  return (
    <ReactNativeZoomableView
      style={style}
      maxZoom={sizes.zoomMax}
      minZoom={sizes.zoomMin}
      zoomStep={sizes.zoomStep}
      initialZoom={sizes.initialZoom}
      bindToBorders={true}
      panEnabled={panEnabled && interactable}
      zoomEnabled={zoomEnabled && interactable}
      disableMomentum={interactable}
    >
      {children}
    </ReactNativeZoomableView>
  );
}
