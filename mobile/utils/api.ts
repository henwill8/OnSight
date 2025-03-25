
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
