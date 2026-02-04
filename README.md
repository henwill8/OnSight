# OnSight Frontend

OnSight is a React Native mobile application built with Expo for managing and visualizing climbing routes. The app allows users to browse gyms, view climbing routes, create new routes with AI-powered hold detection, and manage their climbing profile.

## Overview

OnSight is a cross-platform mobile application (iOS, Android, Web) that provides an intuitive interface for climbers to:
- Browse and search climbing gyms and locations
- View climbing routes with interactive route images
- Create new routes with automatic hold detection using ML
- Annotate routes with difficulty ratings and descriptions
- Manage user profiles and preferences

## Technology Stack

### Core Framework
- **React Native**: 0.79.2
- **Expo**: ^53.0.0 (SDK 53)
- **Expo Router**: ~5.0.6 (file-based routing)
- **TypeScript**: ~5.8.3

### State Management
- **Zustand**: ^5.0.8 (lightweight state management)
- Custom stores for:
  - User authentication
  - Gym and location data
  - Route data
  - User preferences

### UI & Graphics
- **React Native Paper**: ^5.14.5 (Material Design components)
- **React Native Skia**: v2.0.0-next.4 (high-performance graphics)
- **Expo Image**: ~2.1.7 (optimized image loading)
- **React Native SVG**: 15.11.2
- **Expo Draw**: Custom drawing capabilities

### Navigation
- **Expo Router**: File-based routing with typed routes
- **React Navigation**: Bottom tabs and stack navigation

### Image & Media
- **Expo Image Picker**: ~16.1.4
- **Expo Image Manipulator**: ~13.1.6
- **React Native View Shot**: ~4.0.3 (capture views as images)
- **React Native Zoomable View**: Custom zoom/pan implementation

### Networking
- **Axios**: ^1.8.4 (HTTP client)
- Custom API service layer with authentication

### Storage
- **Expo Secure Store**: ~14.2.3 (secure token storage)
- **AsyncStorage**: ^2.2.0 (local data persistence)

### Other Key Dependencies
- **React Native Reanimated**: ~3.17.4 (animations)
- **React Native Gesture Handler**: ~2.24.0
- **Expo Haptics**: ~14.1.4 (tactile feedback)

## Project Structure

```
Onsight/
├── app/                    # Expo Router pages
│   ├── (tabs)/            # Tab navigation screens
│   │   ├── home.tsx       # Main route browsing screen
│   │   ├── chooseGym.tsx  # Gym selection
│   │   └── profile/       # User profile screens
│   ├── auth/              # Authentication screens
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── routes/            # Route management screens
│   │   ├── createRoute.tsx
│   │   ├── routeDetail.tsx
│   │   └── routeImageCreator.tsx
│   ├── _layout.tsx        # Root layout
│   └── index.tsx          # Entry/redirect screen
├── components/            # Reusable components
│   ├── RouteImage/        # Route image components
│   │   ├── RouteImage.tsx
│   │   ├── ClimbingHoldOverlay.tsx
│   │   └── DrawingCanvas.tsx
│   ├── PerspectiveTransformer.tsx
│   └── ui/                # UI components
├── hooks/                 # Custom React hooks
│   ├── auth/             # Authentication hooks
│   ├── gyms/             # Gym data hooks
│   ├── routes/           # Route data hooks
│   └── utils/            # Utility hooks
├── storage/               # Zustand stores
│   ├── gymStore.tsx
│   ├── locationStore.tsx
│   ├── routeStore.tsx
│   ├── userInfoStore.tsx
│   └── genericStore.tsx
├── utils/                 # Utility functions
│   ├── api.ts            # API client configuration
│   ├── apiServices.ts    # API service functions
│   ├── annotationUtils.ts
│   ├── geometricUtils.ts
│   ├── ImageUtils.ts
│   └── secureStorageUtils.ts
├── constants/             # App constants
│   ├── paths.ts          # API endpoint paths
│   └── theme.ts          # Theme configuration
└── types/                 # TypeScript type definitions
    ├── annotationTypes.ts
    └── index.ts
```

## Key Features

### 1. Route Browsing & Management

**Home Screen** (`app/(tabs)/home.tsx`):
- Displays routes for selected gym/location
- Filter by difficulty level
- Sort by name or difficulty
- Navigate location hierarchy with breadcrumbs
- Tap routes to view details

**Route Detail** (`app/routes/routeDetail.tsx`):
- View route image with hold overlays
- Display route metadata (difficulty, name, description)
- View ratings and comments

**Create Route** (`app/routes/createRoute.tsx`):
- Upload route image
- Automatic hold detection via ML API
- Manual hold annotation tools
- Set difficulty, name, and description
- Save route to gym/location

### 2. Gym & Location Management

**Gym Selection** (`app/(tabs)/chooseGym.tsx`):
- Browse available gyms
- Search and filter gyms
- Select gym and location
- View gym details

**Location Hierarchy**:
- Support for nested locations (e.g., "Main Wall" → "Left Section")
- Breadcrumb navigation
- Location-based route filtering

### 3. Route Image Creator

**Route Image Creator** (`app/routes/routeImageCreator.tsx`):
- Interactive image annotation
- Draw and edit climbing hold overlays
- Perspective transformation tools
- Export annotated images

### 4. User Authentication

**Authentication Flow**:
- Login with email/password
- User registration
- JWT token management
- Secure token storage
- Automatic token refresh

**Profile Management** (`app/(tabs)/profile/`):
- View user profile
- Edit profile information
- Manage preferences

## Setup & Installation

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (optional, included with project)
- iOS Simulator (for iOS development) or Android Emulator (for Android development)

### Installation

```bash
# Navigate to frontend directory
cd Onsight

# Install dependencies
npm install

# Start development server
npm start
```

### Development Commands

```bash
# Start Expo development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Build for web
npm run build:web

# Serve web build
npm run serve:web

# Run tests
npm test

# Lint code
npm run lint
```

### Environment Configuration

Create a `.env` file or configure environment variables:

```env
# API Base URL
EXPO_PUBLIC_API_URL=http://localhost:3000

# Or for production
EXPO_PUBLIC_API_URL=https://api.onsight.com
```

Update API configuration in `utils/api.ts` if needed.

## State Management

The app uses Zustand for state management with several stores:

### Gym Store (`storage/gymStore.tsx`)
- Current selected gym
- Gym data persistence

### Location Store (`storage/locationStore.tsx`)
- Current selected location
- Location hierarchy data

### Route Store (`storage/routeStore.tsx`)
- Current route being viewed/edited
- Route data cache

### User Info Store (`storage/userInfoStore.tsx`)
- User authentication state
- User profile data

### Generic Store (`storage/genericStore.tsx`)
- Reusable store pattern for other data types

## API Integration

The app communicates with the OnSight backend API. API endpoints are defined in `constants/paths.ts`:

- **Authentication**: `/v1/auth/*`
- **Predictions**: `/v1/predict`, `/v1/jobs/:jobId`
- **Routes**: `/v1/routes/*`
- **Templates**: `/v1/templates/*`
- **Gyms**: `/v1/gyms/*`
- **Assets**: `/v1/assets/:key`

API client configuration is in `utils/api.ts`, and service functions are in `utils/apiServices.ts`.

## Theme & Styling

The app uses a custom theme system defined in `constants/theme.ts`:

- **Colors**: Primary, secondary, background, text colors
- **Spacing**: Consistent spacing scale
- **Typography**: Font sizes and weights
- **Shadows**: Elevation shadows for components

Components use the `useTheme` hook to access theme values:

```typescript
const { colors, spacing, font } = useTheme();
```

## Building for Production

### iOS

```bash
# Build iOS app
npm run ios

# Or use EAS Build
eas build --platform ios
```

### Android

```bash
# Build Android app
npm run android

# Or use EAS Build
eas build --platform android
```

### Web

```bash
# Build web version
npm run build:web

# Serve locally
npm run serve:web
```

The project includes build scripts:
- `buildAndroid.ps1` - Android build script
- `buildiOS.ps1` - iOS build script

## Platform-Specific Considerations

### iOS
- Supports tablets
- Uses native navigation patterns
- Haptic feedback support

### Android
- Adaptive icon support
- Material Design components
- Cleartext traffic enabled for development (should be disabled in production)

### Web
- Single bundle output
- Metro bundler
- Responsive design

## Key Components

### RouteImage Component

The `RouteImage` component (`components/RouteImage/RouteImage.tsx`) is a core component that:
- Displays route images
- Overlays climbing hold annotations
- Supports zoom and pan
- Renders hold polygons using React Native Skia

### Drawing Canvas

The `DrawingCanvas` component enables:
- Interactive drawing on route images
- Hold annotation creation
- Touch-based editing

### Perspective Transformer

The `PerspectiveTransformer` component provides:
- Image perspective correction
- Transform matrix calculations
- Geometric transformations

## Development Tips

1. **Hot Reload**: Expo provides fast refresh for instant updates during development
2. **Type Safety**: The project uses TypeScript for type safety - check types before committing
3. **State Management**: Use Zustand stores for global state, local state for component-specific data
4. **API Calls**: Use custom hooks in `hooks/` directory for data fetching
5. **Navigation**: Use Expo Router's typed routes for type-safe navigation

## Troubleshooting

### Metro Bundler Issues
```bash
# Clear cache and restart
npm start -- --clear
```

### iOS Build Issues
- Ensure Xcode is properly configured
- Check iOS deployment target in `app.json`

### Android Build Issues
- Ensure Android SDK is installed
- Check `buildAndroid.ps1` script configuration

### API Connection Issues
- Verify `EXPO_PUBLIC_API_URL` is set correctly
- Check backend server is running
- Verify CORS settings on backend

## License

Private - All rights reserved
