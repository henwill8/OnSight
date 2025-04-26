import React, { useEffect } from "react";
import { useRouter } from "expo-router";
import { Alert } from "react-native";
import config from "@/config";
import { fetchWithTimeout } from "@/utils/api";
import { API_PATHS } from "@/constants/paths";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      console.log("Checking authentication status...");

      try {
        const response = await fetchWithTimeout(config.API_URL + API_PATHS.VERIFY_TOKEN, {
          method: "GET",
          credentials: "include", // Ensures cookies are sent with the request
        }, 5000);

        if (response.ok) {
          console.log("Token is valid, navigating to home...");
          router.replace("/(tabs)/home");
        } else {
          console.log("Token is invalid or expired");
          router.replace("/auth/login");
        }
      } catch (error) {
        // TODO: Allow user to still view app when offline
        console.error("Error verifying token:", error);
        router.replace("/auth/login");
      }
    };

    checkAuth();
  }, [router]);

  return null; // Don't render anything while checking authentication
}
