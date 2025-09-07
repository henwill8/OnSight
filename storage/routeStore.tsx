import { createStore } from "./genericStore"

interface Route {
  imageUri: string;
  annotations: string;
}

const defaultRoute: Route = {
  imageUri: '',
  annotations: '',
};

export const RouteStore = createStore({
  storageKey: 'route_data',
  defaultValue: defaultRoute,
  contextName: 'Route'
});

export const RouteProvider = RouteStore.Provider;
export const useRouteStore = RouteStore.useStore;