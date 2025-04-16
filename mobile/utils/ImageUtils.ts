import { ImageResizeMode } from "react-native";

interface FittedImageRectInput {
  containerWidth: number;
  containerHeight: number;
  imageWidth: number;
  imageHeight: number;
  resizeMode?: ImageResizeMode;
}

export interface FittedImageRectOutput {
  width: number;
  height: number;
  offsetX: number;
  offsetY: number;
  scaleX: number;
  scaleY: number;
}

export function getFittedImageRect({
  containerWidth,
  containerHeight,
  imageWidth,
  imageHeight,
  resizeMode = "cover",
}: FittedImageRectInput): FittedImageRectOutput {
  const imageAspect = imageWidth / imageHeight;
  const containerAspect = containerWidth / containerHeight;

  let width: number;
  let height: number;

  if ((resizeMode === "contain" && imageAspect > containerAspect) || (resizeMode === "cover" && imageAspect < containerAspect)) {
    // Fit by width
    width = containerWidth;
    height = containerWidth / imageAspect;
  } else {
    // Fit by height
    height = containerHeight;
    width = containerHeight * imageAspect;
  }

  const offsetX = (containerWidth - width) / 2;
  const offsetY = (containerHeight - height) / 2;

  return {
    width,
    height,
    offsetX,
    offsetY,
    scaleX: width / imageWidth,
    scaleY: height / imageHeight,
  };
}
