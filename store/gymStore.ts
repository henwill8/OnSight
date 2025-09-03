import { create } from 'zustand';

interface GymStore {
  gymName: string;
  gymId: string;
  locationId: string;
  setGymData: (gymName: string, gymId: string, locationId: string) => void;
  setLocationId: (locationId: string) => void;
  clearGymData: () => void;
}

export const useGymStore = create<GymStore>((set) => ({
  gymName: "",
  gymId: "",
  locationId: "",
  setGymData: (gymName, gymId, locationId) => set({ gymName, gymId, locationId }),
  setLocationId: (locationId) => set({locationId}),
  clearGymData: () => set({ gymName: '', gymId: '', locationId: '' }),
}));
