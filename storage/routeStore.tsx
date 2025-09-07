import { createStore } from "./genericStore"
import { AnnotationsData } from "@/types/annotationTypes";

export interface Route {
  imageUri: string;
  annotations: AnnotationsData;
}

const defaultRoute: Route = {
  imageUri: '',
  annotations: {
    climbingHolds: [],
    drawingPaths: [],
    history: []
  }
};

// Route store should only be used for route creation (where there is only one route and it needs to persist across pages)
export const RouteStore = createStore({
  storageKey: 'route_data',
  defaultValue: defaultRoute,
  contextName: 'Route'
});

export const RouteProvider = RouteStore.Provider;
export const useRouteStore = RouteStore.useStore;