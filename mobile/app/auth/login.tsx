import React, { useState } from "react";
import { useRouter } from "expo-router";
import { setItemAsync } from "expo-secure-store";
import { Alert, View, Text, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import config from "@/config";

const landingPage = "/(tabs)/home";

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    console.log("Attempting login for user:", username);

    try {
      const response = await fetch(config.API_URL + "/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      });

      const contentType = response.headers.get("Content-Type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error("Invalid response format:", contentType);
        throw new Error("Invalid response format");
      }

      const data = await response.json();

      if (response.ok) {
        console.log("Login successful for user:", username);
        await setItemAsync("userToken", data.accessToken);
        router.replace(landingPage);
      } else {
        console.log("Login failed:", data.message || "Invalid username or password");
        Alert.alert("Login Failed", data.message || "Invalid username or password");
      }
    } catch (error) {
      console.error("Error logging in:", error);
      Alert.alert("Error", "An error occurred while logging in");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login</Text>
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
          <Text style={styles.link}>Don't have an account? Register here</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "dodgerblue",
  },
  innerContainer: {
    flex: 1,
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
    backgroundColor: "aquamarine",
    padding: 15,
    borderRadius: 5,
    width: "100%",
    alignItems: "center",
  },
  buttonText: {
    color: "black",
    fontSize: 16,
    fontWeight: "bold",
  },
  link: {
    marginTop: 10,
    color: "white",
    textDecorationLine: "underline",
  },
});
