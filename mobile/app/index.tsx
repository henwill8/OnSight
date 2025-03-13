import React, { useEffect } from "react";
import { useRouter } from "expo-router"; // Import useRouter

export default function Index() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace("/auth/login");
    }, 0); // You can adjust the timeout duration if necessary
    return () => clearTimeout(timer); // Clean up the timeout
  }, [router]);

  return null;
}
