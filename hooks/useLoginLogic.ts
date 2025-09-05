import { useState } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import config from "@/config";
import { fetchWithTimeout } from "@/utils/api";
import { API_PATHS } from "@/constants/paths";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";

const landingPage = "/(tabs)/home";

export const useLoginLogic = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useAuthRedirect();

  const handleLogin = async () => {
    console.log("Attempting login for user:", username);
    setLoading(true);

    try {
      const response = await fetchWithTimeout(config.API_URL + API_PATHS.LOGIN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      }, 5000);

      const contentType = response.headers.get("Content-Type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error("Invalid response format:", contentType);
        throw new Error("Invalid response format");
      }

      const data = await response.json();

      if (response.ok) {
        console.log("Login successful for user:", username);
        router.replace(landingPage);
      } else {
        console.log("Login failed:", data.message || "Invalid username or password");
        Alert.alert("Login Failed", data.message || "Invalid username or password");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      Alert.alert("Error", "An error occurred while logging in");
    } finally {
      setLoading(false);
    }
  };

  return {
    username,
    setUsername,
    password,
    setPassword,
    loading,
    handleLogin,
    router,
  };
};
