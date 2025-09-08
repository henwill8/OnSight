import { useEffect, useMemo, useState } from "react";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { RouteInfo } from "@/types";
import { useRouteStore } from "@/storage/routeStore";
import { useImageDimensions } from "../utils/useImageDimensions";

export const useRouteDetailLogic = () => {
  const navigation = useNavigation();
  const [routeDetails, setRouteDetails] = useState<RouteInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const { data: routeData } = useRouteStore();
  const { routeParams } = useLocalSearchParams();

  // Parse routeParams only when it changes
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

  // Get image URI from routeData
  const imageUriString = routeData?.imageUri ?? null;

  // Compute image dimensions and scale
  const { imageDimensions, scaleX, scaleY } = useImageDimensions(imageUriString, 220); // TODO: remove magic number

  // Memoize scaled dimensions so it doesn't recalculate every render
  const scaledImageDimensions = useMemo(() => {
    if (!imageDimensions) return null;
    return {
      width: imageDimensions.width * scaleX,
      height: imageDimensions.height * scaleY,
    };
  }, [imageDimensions, scaleX, scaleY]);

  return {
    navigation,
    routeDetails,
    loading,
    scaledImageDimensions,
  };
};
