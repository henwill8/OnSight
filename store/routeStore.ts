import { create } from 'zustand';

interface RouteStore {
  imageUri: string;
  annotations: any;
  setRouteData: (imageUri: string, annotations: any) => void;
  clearRouteData: () => void;
}

export const useRouteStore = create<RouteStore>((set) => ({
  imageUri: '',
  annotations: null,
  setRouteData: (imageUri, annotations) => set({ imageUri, annotations }),
  clearRouteData: () => set({ imageUri: '', annotations: null }),
}));
