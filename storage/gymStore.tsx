import { createStore } from "./genericStore"

interface Gym {
  id: string;
  name: string;
  location: string;
}

const defaultGym: Gym = {
  id: '',
  name: '',
  location: ''
};

export const GymStore = createStore({
  storageKey: 'gym_data',
  defaultValue: defaultGym,
  contextName: 'Gym'
});

export const GymProvider = GymStore.Provider;
export const useGymStore = GymStore.useStore;
