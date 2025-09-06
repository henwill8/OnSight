import { Alert, View, Text, TextInput, StyleSheet, TouchableOpacity, Modal, ActivityIndicator } from "react-native";
import { useRouter } from "expo-router";
import { useTheme } from '@/constants/theme';
import LoadingModal from '@/components/ui/LoadingModal';
import { useRegisterLogic } from '@/hooks/auth/useRegisterLogic';

const getStyles = (colors: any, global: any) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.backgroundPrimary,
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
      fontSize: 16,
      fontWeight: "bold",
    },
  });
};

export default function RegisterScreen() {
  const { colors, global } = useTheme();
  const {
    username,
    setUsername,
    email,
    setEmail,
    password,
    setPassword,
    loading,
    handleRegister,
    router,
  } = useRegisterLogic();

  const styles = getStyles(colors, global);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>
      <View style={styles.innerContainer}>
        <TextInput
          style={styles.input}
          placeholder="Username"
          placeholderTextColor={colors.textSecondary}
          value={username}
          onChangeText={setUsername}
        />
        <TextInput
          style={styles.input}
          placeholder="Email"
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
        <TouchableOpacity style={styles.button} onPress={handleRegister}>
          <Text style={styles.buttonText}>Register</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => router.replace("/auth/login")}>
          <Text style={[global.link, { textAlign: "center" }]}>Already have an account? Login here</Text>
        </TouchableOpacity>
      </View>

      {/* Loading Modal */}
      <LoadingModal visible={loading} message="Registering..." />
    </View>
  );
}
