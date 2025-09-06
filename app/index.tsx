import { Text } from "react-native";
import { useAuthRedirect } from "@/hooks/auth/useAuthRedirect";

export default function Index() {
  useAuthRedirect();
  return null;
}
