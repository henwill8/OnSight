import { useCallback } from 'react';
import { useRouter } from 'expo-router';
import { callApi } from '@/utils/api';
import { usePathname } from 'expo-router';

interface ApiConfig {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
  skipJsonParse?: boolean;
}

export const useApi = () => {
  const router = useRouter();
  const pathname = usePathname();

  const handleUnauthorized = useCallback(() => {
    console.log("Unauthorized access detected, redirecting to login");
    if (pathname !== "/auth/login") {
      router.replace("/auth/login");
    }
  }, [router]);

  const apiCall = useCallback(async <T>(path: string, apiConfig?: ApiConfig): Promise<T> => {
    try {
      return await callApi<T>(path, apiConfig);
    } catch (error: any) {
      // Check if the error is due to unauthorized access
      if (error.status === 401 || error.status === 403) {
        handleUnauthorized();
      }
      throw error;
    }
  }, [handleUnauthorized]);

  return {
    callApi: apiCall,
    handleUnauthorized,
  };
};
