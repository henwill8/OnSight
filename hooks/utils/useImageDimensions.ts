import { useState, useEffect } from 'react';
import { Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { calculateOptimalImageDimensions } from '@/utils/imageUtils';

interface ImageSize {
  width: number;
  height: number;
}

export const useImageDimensions = (imageUri: string | null, extraHeight: number = 0) => {
  const [imageDimensions, setImageDimensions] = useState<ImageSize | null>(null);
  const [scaleX, setScaleX] = useState<number>(1);
  const [scaleY, setScaleY] = useState<number>(1);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (imageUri) {
      Image.getSize(imageUri, (width, height) => {
        setImageDimensions({ width, height });
      });
      console.log("Image size", imageDimensions, imageUri)
    }
  }, [imageUri]);

  useEffect(() => {
    if (!imageDimensions) return;

    const scaled = calculateOptimalImageDimensions({
      imageWidth: imageDimensions.width,
      imageHeight: imageDimensions.height,
      insets,
      extraHeight,
    });
    setScaleX(scaled?.scaleX || 1);
    setScaleY(scaled?.scaleY || 1);
  }, [imageDimensions, insets, extraHeight]);

  return {
    imageDimensions,
    scaleX,
    scaleY,
  };
};
