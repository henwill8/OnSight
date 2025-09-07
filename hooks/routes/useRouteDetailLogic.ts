import { useEffect, useState } from 'react';
import { Dimensions } from 'react-native';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import { RouteInfo } from '@/types';
import { useImageDimensions } from '../utils/useImageDimensions';

export const useRouteDetailLogic = () => {
  const navigation = useNavigation();
  const [routeDetails, setRouteDetails] = useState<RouteInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const { routeParams } = useLocalSearchParams();
  const parsedParams = decodeURIComponent(JSON.parse(routeParams as string));

  const imageUriString = routeDetails?.imageUrl ?? null;
  const { imageDimensions, scaleX, scaleY } = useImageDimensions(imageUriString, -0.2 * Dimensions.get('window').height);

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
    parsedParams
  };
};
