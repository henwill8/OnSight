import { useState } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { useApi } from "@/hooks/utils/useApi";
import { API_PATHS } from "@/constants/paths";

const landingPage = "/(tabs)/home";

export const useLoginLogic = () => {
  const router = useRouter();
  const { callApi } = useApi();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    console.log("Attempting login for user:", username);
    setLoading(true);

    try {

      await callApi(API_PATHS.LOGIN, {
        method: "POST",
        body: { username, password },
      });

      console.log("Login successful for user:", username);
      router.replace(landingPage);

    } catch (error: any) {
      console.error("Error logging in:", error);
    } finally {
      setLoading(false);
    }
  };

  return {
    email: username,
    setEmail: setUsername,
    password,
    setPassword,
    loading,
    handleLogin,
    router,
  };
};
