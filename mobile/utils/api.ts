import config from '@/config';
import { API_PATHS } from '@/constants/paths';

export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeout: number = 5000
): Promise<Response> {
  console.log(`[fetchWithTimeout] Starting request to ${url} with timeout: ${timeout}ms`);
  
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(timer);
    return response;
  } catch (error: any) {
    clearTimeout(timer);

    if (error.name === "AbortError" || error.message.includes("aborted")) {
      console.error(`[fetchWithTimeout] Request to ${url} was aborted due to timeout.`);
      throw new Error("Request timed out");
    }

    console.error(`[fetchWithTimeout] Request to ${url} failed:`, error);
    throw error;
  }
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