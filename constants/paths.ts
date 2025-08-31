// API paths used in the application
export const API_PATHS = {
  LOGIN: '/v1/auth/login',
  REGISTER: '/v1/auth/register',
  VERIFY_TOKEN: '/v1/auth/verify-token',

  PREDICT: '/v1/predict',

  CREATE_ROUTE: '/v1/routes/create',
  GET_ROUTE: (routeId: string) => `/v1/routes/${routeId}`,
  GET_ROUTES: '/v1/routes', // Query params: { gymId: string, locationId: string }

  LIST_GYMS: '/v1/gyms',
  CREATE_GYM: '/v1/gyms/create',
  GET_GYM: (gymId: string) => `/v1/gyms/${gymId}`,

  GET_CHILD_LOCATIONS: (gymId: string) => `/v1/gyms/${gymId}/child-locations`, // Query params: { parentId: string }
  GET_LOCATION_ANCESTRY: (locationId: string) => `/v1/locations/${locationId}/ancestry`,

  JOB_STATUS: (jobsId: string) => `/v1/jobs/${jobsId}`,
  GET_ASSET: (key: string) => `/v1/assets/${key}`,
};

// TODO: create a remapping list for paths that change