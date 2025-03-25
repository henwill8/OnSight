import React, { useState } from "react";
import { useRouter } from "expo-router";
import { Alert, View, Text, TextInput, StyleSheet, TouchableOpacity, Modal, ActivityIndicator } from "react-native";
import config from '@/config';
import { COLORS, SHADOWS, SIZES, globalStyles } from '@/constants/theme';
import { fetchWithTimeout } from "@/utils/api";
import LoadingModal from '@/components/ui/LoadingModal';

export default function RegisterScreen() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false); // Track loading state

  const handleRegister = async () => {
    console.log("Attempting to register user:", username);
    setLoading(true); // Show loading modal

    try {
      console.log("Sending registration request to the server...");
      const response = await fetchWithTimeout(config.API_URL + "/auth/register", {
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
        router.replace("/auth/login"); // Navigate to login page
      } else {
        console.log("Registration failed for user:", username, "Error message:", data.message);
        Alert.alert("Registration Failed", data.message || "Error during registration");
      }
    } catch (error) {
      console.error("Error during registration:", error);
      Alert.alert("Error", "An error occurred while registering");
    } finally {
      setLoading(false); // Hide loading modal
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <View style={styles.innerContainer}>
        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor="white"
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
          placeholderTextColor="white"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="white"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.replace("/auth/login")}>
          <Text style={[globalStyles.link, { textAlign: "center" }]}>Already have an account? Login here</Text>
        </TouchableOpacity>
      </View>

      
      {/* Loading Modal */}
      <LoadingModal visible={loading} message="Registering..." />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.backgroundPrimary,
  },
  innerContainer: {
    width: "75%",
    alignItems: "center",
    justifyContent: "center",
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
