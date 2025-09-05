import { useSecureStorageObject } from "./secureStorage";

type GymData = {
  gymName: string;
  gymId: string;
  locationId: string;
};

const defaultGymData: GymData = {
  gymName: '',
  gymId: '',
  locationId: ''
};

export function useGymStore() {
  const { value, isLoading, replace, updateFields, clearValue } =
    useSecureStorageObject<GymData>('gymData', defaultGymData);

  return {
    gymData: value,
    isLoading,
    setGymData: replace,      // full replacement
    setGymField: updateFields, // partial field update
    clearGymData: clearValue   // clear all
  };
}
