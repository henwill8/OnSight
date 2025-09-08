import { useState } from "react";
import { Alert } from "react-native";
import { useRouter } from "expo-router";
import { useApi } from "@/hooks/utils/useApi";
import { API_PATHS } from "@/constants/paths";

export const useRegisterLogic = () => {
  const router = useRouter();
  const { callApi } = useApi();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    console.log("Attempting to register user:", email);
    setLoading(true);

    try {
      console.log("Sending registration request to the server...");
      try {
        await callApi(API_PATHS.REGISTER, { method: "POST", body: { firstName, lastName, email, password } });
        
        Alert.alert("Registration Successful", "You can now log in with your credentials");
        router.replace("/auth/login");
      } catch (error) {
        console.error("Error during registration:", error);
        // The useApi hook already displays an alert, so no need for another here.
      } finally {
        setLoading(false);
      }
    } catch (error) {
      console.error("Error during registration:", error);
      Alert.alert("Error", "An error occurred while registering");
    } finally {
      setLoading(false);
    }
  };

  return {
    firstName,
    setFirstName,
    lastName,
    setLastName,
    email,
    setEmail,
    password,
    setPassword,
    loading,
    handleRegister,
    router,
  };
};
