import { Platform } from 'react-native';
import { fetchWithTimeout } from '@/utils/api';
import { getFileType } from '@/utils/fileUtils';
import { API_PATHS } from '@/constants/paths';
import config from '@/config';
import { useGymStore } from '@/store/gymStore';
import { Template, CreateRouteData } from '@/types';

export const useRouteService = () => {
  const { gymData } = useGymStore();

  const fetchTemplates = async (locationId?: string): Promise<Template[]> => {
    try {
      const gymId = gymData.gymId;

      // Build query parameters
      const queryParams = new URLSearchParams();
      if (gymId) queryParams.append('gymId', gymId);
      if (locationId && gymId) queryParams.append('locationId', locationId);

      const url = `${config.API_URL}${API_PATHS.GET_TEMPLATES}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;

      const response = await fetchWithTimeout(url, { method: "GET" });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch templates');
      }

      const data = await response.json();

      // Process templates to get signed URLs
      const templatesWithSignedUrls = await Promise.all(
        data.map(async (template: any) => {
          try {
            const [imageUrlRes, annotationsUrlRes] = await Promise.all([
              fetchWithTimeout(template.imageUrl, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
              }),
              fetchWithTimeout(template.annotationsUrl, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
              })
            ]);

            const { url: imageUrl } = await imageUrlRes.json();
            let annotationsUrl = "";

            if (annotationsUrlRes.ok) {
              const { url } = await annotationsUrlRes.json();
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

      return templatesWithSignedUrls;
    } catch (error) {
      console.error("Error fetching templates:", error);
      throw error;
    }
  };

  const createRoute = async (routeData: CreateRouteData): Promise<any> => {
    try {
      const gymId = gymData.gymId;
      const formData = new FormData();

      // Append text data
      formData.append("name", routeData.name);
      formData.append("description", routeData.description);
      formData.append("difficulty", routeData.difficulty || "");
      formData.append("gymId", gymId || "");
      formData.append("locationId", routeData.locationId || "");
      formData.append("annotations", routeData.annotationsJSON || "");

      // Handle image file
      const { extension, mimeType } = getFileType(routeData.imageUri);

      if (Platform.OS === "web") {
        // For web, fetch the file as a blob
        const response = await fetch(routeData.imageUri);
        const blob = await response.blob();
        const file = new File([blob], `photo.${extension}`, { type: mimeType });
        formData.append("image", file);
      } else {
        // For React Native
        formData.append("image", {
          uri: routeData.imageUri,
          name: `photo.${extension}`,
          type: mimeType,
        } as any);
      }

      const response = await fetchWithTimeout(
        config.API_URL + API_PATHS.CREATE_ROUTE,
        {
          method: "POST",
          body: formData,
        },
        5000
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to create route');
      }

      return await response.json();
    } catch (error) {
      console.error("Error creating route:", error);
      throw error;
    }
  };

  const getCurrentGymName = (): string => {
    return gymData.gymName || "";
  };

  return {
    fetchTemplates,
    createRoute,
    getCurrentGymName,
  };
};
