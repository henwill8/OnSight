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

/**
 * Calculates the dimensions and offset for an image to fit within a container
 * based on a specified resize mode (contain or cover).
 *
 * @param containerWidth The width of the container.
 * @param containerHeight The height of the container.
 * @param imageWidth The original width of the image.
 * @param imageHeight The original height of the image.
 * @param resizeMode How the image should be resized to fit its container. Defaults to "cover".
 * @returns An object containing the calculated width, height, offsetX, offsetY, scaleX, and scaleY for the fitted image.
 */
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
 * Resizes an image to ensure its largest dimension (width or height) does not exceed a specified maximum dimension.
 * If the image is already smaller than the max dimension, it is returned as-is.
 *
 * @param uri The URI of the image to resize.
 * @param maxDimension The maximum allowed dimension (width or height). Defaults to 1024.
 * @returns A promise that resolves to an ImageManipulator.ImageResult object with the manipulated image's URI, width, and height.
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
 * Calculates the optimal scale factors for an image to fit within the available screen space,
 * taking into account safe area insets and additional UI height.
 *
 * @param imageWidth The original width of the image.
 * @param imageHeight The original height of the image.
 * @param insets The safe area insets (top, bottom, left, right).
 * @param extraHeight Additional height occupied by UI elements, to be subtracted from available screen height. Defaults to 220.
 * @returns An object containing the calculated scale factors (scaleX, scaleY).
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
