import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { useState, useEffect, useCallback } from 'react';

export function useSecureStorageObject<T extends Record<string, any>>(
  key: string,
  initialValue: T
) {
  const [value, setValueState] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const storedValue = await getSecureItem(key);
        if (storedValue && mounted) {
          setValueState(JSON.parse(storedValue) as T);
        }
      } catch (error) {
        console.error('Error loading secure storage:', error);
      } finally {
        if (mounted) setIsLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [key]);

  const clearValue = useCallback(async () => {
    try {
      setValueState(initialValue);
      await removeSecureItem(key);
    } catch (error) {
      console.error('Error clearing secure storage:', error);
    }
  }, [key, initialValue]);

  // Full replace
  const replace = useCallback(
    async (newValue: T) => {
      try {
        setValueState(newValue);
        await setSecureItem(key, JSON.stringify(newValue));
      } catch (error) {
        console.error('Error saving secure storage:', error);
      }
    },
    [key]
  );

  // Partial update
  const updateFields = useCallback(
    async (partial: Partial<T>) => {
      try {
        const updated = { ...value, ...partial };
        setValueState(updated);
        await setSecureItem(key, JSON.stringify(updated));
      } catch (error) {
        console.error('Error updating fields in secure storage:', error);
      }
    },
    [key, value]
  );

  return {
    value,
    isLoading,
    replace,
    updateFields,
    clearValue
  };
}


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