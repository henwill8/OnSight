import { useState, useEffect, useCallback } from 'react';
import { API_PATHS } from '../../constants/paths';
import { useApi } from '@/hooks/utils/useApi';
import { loadAnnotations } from '@/utils/annotationUtils';
import { Route } from '@/storage/routeStore';
import { Location, BreadcrumbItem, RouteInfo } from '@/types';
import { AnnotationsData } from '@/types/annotationTypes';
import { Router } from 'expo-router';

export const useRoutesData = (gymId: string | null, locationId: string | null) => {
  const { callApi } = useApi();
  const [routes, setRoutes] = useState<RouteInfo[]>([]);
  const [childLocations, setChildLocations] = useState<Location[]>([]);
  const [breadcrumb, setBreadcrumb] = useState<BreadcrumbItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (!gymId) return;
    setLoading(true);

    try {
      await Promise.all([fetchRoutes(), fetchChildLocations(), fetchBreadcrumb()]);
    } catch (err) {
      console.error('Error fetching data:', err);
      setRoutes([]);
      setChildLocations([]);
    } finally {
      setLoading(false);
    }
  }, [gymId, locationId]);

  const fetchRoutes = async () => {
    const routesUrl = `${API_PATHS.GET_ROUTES}?gymId=${gymId}${locationId ? `&locationId=${locationId}` : ''}`;
    const data = await callApi<{ routes: RouteInfo[] }>(routesUrl, { method: "GET" });

    const routesToProcess = data.routes || []; // Ensure data.routes is an array

    const routes = await Promise.all(
      routesToProcess.map(async (route: any) => {
        try {
          const imageRes = await callApi<Response>(route.imageUrl, { skipJsonParse: true });
          const annotationsRes = await callApi<Response>(route.annotationsUrl, { skipJsonParse: true });

          const { url: imageUrl } = await imageRes.json();
          let annotationsUrl = '';
          if (annotationsRes.ok) {
            const { url } = await annotationsRes.json();
            annotationsUrl = url;
          }

          const annotations: AnnotationsData = await loadAnnotations(annotationsUrl)

          const processedRoute: Route = {
            imageUri: imageUrl,
            annotations: annotations || null
          };

          return { ...route, route: processedRoute };
        } catch (err) {
          const dummyRoute: Route = {
            imageUri: '',
            annotations: null
          };

          return { ...route, route: dummyRoute };
        }
      })
    );

    setRoutes(routes);
  };

  const fetchChildLocations = async () => {
    const childUrl = `${API_PATHS.GET_CHILD_LOCATIONS(gymId || '')}${locationId ? `?parentId=${locationId}` : ''}`;
    const data = await callApi<{ locations: Location[] }>(childUrl, { method: "GET" });
    setChildLocations(data.locations || []);
  };

  const fetchBreadcrumb = async () => {
    if (!locationId) {
      setBreadcrumb([]);
      return;
    }
    const breadcrumbUrl = `${API_PATHS.GET_LOCATION_ANCESTRY(locationId)}`;
    const data = await callApi<{ ancestry: BreadcrumbItem[] }>(breadcrumbUrl, { method: "GET" });
    setBreadcrumb(data.ancestry || []);
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { routes, childLocations, breadcrumb, loading, refetch: fetchData };
};
