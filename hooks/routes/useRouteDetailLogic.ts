import { useEffect, useState } from 'react';
import { Dimensions } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { Route } from '@/types';
import { useImageDimensions } from '../utils/useImageDimensions';

export const useRouteDetailLogic = () => {
  const navigation = useNavigation();
  const [routeDetails, setRouteDetails] = useState<Route | null>(null);
  const [loading, setLoading] = useState(true);
  const { route: routeString } = useLocalSearchParams();

  const imageUriString = routeDetails?.imageUrl ?? null;
  const { imageDimensions, scaleX, scaleY } = useImageDimensions(imageUriString, -0.2 * Dimensions.get('window').height);

  useEffect(() => {
    if (routeString) {
      const route = JSON.parse(decodeURIComponent(routeString as string)) as Route;
      setRouteDetails(route);
      setLoading(false);
    }
  }, [routeString]);

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
