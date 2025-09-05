import React from 'react';
import { Modal, View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useTheme } from "@/constants/theme";

interface LoadingModalProps {
  visible: boolean;
  message?: string; // Optional message
}

const LoadingModal: React.FC<LoadingModalProps> = ({ visible, message }) => {
  const { colors, spacing, sizes } = useTheme();

  const getStyles = () => StyleSheet.create({
    modalBackground: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.overlay,
    },
    modalContainer: {
      backgroundColor: colors.backgroundSecondary,
      padding: spacing.md,
      borderRadius: sizes.borderRadius / 1.5,
      alignItems: 'center',
    },
    loadingText: {
      marginTop: spacing.sm,
      fontSize: sizes.fontSize,
      color: colors.textPrimary,
    },
  });

  const styles = getStyles();

  return (
    <Modal transparent={true} animationType="fade" visible={visible}>
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <ActivityIndicator size="large" color={colors.textPrimary} />
          {message && <Text style={styles.loadingText}>{message}</Text>}
        </View>
      </View>
    </Modal>
  );
};

export default LoadingModal;
