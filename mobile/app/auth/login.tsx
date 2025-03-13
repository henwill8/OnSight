import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { setItemAsync, getItemAsync } from "expo-secure-store";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Alert, View, Text, TextInput, StyleSheet, TouchableOpacity } from "react-native";

const nextScreen = "/home"

export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user token exists in secure storage to determine if logged in
    const checkAuth = async () => {
      const userToken = await getItemAsync("userToken");
      if (userToken) {
        setIsLoggedIn(true); // If token exists, user is logged in
      } else {
        setIsLoggedIn(false); // If no token, user is not logged in
      }
    };

    checkAuth();
  }, []); // Empty dependency array to run once when the component mounts

  useEffect(() => {
    if (isLoggedIn) {
      router.replace("/home"); // Navigate to home if logged in
    }
  }, [isLoggedIn, router]); // Ensures navigation happens after login state is updated

  const handleLogin = async () => {
    if (true) {// TODO: switch this to actual login checking
      await setItemAsync("userToken", "someUniqueToken"); // Set user token
      setIsLoggedIn(true); // Update login state
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
    justifyContent: "center"
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