// API paths used in the application
export const API_PATHS = {
  LOGIN: '/api/auth/login',
  REGISTER: '/api/auth/register',
  VERIFY_TOKEN: '/api/auth/verify-token',

  PREDICT: '/api/predict',

  CREATE_ROUTE: '/api/routes/create',
  GET_ROUTE: (routeId: string) => `/api/routes/${routeId}`,
  GET_ROUTES: '/api/routes', // Query params: { gymId: string, locationId: string }

  LIST_GYMS: '/api/gyms',
  CREATE_GYM: '/api/gyms/create',
  GET_GYM: (gymId: string) => `/api/gyms/${gymId}`,

  GET_CHILD_LOCATIONS: (gymId: string) => `/api/gyms/${gymId}/child-locations`, // Query params: { parentId: string }
  GET_LOCATION_ANCESTRY: (locationId: string) => `/api/locations/${locationId}/ancestry`,

  JOB_STATUS: (jobsId: string) => `/api/jobs/${jobsId}`,
  GET_ASSET: (key: string) => `/api/assets/${key}`,
};

// TODO: create a remapping list for paths that change