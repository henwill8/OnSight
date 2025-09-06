import { Platform } from 'react-native';
import { getFileType } from '@/utils/fileUtils';
import { API_PATHS } from '@/constants/paths';
import { getSecureItem, setSecureItem } from '@/utils/secureStorageUtils';
import { Template, CreateRouteData, SaveRouteRequest } from '@/types';
import { callApi } from '@/utils/api';

export const createRoute = async (routeData: SaveRouteRequest) => {
  try {
    const storedGymData = await getSecureItem('gymData');
    const gymData = storedGymData ? JSON.parse(storedGymData) : { gymId: '' };
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

    const response = await callApi<{ message?: string }>(API_PATHS.CREATE_ROUTE, {
      method: "POST",
      body: formData,
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 5000
    });

    return response;
  } catch (error) {
    console.error("Error creating route:", error);
    throw error;
  }
};

export const getCurrentGymName = async (): Promise<string> => {
  const storedGymData = await getSecureItem('gymData');
  const gymData = storedGymData ? JSON.parse(storedGymData) : { gymName: '' };
  return gymData.gymName || "";
};

export const fetchTemplates = async (locationId?: string): Promise<Template[]> => {
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

    return templatesWithSignedUrls;
  } catch (error) {
    console.error("Error fetching templates:", error);
    throw error;
  }
};
