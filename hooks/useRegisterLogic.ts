import { useState } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import config from '@/config';
import { fetchWithTimeout } from "@/utils/api";
import { API_PATHS } from "@/constants/paths";

export const useRegisterLogic = () => {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    console.log("Attempting to register user:", username);
    setLoading(true);

    try {
      console.log("Sending registration request to the server...");
      const response = await fetchWithTimeout(config.API_URL + API_PATHS.REGISTER, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      }, 5000);

      const data = await response.json();

      if (response.ok) {
        console.log("Registration successful for user:", username);
        Alert.alert("Registration Successful", "You can now log in with your credentials");
        router.replace("/auth/login");
      } else {
        console.log("Registration failed for user:", username, "Error message:", data.message);
        Alert.alert("Registration Failed", data.message || "Error during registration");
      }
    } catch (error) {
      console.error("Error during registration:", error);
      Alert.alert("Error", "An error occurred while registering");
    } finally {
      setLoading(false);
    }
  };

  return {
    username,
    setUsername,
    email,
    setEmail,
    password,
    setPassword,
    loading,
    handleRegister,
    router,
  };
};
