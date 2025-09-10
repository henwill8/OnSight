import { useState } from "react";
import { Platform, Alert } from "react-native";
import { useRouter } from "expo-router";
import { useApi } from "@/hooks/utils/useApi";
import { API_PATHS } from "@/constants/paths";
import { useUserInfoStore, UserInfo } from "@/storage/userInfoStore";

const landingPage = "/(tabs)/home";

export const useLoginLogic = () => {
  const router = useRouter();
  const { callApi } = useApi();
  const { setData: setUserInfo } = useUserInfoStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const showError = (title: string, message: string) => {
    if (Platform.OS === "web") {
      // Use browser’s alert on web
      window.alert(`${title}\n\n${message}`);
    } else {
      // Use native Alert on iOS/Android
      Alert.alert(title, message, [{ text: "OK" }]);
    }
  };

  const handleLogin = async () => {
    console.log("Attempting login for user:", email);
    setLoading(true);

    try {
      const result = await callApi<{ user: UserInfo }>(API_PATHS.LOGIN, {
        method: "POST",
        body: { email, password },
      });

      setUserInfo(result.user);
      console.log("Login successful for user:", email);

      router.replace(landingPage);
    } catch (error: any) {
      console.error("Error logging in:", error);

      if (error?.status === 401) {
        showError("Login Failed", "Invalid email or password, please try again.");
      } else if (error?.message?.includes("Network")) {
        showError(
          "Connection Error",
          "Unable to connect to the server. Please check your internet connection and try again."
        );
      } else {
        showError("Error", "Something went wrong while logging in. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    loading,
    handleLogin,
    router,
  };
};
