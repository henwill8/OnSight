import { useState, useEffect, useCallback } from 'react';
import config from '@/config';
import { API_PATHS } from '@/constants/paths';
import { fetchWithTimeout } from '@/utils/api';

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
    const routesUrl = `${config.API_URL}${API_PATHS.GET_ROUTES}?gymId=${gymId}${locationId ? `&locationId=${locationId}` : ''}`;
    const res = await fetch(routesUrl);
    if (!res.ok) throw new Error('Failed to fetch routes');
    const data = await res.json();

    const routesWithSignedUrls = await Promise.all(
      data.map(async (route: any) => {
        try {
          const imageRes = await fetchWithTimeout(route.imageUrl);
          const annotationsRes = await fetchWithTimeout(route.annotationsUrl);

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
    const childUrl = `${config.API_URL}${API_PATHS.GET_CHILD_LOCATIONS(gymId || '')}${locationId ? `?parentId=${locationId}` : ''}`;
    const res = await fetch(childUrl);
    if (!res.ok) throw new Error('Failed to fetch child locations');
    const data = await res.json();
    setChildLocations(data.locations as L[] || []);
  };

  const fetchBreadcrumb = async () => {
    if (!locationId) {
      setBreadcrumb([]);
      return;
    }
    const breadcrumbUrl = `${config.API_URL}${API_PATHS.GET_LOCATION_ANCESTRY(locationId)}`;
    const res = await fetch(breadcrumbUrl);
    if (!res.ok) throw new Error('Failed to fetch breadcrumb');
    const data = await res.json();
    setBreadcrumb(data.ancestry as B[] || []);
  };

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { routes, childLocations, breadcrumb, loading, refetch: fetchData };
};
