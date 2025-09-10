import { Platform } from 'react-native';

interface Storage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

class WebStorage implements Storage {
  async getItem(key: string): Promise<string | null> {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      localStorage.setItem(key, value);
    } catch {
      // Handle storage errors silently
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      localStorage.removeItem(key);
    } catch {
      // Handle storage errors silently
    }
  }
}

class MobileStorage implements Storage {
  private AsyncStorage: any;

  constructor() {
    // Dynamically import AsyncStorage only on mobile
    if (Platform.OS !== 'web') {
      this.AsyncStorage = require('@react-native-async-storage/async-storage').default;
    }
  }

  async getItem(key: string): Promise<string | null> {
    try {
      return await this.AsyncStorage.getItem(key);
    } catch {
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      await this.AsyncStorage.setItem(key, value);
    } catch {
      // Handle storage errors silently
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await this.AsyncStorage.removeItem(key);
    } catch {
      // Handle storage errors silently
    }
  }
}

// Create platform-specific storage instance
export const storage: Storage = Platform.OS === 'web' 
  ? new WebStorage() 
  : new MobileStorage();