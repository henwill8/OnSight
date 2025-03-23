import React, { useEffect } from "react";
import { useRouter } from "expo-router";
import { Alert } from "react-native";
import config from "@/config";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      console.log("Checking authentication status...");

      try {
        const response = await fetch(config.API_URL + "/auth/verify-token", {
          method: "GET",
          credentials: "include", // Ensures cookies are sent with the request
        });

        if (response.ok) {
          console.log("Token is valid, navigating to home...");
          router.replace("/(tabs)/home");
        } else {
          console.log("Token is invalid or expired");
          router.replace("/auth/login");
        }
      } catch (error) {
        console.error("Error verifying token:", error);
        router.replace("/auth/login");
      }
    };

    checkAuth();
  }, [router]);

  return null; // Don't render anything while checking authentication
}
