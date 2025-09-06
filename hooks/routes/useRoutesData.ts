import { useState, useEffect, useCallback } from 'react';
import { API_PATHS } from '../../constants/paths';
import { callApi } from '../../utils/api';

export const useRoutesData = <R, L, B>(gymId: string | null, locationId: string | null) => {
  const [routes, setRoutes] = useState<R[]>([]);
  const [childLocations, setChildLocations] = useState<L[]>([]);
  const [breadcrumb, setBreadcrumb] = useState<B[]>([]);
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
    const data = await callApi<{ routes: R[] }>(routesUrl, { method: "GET" });

    const routesWithSignedUrls = await Promise.all(
      data.routes.map(async (route: any) => {
        try {
          const imageRes = await callApi<Response>(route.imageUrl, { skipJsonParse: true });
          const annotationsRes = await callApi<Response>(route.annotationsUrl, { skipJsonParse: true });

          const { url: imageUrl } = await imageRes.json();
          let annotationsUrl = '';
          if (annotationsRes.ok) {
            const { url } = await annotationsRes.json();
            annotationsUrl = url;
          }

          return { ...route, imageUrl, annotationsUrl };
        } catch (err) {
          return { ...route, imageUrl: null, annotationsUrl: null };
        }
      })
    );

    setRoutes(routesWithSignedUrls as R[]);
  };

  const fetchChildLocations = async () => {
    const childUrl = `${API_PATHS.GET_CHILD_LOCATIONS(gymId || '')}${locationId ? `?parentId=${locationId}` : ''}`;
    const data = await callApi<{ locations: L[] }>(childUrl, { method: "GET" });
    setChildLocations(data.locations || []);
  };

  const fetchBreadcrumb = async () => {
    if (!locationId) {
      setBreadcrumb([]);
      return;
    }
    const breadcrumbUrl = `${API_PATHS.GET_LOCATION_ANCESTRY(locationId)}`;
    const data = await callApi<{ ancestry: B[] }>(breadcrumbUrl, { method: "GET" });
    setBreadcrumb(data.ancestry || []);
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { routes, childLocations, breadcrumb, loading, refetch: fetchData };
};
