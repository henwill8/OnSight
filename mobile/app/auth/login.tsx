import React, { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import { setItemAsync, getItemAsync } from "expo-secure-store";
import { Alert, View, Text, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import config from '@/config';

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
        // Verify the token with the server
        try {
          const response = await fetch(config.API_URL + "/verify-token", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${userToken}`, // Attach token for validation
            },
          });

          const data = await response.json();

          if (response.ok) {
            setIsLoggedIn(true); // Token is valid, user is logged in
          } else {// If the token is expired, try refreshing the token
            if (data.message === "Token expired") {
              const refreshResponse = await fetch(config.API_URL + "/refresh-token", {
                method: "POST",
                credentials: "include", // Include cookies in the request
              });
    
              const refreshData = await refreshResponse.json();
    
              if (refreshResponse.ok) {
                await setItemAsync("userToken", refreshData.accessToken); // Store new access token
                setIsLoggedIn(true); // Token is refreshed, user is logged in
              } else {
                Alert.alert("Session Expired", "Your session has expired. Please log in again.");
                await setItemAsync("userToken", ""); // Clear user token
                setIsLoggedIn(false); // Logout user
              }
            }
          }
        } catch (error) {
          console.error(error);
          setIsLoggedIn(false); // In case of error, assume the user is not logged in
        }
      } else {
        setIsLoggedIn(false); // No token, user is not logged in
      }
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      router.replace("/home"); // Navigate to home if logged in
    }
  }, [isLoggedIn, router]); // Ensures navigation happens after login state is updated

  const handleLogin = async () => {
    try {
      const response = await fetch(config.API_URL + "/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        await setItemAsync("userToken", data.accessToken); // Store token
        setIsLoggedIn(true); // Update login state
      } else {
        Alert.alert("Login Failed", data.message || "Invalid username or password");
      }
    } catch (error) {
      console.error(error);
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
        <TouchableOpacity onPress={() => router.push("/auth/register")}>
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
