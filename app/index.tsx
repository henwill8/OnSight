import { Text } from "react-native";
import { useAuthRedirect } from "@/hooks/auth/useAuthRedirect";
import { usePathname, useRouter } from "expo-router";

export default function Index() {
  const router = useRouter();
  router.replace("/auth/login")
  return null;
}
