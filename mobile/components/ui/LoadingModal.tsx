import React from 'react';
import { Modal, View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { COLORS } from '@/constants/theme';

interface LoadingModalProps {
  visible: boolean;
  message?: string; // Optional message
}

const LoadingModal: React.FC<LoadingModalProps> = ({ visible, message }) => {
  return (
    <Modal transparent={true} animationType="fade" visible={visible}>
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <ActivityIndicator size="large" color={COLORS.textPrimary} />
          {message && <Text style={styles.loadingText}>{message}</Text>}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: COLORS.backgroundSecondary,
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: COLORS.textPrimary,
  },
});

export default LoadingModal;
