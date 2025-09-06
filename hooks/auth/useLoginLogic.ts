import { useState } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { callApi } from "../../utils/api";
import { API_PATHS } from "@/constants/paths";

const landingPage = "/(tabs)/home";

export const useLoginLogic = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  

  const handleLogin = async () => {
    console.log("Attempting login for user:", email);
    setLoading(true);

    try {

      await callApi(API_PATHS.LOGIN, {
        method: "POST",
        body: { email, password },
      });

      console.log("Login successful for user:", email);
      router.replace(landingPage);

    } catch (error: any) {
      console.error("Error logging in:", error);
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
