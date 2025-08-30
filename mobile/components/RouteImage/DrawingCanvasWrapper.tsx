import React from "react";
import { Platform } from "react-native";
// import { WithSkiaWeb } from "@shopify/react-native-skia/lib/module/web";
import Draw, { DrawProps } from "./DrawingCanvas";

/**
 * Cross-platform Draw wrapper.
 * - Mobile: renders Draw directly
 * - Web: preloads Skia using WithSkiaWeb
 */
export default function DrawWrapper(props: DrawProps) {
  if (Platform.OS === "web") {
    return (
      <div style={{ color: "red", fontWeight: "bold" }}>
        Draw is not supported on Web yet
      </div>
    );
    // return (
      
    //   <WithSkiaWeb
    //     getComponent={() => Promise.resolve({ default: Draw })}
    //     componentProps={props}
    //     fallback={<div>Loading Canvas...</div>}
    //     opts={{ wasmUrl: '/wasm/canvaskit.wasm' } as any}
    //   />
    // );
  }

  return <Draw {...props} />;
}
