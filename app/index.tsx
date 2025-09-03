import React, { useEffect, useState } from "react";
import { Text } from "react-native";
import { useRouter } from "expo-router";
import config from "@/config";
import { fetchWithTimeout } from "@/utils/api";
import { API_PATHS } from "@/constants/paths";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetchWithTimeout(
          config.API_URL + API_PATHS.VERIFY_TOKEN,
          { method: "GET", credentials: "include" },
          5000
        );

        if (response.ok) {
          router.replace("/(tabs)/home");
        } else {
          router.replace("/auth/login");
        }
      } catch {
        router.replace("/auth/login");
      }
    };
    checkAuth();
  }, [router]);

  return null;
}
