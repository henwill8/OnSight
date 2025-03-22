import React, { useState } from "react";
import { useRouter } from "expo-router";
import { Alert, View, Text, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import config from '@/config';
import { COLORS, SHADOWS, SIZES, globalStyles } from '@/constants/theme';

export default function RegisterScreen() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleRegister = async () => {
    console.log("Attempting to register user:", username);

    try {
      console.log("Sending registration request to the server...");
      const response = await fetch(config.API_URL + "/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center", // Centers content horizontally
    justifyContent: "center", // Centers content vertically
    backgroundColor: COLORS.backgroundPrimary, // You can replace this with your color
  },
  innerContainer: {
    width: "75%", // Adjust the width as per your requirement
    alignItems: "center",
    justifyContent: "center", // Ensures content is centered within inner container
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "white",
  },
  input: {
    width: "100%", // Takes full width of inner container
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: "white",
    color: "white",
  },
  button: {
    backgroundColor: COLORS.primary, // Ensure COLORS.primary exists in your theme
    padding: 15,
    borderRadius: 5,
    width: "100%", // Takes full width of inner container
    alignItems: "center",
  },
  buttonText: {
    color: COLORS.textPrimary, // Ensure COLORS.textPrimary exists in your theme
    fontSize: 16,
    fontWeight: "bold",
  },
});
