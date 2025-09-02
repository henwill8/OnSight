import { Dimensions } from 'react-native';
import * as ImageManipulator from 'expo-image-manipulator';
import { Platform } from 'react-native';
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

/**
 * Resize an image to a max dimension (width or height).
 * Returns manipulated image object with uri, width, height.
 */
export async function resizeImageToMaxDimension(uri: string, maxDimension: number = 1024) {
  // Get the original image dimensions
  const { width, height } = await ImageManipulator.manipulateAsync(uri, [], { base64: false });

  // If both dimensions are already under the limit, return as-is
  if (width <= maxDimension && height <= maxDimension) {
    return {
      uri,
      width,
      height,
    };
  }

  // Determine scale factor to make the largest dimension maxDimension
  const scaleFactor = width > height
    ? maxDimension / width
    : maxDimension / height;

  const newWidth = Math.floor(width * scaleFactor);
  const newHeight = Math.floor(height * scaleFactor);

  return await ImageManipulator.manipulateAsync(
    uri,
    [{ resize: { width: newWidth, height: newHeight } }],
    {
      compress: 1,
      format: ImageManipulator.SaveFormat.JPEG,
    }
  );
}

/**
 * Calculates the optimal scale factors for an image to fit within the available screen space.
 * Accounts for safe area insets and UI elements.
 */
export function calculateOptimalImageDimensions({
  imageWidth,
  imageHeight,
  insets,
  extraHeight = 220,
}: {
  imageWidth: number;
  imageHeight: number;
  insets: { top: number; bottom: number; left: number; right: number };
  extraHeight?: number;
}) {
  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;
  const aspectRatio = imageWidth / imageHeight;
  const availableHeight = screenHeight - insets.top - insets.bottom - extraHeight;
  const availableWidth = screenWidth - insets.left - insets.right;
  let width = availableWidth;
  let height = width / aspectRatio;
  if (height > availableHeight) {
    height = availableHeight;
    width = height * aspectRatio;
  }
  return { scaleX: width / imageWidth, scaleY: height / imageHeight };
}
