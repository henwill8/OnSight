import { useState, useCallback } from "react";
import { Alert, Platform } from "react-native";
import { getFileType } from '@/utils/fileUtils';
import { API_PATHS } from '@/constants/paths';
import { getSecureItem } from '@/utils/secureStorageUtils';
import { useApi } from '@/hooks/utils/useApi';
import { SaveRouteRequest } from '@/types';
import { useGymStore } from "@/storage/gymStore";
import { useRouteStore } from "@/storage/routeStore";

interface RouteSubmissionData {
  name: string;
  description: string;
  difficulty: string;
  locationId?: string; // Make optional to match SaveRouteRequest
}

interface UseRouteSubmissionReturn {
  loading: boolean;
  handleSubmit: (data: RouteSubmissionData, navigateBackAndReload: () => void) => Promise<void>;
}

export const useRouteSubmission = (): UseRouteSubmissionReturn => {
  const [loading, setLoading] = useState(false);
  const { callApi } = useApi();
  const { data: gymData} = useGymStore();
  const { data: routeData} = useRouteStore();

  const handleSubmit = useCallback(async (data: RouteSubmissionData, navigateBackAndReload: () => void) => {
    setLoading(true);
    try {
      const formData = new FormData();

      // Append text data
      formData.append("name", data.name);
      formData.append("description", data.description);
      formData.append("difficulty", data.difficulty || "");
      formData.append("gymId", gymData.id || "");
      formData.append("locationId", data.locationId || "");
      formData.append("annotations", JSON.stringify(routeData.annotations || {}));

      console.log(routeData)

      // Handle image file
      if (!routeData.imageUri) {
        console.warn("Route image URI is missing, skipping image upload.");
        return;
      }
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

      await callApi<{ message?: string }>(API_PATHS.CREATE_ROUTE, {
        method: "POST",
        body: formData,
        timeout: 5000
      });

      Alert.alert("Success", "Route created successfully!");
      navigateBackAndReload();
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create route");
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    handleSubmit,
  };
};
