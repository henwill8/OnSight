import React, { useEffect } from "react";
import { useRouter } from "expo-router";
import { getItemAsync } from "expo-secure-store";
import config from "@/config";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      console.log("Checking authentication status...");

      const userToken = await getItemAsync("userToken");
      if (userToken) {
        console.log("Token found, verifying...");
        try {
          const response = await fetch(config.API_URL + "/auth/verify-token", {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${userToken}`,
            },
          });

          console.log(config.API_URL + "/auth/verify-token")

          if (response.ok) {
            console.log("Token is valid, navigating to home...");
            router.replace("/(tabs)/home");
            return;
          } else {
            console.log("Invalid token, redirecting to login...");
            router.replace("/auth/login");
          }
        } catch (error) {
          console.error("Error verifying token:", error);
          router.replace("/auth/login");
        }
      } else {
        console.log("No token found, redirecting to login...");
        router.replace("/auth/login");
      }
    };

    checkAuth();
  }, [router]);

  return null; // Don't render anything while checking authentication
}
