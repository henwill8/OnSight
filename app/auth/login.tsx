import { Alert, View, Text, TextInput, StyleSheet, TouchableOpacity, Modal, ActivityIndicator } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { useTheme } from '@/constants/theme';
import LoadingModal from '@/components/ui/LoadingModal';
import { useLoginLogic } from '@/hooks/auth/useLoginLogic';
import { useAuthRedirect } from "@/hooks/auth/useAuthRedirect";
import { useCallback, useEffect } from "react";


const getStyles = (colors: any, global: any, font: any) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      padding: 40,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.backgroundPrimary,
    },
    innerContainer: {
      width: "100%",
    },
    title: {
      fontSize: font.h3,
      fontWeight: "bold",
      marginBottom: 20,
      color: colors.textPrimary,
    },
    input: {
      width: "100%",
      padding: 10,
      marginBottom: 10,
      borderWidth: 1,
      borderRadius: 5,
      borderColor: colors.border,
      color: colors.textPrimary,
      fontSize: font.body,
    },
    button: {
      backgroundColor: colors.primary,
      padding: 15,
      borderRadius: 5,
      width: "100%",
      alignItems: "center",
    },
    buttonText: {
      color: colors.textPrimary,
      fontSize: font.body,
      fontWeight: "bold",
    },
  });
};

export default function LoginScreen() {
  const { colors, global, font } = useTheme();
  const { email, setEmail, password, setPassword, loading, handleLogin, router } = useLoginLogic();

  const styles = getStyles(colors, global, font);

  const { checkAuth } = useAuthRedirect();

  useFocusEffect(() => {
    checkAuth();
  })

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { marginBottom: 20 }]}>Login</Text>
      <View style={styles.innerContainer}>
        <TextInput
          style={styles.input}
          placeholder="Username or Email"
          placeholderTextColor={colors.textSecondary}
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor={colors.textSecondary}
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <Text style={styles.buttonText}>Login</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.replace("/auth/register")}>
          <Text style={[global.link, { textAlign: "center", fontSize: font.caption }]}>Don't have an account? Register here</Text>
        </TouchableOpacity>
      </View>

      {/* Loading Modal */}
      <LoadingModal visible={loading} message="Loading..." />
    </View>
  );
}
