import { getFileType } from '@/utils/fileUtils';
import { Platform } from 'react-native';
import config from '@/config';
import { API_PATHS } from '@/constants/paths';
import { Alert } from 'react-native';

export const fetchWithTimeout = async (
  url: string,
  options: RequestInit = {},
  timeout: number = 5000,
  retries: number = 3,
  retryDelay: number = 100,
  handleUnauthorized?: (response: Response) => void
): Promise<Response> => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);

    console.log(`[fetchWithTimeout] Attempt ${attempt}/${retries} to ${url} with timeout: ${timeout}ms`);

    try {
      const response = await fetch(url, { ...options, signal: controller.signal, credentials: 'include' });
      clearTimeout(timer);

      if (response.status === 401 || response.status === 403) {
        console.warn(`[fetchWithTimeout] Unauthorized (${response.status})`);
        if (handleUnauthorized) {
          handleUnauthorized(response);
        }
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

      if (isTimeout) {
        throw error;
      }

      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }

  throw new Error("fetchWithTimeout: exhausted retries without success.");
};

export const fetchJobStatus = async (jobId: string, timeout: number) => {
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

    if (!statusData) return;

    while (statusData.status !== "done" && statusData.status !== "error") {
      console.log(`Job status: ${statusData.status}`);
      await new Promise(resolve => setTimeout(resolve, intervalLength));

      statusData = await fetchJobStatus(jobId, timeout);
    }

    if (statusData.status === "done") {
      handleJobDone(statusData);
    } else if (statusData.status === "error") {
      handleJobError(statusData);
    }

  } catch (error: any) {
    console.error("Error in job polling:", error);
    handleJobError({ error: error.message });
  }
};
