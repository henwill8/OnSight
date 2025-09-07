import { useEffect, useState } from 'react';
import { Dimensions } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { RouteInfo } from '@/types';
import { useRouteStore } from '@/storage/routeStore';
import { useImageDimensions } from '../utils/useImageDimensions';

export const useRouteDetailLogic = () => {
  const navigation = useNavigation();
  const [routeDetails, setRouteDetails] = useState<RouteInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: routeData } = useRouteStore();

  const { routeParams } = useLocalSearchParams();

  useEffect(() => {
    if (routeParams) {
      try {
        const parsed = JSON.parse(decodeURIComponent(routeParams));
        setRouteDetails(parsed as RouteInfo);
      } catch (err) {
        console.error("Failed to parse route params:", err);
      }
    }
    setLoading(false);
  }, [routeParams]);

  const imageUriString = routeData?.imageUri ?? null;
  const { imageDimensions, scaleX, scaleY } = useImageDimensions(imageUriString, 200); // TODO: fix this

  const scaledImageDimensions = imageDimensions
    ? {
          width: imageDimensions.width * scaleX,
          height: imageDimensions.height * scaleY,
        }
    : null;

  return {
    navigation,
    routeDetails,
    loading,
    scaledImageDimensions,
  };
};
