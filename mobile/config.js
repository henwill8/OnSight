const DEV_API_URL = "http://144.38.241.74:8000";  // Development server URL
const PROD_API_URL = "https://thecarpenterwall.com";  // Production server URL

// Set this variable to switch between dev and prod
const ENV = "dev";  // Change this to "prod" when deploying to production

// Determine which API URL to use based on the ENV variable
const API_URL = ENV === "prod" ? PROD_API_URL : DEV_API_URL;

export default {
  API_URL,
  ENV,
};
