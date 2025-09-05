import { Text } from "react-native";
import { useAuthRedirect } from "@/hooks/useAuthRedirect";

export default function Index() {
  useAuthRedirect();
  return null;
}
