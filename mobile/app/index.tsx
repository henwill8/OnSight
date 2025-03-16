import React, { useEffect } from "react";
import { useRouter } from "expo-router";

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/auth/login");
    }, 0);
    return () => clearTimeout(timer); // Clean up the timeout
  }, [router]);

  return null;
}
