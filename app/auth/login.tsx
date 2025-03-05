import React, { useState } from "react";
import { useRouter } from "expo-router";
import { setItemAsync } from "expo-secure-store";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { View, Text, TextInput, StyleSheet, Alert, TouchableOpacity } from "react-native";

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async () => {
    // Replace with actual authentication logic
    if (username === "user" && password === "password") {
      await setItemAsync("userToken", "someUniqueToken"); // Set user token
      router.replace("/(tabs)/home");
    } else {
      Alert.alert("Login Failed", "Invalid username or password");
    }
  };

  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <View style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}>
        <Text style={styles.title}>Test</Text>
      </View>
      <View style={styles.innerContainer}>
        <Text style={styles.loginTitle}>Login</Text>
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    backgroundColor: "dodgerblue", // Set background color to blue
  },
  innerContainer: {
    flex: 1,
    width: "75%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "red"
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "white", // Change text color for better contrast
  },
  loginTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    color: "white", // Change text color for better contrast
  },
  input: {
    width: "100%",
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderRadius: 5,
    borderColor: "white", // Optional: Change border color for better contrast
    color: "white", // Change text color inside the input
  },
  button: {
    backgroundColor: "aquamarine", // Set button background color
    padding: 15, // Adjust padding for the button
    borderRadius: 5, // Round button corners
    width: "100%", // Full width
    alignItems: "center", // Center text
  },
  buttonText: {
    color: "black", // Button text color
    fontSize: 16, // Text size
    fontWeight: "bold", // Text weight
  },
});
