import { useEffect } from "react";
import { usePathname, useRouter } from "expo-router";
import { callApi } from "@/utils/api";
import { API_PATHS } from "@/constants/paths";

export const useAuthRedirect = () => {
  const router = useRouter();

  const checkAuth = async () => {
    console.log("Checking auth...")
    try {
      await callApi<Response>(
        API_PATHS.VERIFY_TOKEN,
        { method: "GET", headers: {}, timeout: 5000 },
      );
      router.replace("/(tabs)/home");
    } catch (error) {
      console.error("Auth check failed:", error);
      router.replace("/auth/login");
    }
  }

  useEffect(() => {
    checkAuth();
  }, []);
};
