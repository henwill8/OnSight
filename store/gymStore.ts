import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface GymData {
  gymName: string;
  gymId: string;
  locationId: string;
}

interface GymStore extends GymData {
  isLoading: boolean;
  setField: <K extends keyof GymData>(field: K, value: GymData[K]) => void;
  setValue: (data: Partial<GymData>) => void;
  clear: () => void;
  setLoading: (loading: boolean) => void;
}

const defaultGymData: GymData = {
  gymName: '',
  gymId: '',
  locationId: '',
};

export const useGymStore = create<GymStore>()(
  persist(
    (set, get) => ({
      // Initial state
      ...defaultGymData,
      isLoading: false,

      // Actions
      setField: (field, value) => 
        set((state) => ({ [field]: value })),

      setValue: (data) => 
        set((state) => ({ ...state, ...data })),

      clear: () => 
        set(() => ({ ...defaultGymData, isLoading: false })),

      setLoading: (loading) => 
        set(() => ({ isLoading: loading })),
    }),
    {
      name: 'gym-data', // storage key
      storage: createJSONStorage(() => 
        Platform.OS === 'web' ? localStorage : AsyncStorage
      ),
      // Only persist the gym data, not the loading state
      partialize: (state) => ({
        gymName: state.gymName,
        gymId: state.gymId,
        locationId: state.locationId,
      }),
    }
  )
);

// Optional: Create a hook that mimics your original API
export function useGymStoreCompat() {
  const store = useGymStore();
  
  return {
    store: {
      gymName: store.gymName,
      gymId: store.gymId,
      locationId: store.locationId,
      setField: store.setField,
      setValue: store.setValue,
      clear: store.clear,
    },
    isLoading: store.isLoading,
  };
}