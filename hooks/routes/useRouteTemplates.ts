import { useState, useCallback, Dispatch, SetStateAction } from "react";
import { Alert } from "react-native";
import { API_PATHS } from '@/constants/paths';
import { getSecureItem } from '@/utils/secureStorageUtils';
import { useApi } from '@/hooks/utils/useApi';
import { Route } from '@/storage/routeStore';
import { loadAnnotations } from "@/utils/annotationUtils";
import { AnnotationsData } from "@/types/annotationTypes";

interface UseRouteTemplatesReturn {
  templates: Route[];
  showTemplates: boolean;
  setShowTemplates: Dispatch<SetStateAction<boolean>>;
  loadingTemplates: boolean;
  handleFetchTemplates: (locationId: string | null) => Promise<void>;
  handleTemplateSelect: (template: Route, setRouteData: (data: Route) => void, navigateToCreator: () => void) => void;
  handleShowTemplates: (locationId: string | null) => void;
}

export const useRouteTemplates = (): UseRouteTemplatesReturn => {
  const [templates, setTemplates] = useState<Route[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  const { callApi } = useApi();

  const handleFetchTemplates = useCallback(async (locationId: string | null) => {
    if (!locationId) return;
    setLoadingTemplates(true);
    try {
      const storedGymData = await getSecureItem('gymData');
      const gymData = storedGymData ? JSON.parse(storedGymData) : { gymId: '' };
      const gymId = gymData.gymId;

      // Build query parameters
      const queryParams = new URLSearchParams();
      if (gymId) queryParams.append('gymId', gymId);
      if (locationId && gymId) queryParams.append('locationId', locationId);

      const url = `${API_PATHS.GET_TEMPLATES}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

      const data = await callApi<{ templates: Route[] }>(url, { method: "GET" });

      // Process templates to get signed URLs
      const templatesWithSignedUrls = await Promise.all(
        data.templates.map(async (template: any) => {
          try {  
            const annotations: AnnotationsData = await loadAnnotations(template.annotationsUrl)
  
            const processedRoute: Route = {
              imageUri: template.imageUrl,
              annotations: annotations || null
            };
  
            return { ...template, route: processedRoute };
          } catch (err) {
            const dummyRoute: Route = {
              imageUri: '',
              annotations: null
            };
  
            return { };
          }
        })
      );

      setTemplates(templatesWithSignedUrls);
    } catch (error) {
      Alert.alert("Error", "Failed to load templates");
    } finally {
      setLoadingTemplates(false);
    }
  }, []);

  const handleTemplateSelect = useCallback((template: Route, setRouteData: (data: Route) => void, navigateToCreator: () => void) => {
    setRouteData({
      imageUri: template.imageUri,
      annotations: template.annotations
    });
    navigateToCreator();
    setShowTemplates(false);
  }, []);

  const handleShowTemplates = useCallback((locationId: string | null) => {
    setShowTemplates(true);
    handleFetchTemplates(locationId);
  }, [handleFetchTemplates]);

  return {
    templates,
    showTemplates,
    setShowTemplates,
    loadingTemplates,
    handleFetchTemplates,
    handleTemplateSelect,
    handleShowTemplates,
  };
};
