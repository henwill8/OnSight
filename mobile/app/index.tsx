import React, { useEffect, useState } from "react";
import { useRouter } from "expo-router";
import { getItemAsync, setItemAsync } from "expo-secure-store";
import { Alert } from "react-native";
import config from "@/config";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      console.log("Checking authentication status...");

      const userToken = await getItemAsync("userToken");
      if (!userToken) {
        console.log("No token found, redirecting to login...");
        router.replace("/auth/login");
        return;
      }

      console.log("Token found, verifying...");
      try {
        const response = await fetch(config.API_URL + "/auth/verify-token", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        });

        if (response.ok) {
          console.log("Token is valid, navigating to home...");
          router.replace("/(tabs)/home");
        } else {
          console.log("Token is invalid or expired, attempting to refresh...");
          await refreshToken();
        }
      } catch (error) {
        console.error("Error verifying token:", error);
        router.replace("/auth/login");
      }
    };

    const refreshToken = async () => {
      try {
        const refreshResponse = await fetch(config.API_URL + "/auth/refresh-token", {
          method: "POST",
          credentials: "include",
        });

        const refreshData = await refreshResponse.json();

        if (refreshResponse.ok) {
          console.log("Token refreshed successfully.");
          await setItemAsync("userToken", refreshData.accessToken);
          router.replace("/(tabs)/home"); // Navigate to home after refreshing
        } else {
          console.log("Session expired, user needs to log in again.");
          Alert.alert("Session Expired", "Your session has expired. Please log in again.");
          await setItemAsync("userToken", "");
          router.replace("/auth/login");
        }
      } catch (error) {
        console.error("Error refreshing token:", error);
        router.replace("/auth/login");
      }
    };

    checkAuth();
  }, [router]);

  return null; // Don't render anything while checking authentication
}
