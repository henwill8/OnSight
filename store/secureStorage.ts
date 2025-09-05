import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

import { useState, useEffect, useCallback } from 'react';

/**
 * Generic hook for managing an object in secure storage with state sync.
 *
 * @param key Storage key
 * @param initialValue Default value if nothing is stored
 */
export function useSecureStorage<T extends Record<string, any>>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [isLoading, setIsLoading] = useState(true);

  // Load from storage on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const storedValue = await getSecureItem(key);
        if (storedValue && mounted) {
          setValue(JSON.parse(storedValue) as T);
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

  // Replace full object
  const saveValue = useCallback(
    async (newValue: T) => {
      try {
        setValue(newValue);
        await setSecureItem(key, JSON.stringify(newValue));
      } catch (error) {
        console.error('Error saving secure storage:', error);
      }
    },
    [key]
  );

  // Update a single property
  const setField = useCallback(
    async <K extends keyof T>(field: K, fieldValue: T[K]) => {
      try {
        const updated = { ...value, [field]: fieldValue };
        setValue(updated);
        await setSecureItem(key, JSON.stringify(updated));
      } catch (error) {
        console.error('Error setting field in secure storage:', error);
      }
    },
    [key, value]
  );

  // Remove value from storage
  const clearValue = useCallback(async () => {
    try {
      setValue(initialValue);
      await removeSecureItem(key);
    } catch (error) {
      console.error('Error clearing secure storage:', error);
    }
  }, [key, initialValue]);

  return { value, setValue: saveValue, setField, clearValue, isLoading };
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