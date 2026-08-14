# OnSight Frontend

OnSight is a React Native app for managing and viewing climbing routes. Routes are organized by gym and location, allowing users to browse different sections of a gym and view route images, difficulty, names, and descriptions.

The main part of the app is working with route images. When creating a route, users can upload an image of a climbing wall and send it to the backend for automatic hold detection. The detected holds are displayed over the image and can be edited manually if needed. The app also includes tools for drawing holds and adjusting the perspective of an image.

The frontend uses React Native with Expo and TypeScript. Expo Router handles navigation, Zustand is used for shared state, and React Native Skia is used for displaying and editing hold overlays. API requests are made to the OnSight backend.

## Setup

The project requires Node.js 18+ and npm or yarn.

```bash
cd Onsight
npm install
```

Create a `.env` file containing the backend URL:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
```

Start the development server with:

```bash
npm start
```

The app can then be opened through Expo on an emulator or physical device. The backend must also be running and accessible for authentication, route data, and hold detection.

For web:

```bash
npm run build:web
npm run serve:web
```
