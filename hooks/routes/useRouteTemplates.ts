import { useState, useCallback, Dispatch, SetStateAction } from "react";
import { Alert } from "react-native";
import { API_PATHS } from '@/constants/paths';
import { getSecureItem } from '@/utils/secureStorageUtils';
import { useApi } from '@/hooks/utils/useApi';
import { Template } from '@/types';

interface RouteData {
  imageUri: string | null;
  annotations: string | null;
}

interface UseRouteTemplatesReturn {
  templates: Template[];
  showTemplates: boolean;
  setShowTemplates: Dispatch<SetStateAction<boolean>>;
  loadingTemplates: boolean;
  handleFetchTemplates: (locationId: string | null) => Promise<void>;
  handleTemplateSelect: (template: Template, setRouteData: (data: RouteData) => void, navigateToCreator: () => void) => void;
  handleShowTemplates: (locationId: string | null) => void;
}

export const useRouteTemplates = (): UseRouteTemplatesReturn => {
  const [templates, setTemplates] = useState<Template[]>([]);
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

      const data = await callApi<{ templates: Template[] }>(url, { method: "GET" });

      // Process templates to get signed URLs
      const templatesWithSignedUrls = await Promise.all(
        data.templates.map(async (template: any) => {
          try {
            const [imageUrlRes, annotationsUrlRes] = await Promise.all([
              callApi<{ url: string }>(template.imageUrl, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
              }),
              callApi<{ url: string }>(template.annotationsUrl, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' },
              })
            ]);

            const { url: imageUrl } = imageUrlRes;
            let annotationsUrl = "";

            if (annotationsUrlRes) {
              const { url } = annotationsUrlRes;
              annotationsUrl = url;
            }

            return {
              ...template,
              imageUrl,
              annotationsUrl
            };
          } catch (err) {
            console.error(`Error getting signed URL for template: ${template.imageUrl}`, err);
            return {
              ...template,
              imageUrl: null,
              annotationsUrl: null
            };
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

  const handleTemplateSelect = useCallback((template: Template, setRouteData: (data: RouteData) => void, navigateToCreator: () => void) => {
    setRouteData({
      imageUri: template.imageUrl,
      annotations: template.annotationsUrl
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
