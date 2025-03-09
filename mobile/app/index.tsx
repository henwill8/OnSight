import { useEffect } from "react";
import { useRouter } from "expo-router";
import { getItemAsync } from "expo-secure-store";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
      const userToken = await getItemAsync("userToken"); // Check login status
    //   if (userToken) {
    //     router.replace("/(tabs)/home"); // Go to main app if logged in
    //   } else {
        router.replace("/auth/login"); // Go to login if not logged in
    //   }
    };

    checkAuth();
  }, []);

  return null; // Empty screen, just used for redirection
}
