import { createStore } from "./genericStore"

interface Location {
  id: string;
  name: string;
}

const defaultLocation: Location = {
  id: '',
  name: '',
};

export const LocationStore = createStore({
  storageKey: 'location_data',
  defaultValue: defaultLocation,
  contextName: 'Location'
});

export const LocationProvider = LocationStore.Provider;
export const useLocationStore = LocationStore.useStore;