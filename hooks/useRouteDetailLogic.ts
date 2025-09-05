import { useEffect, useState } from 'react';
import { Image } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { calculateOptimalImageDimensions } from '@/utils/imageUtils';
import { Route } from '@/types';

interface ImageSize {
  width: number;
  height: number;
}

export const useRouteDetailLogic = () => {
  const navigation = useNavigation();
  const [routeDetails, setRouteDetails] = useState<Route | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageDimensions, setImageDimensions] = useState<ImageSize | null>(null);
  const { route: routeString } = useLocalSearchParams();

  useEffect(() => {
    if (routeString) {
      const route = JSON.parse(decodeURIComponent(routeString as string)) as Route;
      setRouteDetails(route);
      setLoading(false);
    }
  }, [routeString]);

  const imageUriString = routeDetails?.imageUrl;

  useEffect(() => {
    if (imageUriString) {
      Image.getSize(imageUriString, (width, height) => {
        setImageDimensions({ width, height });
      });
    }
  }, [imageUriString]);

  const scaledImageDimensions = imageDimensions
    ? (() => {
        const { scaleX, scaleY } = calculateOptimalImageDimensions({
          imageWidth: imageDimensions.width,
          imageHeight: imageDimensions.height,
          insets: { top: 0, bottom: 0, left: 0, right: 0 },
          extraHeight: -0.2 * imageDimensions.height // mimic 80% screen height
        });
        return {
          width: imageDimensions.width * scaleX,
          height: imageDimensions.height * scaleY,
        };
      })()
    : null;

  return {
    navigation,
    routeDetails,
    loading,
    scaledImageDimensions,
  };
};
