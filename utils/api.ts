import { Alert } from 'react-native';
import config from '@/config';
import { fetchWithTimeout } from '@/utils/apiServices';

interface ApiConfig {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  skipJsonParse?: boolean; // Added option to skip JSON parsing
}

export const callApi = async <T>(path: string, apiConfig?: ApiConfig): Promise<T> => {
  const { method = 'GET', headers = {}, body, timeout = 5000, skipJsonParse = false } = apiConfig || {};

  const url = config.API_URL + path;

  const finalHeaders: Record<string, string> = {
    ...headers,
  };

  if (!(body instanceof FormData)) {
    finalHeaders['Content-Type'] = 'application/json';
  }

  try {
    const response = await fetchWithTimeout(
      url,
      {
        method,
        headers: finalHeaders,
        body: body instanceof FormData ? body : (body ? JSON.stringify(body) : undefined),
      },
      timeout
    );

    if (!response.ok) {
      // Handle unauthorized responses specifically
      if (response.status === 401 || response.status === 403) {
        const error = new Error(JSON.stringify({ 
          messages: [`Unauthorized access (${response.status})`],
          status: response.status 
        }));
        (error as any).status = response.status;
        throw error;
      }

      const contentType = response.headers.get('Content-Type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json();
        // Ensure error.messages is always an array of strings
        const messages = Array.isArray(errorData.message) ? errorData.message : [errorData.message || `API error: ${response.status}`];
        throw new Error(JSON.stringify({ messages }));
      } else {
        const errorText = await response.text();
        throw new Error(JSON.stringify({ messages: [`API error: ${response.status}, ${errorText}`] }));
      }
    }

    if (skipJsonParse) {
      return response as T; // Return raw response if skipping JSON parse
    }

    const data = await response.json();
    return data as T;
  } catch (error: any) {
    console.error(`API call to ${path} failed:`, error);
    let errorMessage = "An unexpected error occurred";
    try {
      const parsedError = JSON.parse(error.message);
      if (parsedError && Array.isArray(parsedError.messages)) {
        errorMessage = parsedError.messages.join("\n");
      } else {
        errorMessage = error.message;
      }
    } catch (parseError) {
      errorMessage = error.message;
    }
    Alert.alert("Error", errorMessage);
    throw error;
  }
};

