import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

/**
 * Get a value from secure storage
 */
export async function getSecureItem(key: string): Promise<string | null> {
  try {
    if (Platform.OS === 'web') {
      return localStorage.getItem(key);
    } else {
      return await SecureStore.getItemAsync(key);
    }
  } catch (e) {
    console.error('Error reading secure item', e);
    return null;
  }
}

/**
 * Set a value in secure storage
 */
export async function setSecureItem(key: string, value: string): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      localStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  } catch (e) {
    console.error('Error setting secure item', e);
  }
}

/**
 * Optional: Remove a value from secure storage
 */
export async function removeSecureItem(key: string): Promise<void> {
  try {
    if (Platform.OS === 'web') {
      localStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  } catch (e) {
    console.error('Error removing secure item', e);
  }
}
