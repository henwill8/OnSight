import { useState } from "react";
import { Alert } from "react-native";
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

  const handleLogin = async () => {
    console.log("Attempting login for user:", email);
    setLoading(true);

    try {
      const result = await callApi<{ user: UserInfo }>(API_PATHS.LOGIN, {
        method: "POST",
        body: { email, password },
      });

      setUserInfo(result.user)

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
