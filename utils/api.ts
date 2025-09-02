import { getFileType } from '@/utils/fileUtils';
import { Platform } from 'react-native';
import config from '@/config';
import { API_PATHS } from '@/constants/paths';
import { router } from 'expo-router';

export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout: number = 5000,
  retries: number = 3,
  retryDelay: number = 100 // milliseconds between retries
): Promise<Response> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    console.log(`[fetchWithTimeout] Attempt ${attempt}/${retries} to ${url} with timeout: ${timeout}ms`);

    try {
      const response = await fetch(url, { ...options, signal: controller.signal, credentials: 'include' });
      clearTimeout(timer);

      if (response.status === 401 || response.status === 403) {
        console.warn(`[fetchWithTimeout] Unauthorized (${response.status}), redirecting to /auth/login`);
        router.replace('/auth/login');
        return response;
      }

      return response;
    } catch (error: any) {
      clearTimeout(timer);

      const isTimeout = error.name === "AbortError" || error.message.includes("aborted");
      console.warn(`[fetchWithTimeout] Attempt ${attempt} failed: ${isTimeout ? "timeout" : error.message}`);

      if (attempt === retries) {
        throw new Error(isTimeout ? "Request timed out" : `Fetch failed: ${error.message}`);
      }

      // Don't retry if timeout occurred
      if (isTimeout) {
        throw error;
      }

      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }

  throw new Error("fetchWithTimeout: exhausted retries without success.");
}


/**
 * Create FormData for image upload, handling web and native platforms.
 */
export async function createImageFormData({
  name,
  description,
  difficulty,
  gymId,
  annotations,
  locationId,
  imageUri,
}: {
  name: string;
  description: string;
  difficulty: string;
  gymId: string;
  annotations?: string | null;
  locationId?: string | null;
  imageUri: string;
}) {
  const formData = new FormData();
  formData.append("name", name);
  formData.append("description", description);
  formData.append("difficulty", difficulty || "");
  formData.append("gymId", gymId || "");
  formData.append("annotations", annotations || "");
  formData.append("locationId", locationId || "");

  const { extension, mimeType } = getFileType(imageUri);
  if (Platform.OS === "web") {
    // For web, fetch the file as a blob
    const response = await fetch(imageUri);
    const blob = await response.blob();
    const file = new File([blob], `photo.${extension}`, { type: mimeType });
    formData.append("image", file);
  } else {
    // For React Native
    formData.append("image", {
      uri: imageUri,
      name: `photo.${extension}`,
      type: mimeType,
    } as any);
  }
  return formData;
}

// Function to fetch job status with timeout
const fetchJobStatus = async (jobId: string, timeout: number) => {
  try {
    const statusResponse = await fetchWithTimeout(config.API_URL + API_PATHS.JOB_STATUS(jobId), { method: "GET" }, timeout);
    const statusData = await statusResponse.json();

    if (!statusResponse.ok) {
      console.error(`Error fetching job status: ${statusResponse.status}, ${statusData.message}`);
      return null;
    }

    return statusData;
  } catch (error: any) {
    console.error(`Error checking job status: ${error.message}`);
    return null;
  }
};

export const pollJobStatus = async (jobId: string, intervalLength: number, handleJobDone: any, handleJobError: any, timeout: number = 5000) => {
  try {
    let statusData = await fetchJobStatus(jobId, timeout);

    if (!statusData) return; // Stop if we couldn't get status data

    while (statusData.status !== "done" && statusData.status !== "error") {
      console.log(`Job status: ${statusData.status}`);
      await new Promise(resolve => setTimeout(resolve, intervalLength));

      statusData = await fetchJobStatus(jobId, timeout); // Fetch new status data
    }

    // Handle the job status once it's either "done" or "error"
    if (statusData.status === "done") {
      handleJobDone(statusData);
    } else if (statusData.status === "error") {
      handleJobError(statusData);
    }

  } catch (error: any) {
    console.error("Error in job polling:", error);
    handleJobError({ error: error.message }); // Handle error
  }
};