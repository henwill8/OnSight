import { useMemo } from "react";
import { StyleSheet } from "react-native";

// Colors
export const COLORS = {
  backgroundPrimary: "#222222",
  backgroundSecondary: "#333333",
  textPrimary: "#dedede",
  textSecondary: "#c2c2c2",
  primary: "#2f5aa3",
  accent: "#06d6a0",
  error: "#ff4d4d",
  warning: "#ffb84d",
  success: "#4caf50",
  overlay: "rgba(0,0,0,0.5)",
  border: "#dedede",
  shadow: "#000000",
  disabled: "#B0BEC5",
};

// Spacing
export const SPACING = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxs: 3 };

// Font sizes
export const FONT = { title: 24, subtitle: 20, body: 16, caption: 12 };

// Sizes / common dimensions
export const SIZES = {
  padding: 16,
  borderRadius: 15,
  fontSize: FONT.body,
  headerHeight: 125,
  buttonHeight: 56,
  imagePreviewHeight: 400,
  listItemHeight: 80,
  strokeWidth: 4,
  minDrawingDistance: 10,
  simplifyTolerance: 4.0,
  clickTimeThreshold: 200,
  zoomMax: 10.0,
  zoomMin: 0.5,
  zoomStep: 0.5,
  initialZoom: 1.0,
};

// Border radius scale
export const RADIUS = { sm: 8, md: 12, lg: 20 };

// Shadows / elevations
export const SHADOWS = {
  low: { elevation: 2, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 2, shadowColor: COLORS.shadow },
  medium: { elevation: 5, shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.2, shadowRadius: 4, shadowColor: COLORS.shadow },
  high: { elevation: 8, shadowOffset: { width: 0, height: 5 }, shadowOpacity: 0.3, shadowRadius: 6, shadowColor: COLORS.shadow },
};

// Z-index / layering
export const ZINDEX = { modal: 1000, dropdown: 500, toast: 1100 };

// Animation / transitions
export const ANIMATION = { durationShort: 150, durationMedium: 300, durationLong: 500 };

// Breakpoints / grid
export const BREAKPOINTS = { sm: 320, md: 768, lg: 1024 };
export const GRID = { gutter: 16 };

// Global reusable styles
export const globalStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignContent: "center",
    backgroundColor: COLORS.backgroundPrimary,
    padding: SIZES.padding,
  },
  centerItemsContainer: {
    flex: 1,
    justifyContent: "center",
    alignContent: "center",
    backgroundColor: COLORS.backgroundPrimary,
    padding: SIZES.padding,
  },
  link: {
    marginTop: 10,
    color: COLORS.textPrimary,
    textDecorationLine: "underline",
  },
});

// Theme hook
export const useTheme = () => {
  return useMemo(() => ({
    colors: COLORS,
    spacing: SPACING,
    font: FONT,
    sizes: SIZES,
    radius: RADIUS,
    shadows: SHADOWS,
    zIndex: ZINDEX,
    animation: ANIMATION,
    breakpoints: BREAKPOINTS,
    grid: GRID,
    global: globalStyles,
  }), []);
};
