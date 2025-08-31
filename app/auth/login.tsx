import React, { useState } from "react";
import { useRouter } from "expo-router";
import { Alert, View, Text, TextInput, StyleSheet, TouchableOpacity, Modal, ActivityIndicator } from "react-native";
import config from "@/config";
import { COLORS, SHADOWS, SIZES, globalStyles } from '@/constants/theme';
import { fetchWithTimeout } from "@/utils/api";
import LoadingModal from '@/components/ui/LoadingModal';
import { API_PATHS } from "@/constants/paths";

const landingPage = "/(tabs)/home";

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // Track loading state

  const handleLogin = async () => {
    console.log("Attempting login for user:", username);
    setLoading(true); // Show loading modal

    try {
      const response = await fetchWithTimeout(config.API_URL + API_PATHS.LOGIN, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      }, 5000);

      const contentType = response.headers.get("Content-Type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error("Invalid response format:", contentType);
        throw new Error("Invalid response format");
      }

      const data = await response.json();

      if (response.ok) {
        console.log("Login successful for user:", username);
        router.replace(landingPage);
      } else {
        console.log("Login failed:", data.message || "Invalid username or password");
        Alert.alert("Login Failed", data.message || "Invalid username or password");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      Alert.alert("Error", "An error occurred while logging in");
    } finally {
      setLoading(false); // Hide loading modal
    }
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { marginBottom: 20 }]}>Login</Text>
      <View style={styles.innerContainer}>
        <TextInput
          style={styles.input}
          placeholder="Username or Email"
          placeholderTextColor="white"
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="white"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.replace("/auth/register")}>
          <Text style={[globalStyles.link, { textAlign: "center" }]}>Don't have an account? Register here</Text>
        </TouchableOpacity>
      </View>

      {/* Loading Modal */}
      <LoadingModal visible={loading} message="Loading..." />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.backgroundPrimary,
  },
  innerContainer: {
    width: "100%",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "white",
  },
  input: {
    width: "100%",
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: "white",
    color: "white",
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: "bold",
  },
});
