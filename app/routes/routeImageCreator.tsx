import React, { useRef, useState, useCallback, useEffect, useLayoutEffect } from 'react';
import { Alert, Text, ActivityIndicator, Modal, View, Image, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { useLocalSearchParams, useRouter, useNavigation } from "expo-router";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RouteImage, { RouteImageRef } from "@/components/RouteImage/RouteImage";
import { useTheme } from '@/constants/theme';
import { HOLD_SELECTION_COLORS } from '@/types/annotationTypes';
import { AntDesign, Feather } from '@expo/vector-icons';
import { useRouteImageCreatorLogic } from '@/hooks/routes/useRouteImageCreatorLogic';
import LoadingModal from '@/components/ui/LoadingModal';
import { G } from 'react-native-svg';

const getStyles = (colors: any, sizes: any, shadows: any, font: any, spacing: any) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      position: 'relative',
      backgroundColor: colors.backgroundPrimary
    },
    sidebar: {
      position: "absolute",
      right: spacing.md,
      top: spacing.xxl,
      backgroundColor: colors.backgroundSecondary,
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.xs,
      borderRadius: sizes.borderRadius,
      alignItems: "center",
      zIndex: 20,
      shadowColor: shadows.medium.shadowColor,
      elevation: shadows.medium.elevation,
    },
    sidebarButton: {
      width: 40,
      height: 40,
      borderRadius: 40 / 2,
      marginVertical: spacing.xs,
      borderWidth: 4,
      borderColor: 'transparent',
    },
    sidebarUndo: {
      width: 40,
      height: 40,
      borderRadius: 40 / 2,
      marginTop: spacing.sm,
      backgroundColor: colors.error,
      justifyContent: "center",
      alignItems: "center",
    },
    checkButton: {
      position: "absolute",
      bottom: spacing.lg,
      right: `50%`,
      transform: [{ translateX: spacing.lg }],
      width: 50,
      height: 50,
      borderRadius: 50 / 2,
      backgroundColor: colors.success,
      justifyContent: "center",
      alignItems: "center",
      elevation: shadows.medium.elevation,
      shadowColor: shadows.medium.shadowColor,
    },
  });
};

const RouteImageCreator: React.FC = () => {
  const { colors, sizes, shadows, font, spacing, global } = useTheme();
  const routeImageRef = useRef<RouteImageRef>(null);
  const {
    imageUri,
    annotations,
    imageDimensions,
    scaleX,
    scaleY,
    dataReceived,
    showUnselectedHolds,
    selectedColor,
    handleColorSelect,
    handleExport,
    handleUndo,
    handleError,
    navigation,
  } = useRouteImageCreatorLogic(routeImageRef);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Create Route Image",
      headerStyle: { backgroundColor: colors.backgroundSecondary },
      headerTintColor: "white"
    });
  }, [navigation, colors.backgroundSecondary]);

  const styles = getStyles(colors, sizes, shadows, font, spacing);

  return (
    <View style={[global.centerItemsContainer, { alignItems: "center" }]}>

      {/* Right Sidebar for Color Selection */}
      <View style={styles.sidebar}>
        {[HOLD_SELECTION_COLORS.intermediate, HOLD_SELECTION_COLORS.start, HOLD_SELECTION_COLORS.end].map((color) => (
          <TouchableOpacity
            key={color}
            style={[
              styles.sidebarButton,
              { borderColor: selectedColor === color ? "#000" : "transparent", backgroundColor: color }
            ]}
            onPress={() => handleColorSelect(color)}
          />
        ))}

        {/* Undo Button */}
        <TouchableOpacity style={styles.sidebarUndo} onPress={handleUndo}>
          <Feather name="rotate-ccw" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Image Canvas */}
      {imageDimensions && (
        <RouteImage
          ref={routeImageRef}
          style={{
            borderRadius: sizes.borderRadius,
            width: imageDimensions.width * scaleX,
            height: imageDimensions.height * scaleY,
          }}
          interactable={true}
          climbingHoldOverlayProps={{
            showUnselectedHolds: showUnselectedHolds,
          }}
          drawingCanvasProps={{
            canDraw: selectedColor != null,
            color: selectedColor || "black"
          }}
          mode={"create"}
        />
      )}

      {/* Save Button as Check Icon */}
      <TouchableOpacity style={styles.checkButton} onPress={handleExport}>
        <AntDesign name="check" size={32} color="#fff" />
      </TouchableOpacity>

      <LoadingModal 
        visible={!dataReceived} 
        message={annotations ? "Loading Existing Annotations..." : "Detecting Climbing Holds...\n(may take up to 10 seconds)"}
      />
    </View>
  );
};

export default RouteImageCreator;