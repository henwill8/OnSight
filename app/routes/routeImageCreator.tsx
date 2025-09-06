import React, { useRef, useState, useCallback, useEffect, useLayoutEffect } from 'react';
import { Alert, Text, ActivityIndicator, Modal, View, Image, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { useLocalSearchParams, useRouter, useNavigation } from "expo-router";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RouteImage, { RouteImageRef, ClimbingHold } from "@/components/RouteImage/RouteImage";
import { useTheme } from '@/constants/theme';
import { HOLD_SELECTION_COLORS } from '@/constants/holdSelection';
import { AntDesign, Feather } from '@expo/vector-icons';
import { useRouteImageCreatorLogic } from '@/hooks/routes/useRouteImageCreatorLogic';
import LoadingModal from '@/components/ui/LoadingModal';

const getStyles = (colors: any, sizes: any, shadows: any, font: any, spacing: any) => {
  return StyleSheet.create({
    scrollView: {
      backgroundColor: colors.backgroundPrimary,
    },
    container: {
      flexGrow: 1,
      padding: spacing.md,
      paddingTop: spacing.lg + spacing.xs,
    },
    title: {
      fontSize: font.h3,
      fontWeight: 'bold',
      marginBottom: spacing.lg + spacing.xs,
      color: colors.textPrimary,
      textAlign: 'center',
    },
    optionsContainer: {
      flexDirection: 'column',
      width: '100%',
      marginBottom: spacing.md,
      paddingHorizontal: spacing.sm,
    },
    imageButtonsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      width: '100%',
    },
    halfButton: {
      flex: 0.48,
    },
    button: {
      backgroundColor: colors.primary,
      borderRadius: sizes.borderRadius,
      padding: spacing.md,
      alignItems: 'center',
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    buttonText: {
      color: colors.textPrimary,
      fontSize: font.body,
      fontWeight: '600',
    },
    orText: {
      color: colors.textPrimary,
      fontSize: font.body,
      fontWeight: '600',
      textAlign: 'center',
      marginVertical: spacing.sm,
    },
  
    // Modal Styles
    modalOverlay: {
      flex: 1,
      backgroundColor: colors.overlay,
      justifyContent: 'flex-end',
    },
    modalContent: {
      backgroundColor: colors.backgroundPrimary,
      borderTopLeftRadius: sizes.borderRadius,
      borderTopRightRadius: sizes.borderRadius,
      paddingBottom: spacing.md,
      height: '80%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalTitle: {
      fontSize: font.h4,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    closeButton: {
      fontSize: font.h3,
      color: colors.textSecondary,
      padding: spacing.xs,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyMessage: {
      textAlign: 'center',
      marginTop: spacing.md,
      color: colors.textSecondary,
      fontSize: font.body,
    },
    templateGrid: {
      padding: spacing.sm,
    },
    templateItem: {
      flex: 1,
      margin: spacing.xs,
      backgroundColor: colors.backgroundSecondary,
      borderRadius: sizes.borderRadius,
      padding: spacing.sm,
      alignItems: 'center',
    },
    templateImage: {
      width: '100%',
      height: 150,
      borderRadius: sizes.borderRadius,
    },
  
    // Form Styles
    formContainer: {
      marginVertical: spacing.md,
    },
    textInput: {
      borderWidth: 1,
      marginBottom: spacing.md,
      padding: spacing.sm + spacing.xs,
      color: colors.textPrimary,
      borderColor: colors.border,
      borderRadius: sizes.borderRadius,
      backgroundColor: colors.backgroundSecondary,
      fontSize: font.body,
    },
    multilineInput: {
      minHeight: 80,
      textAlignVertical: 'top',
    },
    imagePreview: {
      width: '100%',
      height: 400,
      marginBottom: spacing.md,
      borderRadius: sizes.borderRadius,
      resizeMode: 'cover',
    },
  
    // Submit Styles
    submitButton: {
      backgroundColor: colors.success,
      padding: spacing.md,
      borderRadius: sizes.borderRadius,
      alignItems: 'center',
      marginTop: spacing.sm,
    },
    submitButtonDisabled: {
      backgroundColor: colors.disabled,
    },
    submitButtonText: {
      color: colors.textPrimary,
      fontSize: font.body,
      fontWeight: '600',
    },
    submitButtonTextDisabled: {
      color: colors.textSecondary,
    },
    incompleteMessage: {
      color: colors.error,
      fontSize: font.caption,
      fontWeight: '500',
      marginTop: spacing.sm,
      textAlign: 'center',
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
      width: sizes.iconLg,
      height: sizes.iconLg,
      borderRadius: sizes.iconLg / 2,
      marginVertical: spacing.xs,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    sidebarUndo: {
      width: sizes.iconLg,
      height: sizes.iconLg,
      borderRadius: sizes.iconLg / 2,
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
      width: sizes.iconXl,
      height: sizes.iconXl,
      borderRadius: sizes.iconXl / 2,
      backgroundColor: colors.success,
      justifyContent: "center",
      alignItems: "center",
      elevation: shadows.medium.elevation,
      shadowColor: shadows.medium.shadowColor,
    },
  });
};

const RouteImageCreator: React.FC = () => {
  const { colors, sizes, shadows, font, spacing } = useTheme();
  const {
    imageUri,
    annotations,
    imageDimensions,
    scaleX,
    scaleY,
    dataReceived,
    showUnselectedHolds,
    selectedColor,
    routeAnnotationRef,
    handleToggleBoundingBoxes,
    handleColorSelect,
    handleExport,
    handleUndo,
    handleError,
    navigation,
  } = useRouteImageCreatorLogic();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Create Route Image",
      headerStyle: { backgroundColor: colors.backgroundSecondary },
      headerTintColor: "white"
    });
  }, [navigation, colors.backgroundSecondary]);

  const styles = getStyles(colors, sizes, shadows, font, spacing);

  return (
    <View style={styles.container}>

      {/* Right Sidebar for Color Selection */}
      <View style={styles.sidebar}>
        {[HOLD_SELECTION_COLORS.intermediate, HOLD_SELECTION_COLORS.start, HOLD_SELECTION_COLORS.end].map((color) => (
          <TouchableOpacity
            key={color}
            style={[
              styles.sidebarButton,
              { borderColor: selectedColor === color ? "#fff" : "transparent", backgroundColor: color }
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
          ref={routeAnnotationRef}
          style={{
            borderRadius: sizes.borderRadius,
            width: imageDimensions.width * scaleX,
            height: imageDimensions.height * scaleY,
          }}
          imageURI={imageUri || ""}
          interactable={true}
          climbingHoldOverlayProps={{
            showUnselectedHolds: showUnselectedHolds,
          }}
          drawingCanvasProps={{
            canDraw: selectedColor != null,
            color: selectedColor || "black"
          }}
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