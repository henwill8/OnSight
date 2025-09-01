import React from "react";
import { Platform, View, StyleSheet } from "react-native";
import ReactNativeZoomableView from "react-native-zoomable-view/src/ReactNativeZoomableView";

import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

type Props = {
  children: React.ReactNode;
  zoomEnabled?: boolean;
  panEnabled?: boolean;
  interactable?: boolean;
  style?: any;
};

export default function Zoomable({ children, zoomEnabled = true, panEnabled = true, interactable = true, style }: Props) {
  if (Platform.OS === "web") {
    return (
      <TransformWrapper
        doubleClick={{ disabled: true }}
        wheel={{ step: 50 }}
        pinch={{ step: 5, disabled: false }}
        panning={{ 
          disabled: true,
        }}
        onPanningStart={(ref, event) => {
          // Check if it's a TouchEvent and has only one touch
          if (event instanceof TouchEvent && event.touches.length === 1) {
            return false; // Prevent panning on single touch
          }
          return true;
        }}
      >
        <TransformComponent>
          {children}
        </TransformComponent>
      </TransformWrapper>
    );
  }

  return (
    <ReactNativeZoomableView
      maxZoom={10.0}
      minZoom={0.5}
      zoomStep={0.5}
      initialZoom={1.0}
      bindToBorders={true}
      panEnabled={panEnabled && interactable}
      zoomEnabled={zoomEnabled && interactable}
      disableMomentum={interactable}
    >
      {children}
    </ReactNativeZoomableView>
  );
}
