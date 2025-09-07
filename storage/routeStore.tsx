import { createStore } from "./genericStore"
import { AnnotationsData } from "@/types/annotationTypes";

export interface Route {
  imageUri: string;
  annotations: AnnotationsData | null;
}

const defaultRoute: Route = {
  imageUri: '',
  annotations: null
};

// Route store should only be used when needing to persist a single routes data across pages
export const RouteStore = createStore({
  storageKey: 'route_data',
  defaultValue: defaultRoute,
  contextName: 'Route'
});

export const RouteProvider = RouteStore.Provider;
export const useRouteStore = RouteStore.useStore;