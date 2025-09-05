import { getFileType } from '@/utils/fileUtils';
import { Platform } from 'react-native';
import config from '@/config';
import { API_PATHS } from '@/constants/paths';
import { router } from 'expo-router';

/**
 * Fetches data from a given URL with a specified timeout and retry mechanism.
 * Handles network errors, timeouts, and redirects to login for unauthorized/forbidden responses.
 *
 * @param url The URL to fetch from.
 * @param options Request initialization options (e.g., method, headers, body).
 * @param timeout The maximum time in milliseconds to wait for a response.
 * @param retries The number of times to retry the request if it fails.
 * @param retryDelay The delay in milliseconds between retries.
 * @returns A Promise that resolves to the Response object.
 * @throws An error if the fetch operation ultimately fails or times out after all retries.
 */
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
 * Fetches the status of a job from the API.
 *
 * @param jobId The ID of the job to fetch the status for.
 * @param timeout The maximum time in milliseconds to wait for a response.
 * @returns A Promise that resolves to the job status data, or null if an error occurs.
 */
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

/**
 * Polls the job status at regular intervals until the job is done or an error occurs.
 *
 * @param jobId The ID of the job to poll.
 * @param intervalLength The interval in milliseconds between status checks.
 * @param handleJobDone Callback function to handle the job completion data.
 * @param handleJobError Callback function to handle job errors.
 * @param timeout The maximum time in milliseconds to wait for each status fetch.
 */
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