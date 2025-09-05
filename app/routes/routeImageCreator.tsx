import React, { useRef, useState, useCallback, useEffect, useLayoutEffect } from 'react';
import { Alert, Text, ActivityIndicator, Modal, View, Image, StyleSheet, TouchableOpacity, Dimensions, Platform } from 'react-native';
import { useLocalSearchParams, useRouter, useNavigation } from "expo-router";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import RouteImage, { RouteImageRef, ClimbingHold } from "@/components/RouteImage/RouteImage";
import { useTheme } from '@/constants/theme';
import { HOLD_SELECTION_COLORS } from '@/constants/holdSelection';
import { AntDesign, Feather } from '@expo/vector-icons';
import { useRouteImageCreatorLogic } from '@/hooks/useRouteImageCreatorLogic';
import LoadingModal from '@/components/ui/LoadingModal';

const getStyles = (colors: any, sizes: any, shadows: any) => {
  return StyleSheet.create({
    scrollView: {
      backgroundColor: colors.backgroundPrimary,
    },
    container: {
      flexGrow: 1,
      padding: 20,
      paddingTop: 35,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: 25,
      color: colors.textPrimary,
      textAlign: 'center',
    },
    optionsContainer: {
      flexDirection: 'column',
      width: '100%',
      marginBottom: 20,
      paddingHorizontal: 10,
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
      padding: 13,
      alignItems: 'center',
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    buttonText: {
      color: colors.textPrimary,
      fontSize: 16,
      fontWeight: '600',
    },
    orText: {
      color: colors.textPrimary,
      fontSize: 16,
      fontWeight: '600',
      textAlign: 'center',
      marginVertical: 10,
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
      paddingBottom: 20,
      height: '80%',
    },
    modalHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 15,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    closeButton: {
      fontSize: 24,
      color: colors.textSecondary,
      padding: 5,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    emptyMessage: {
      textAlign: 'center',
      marginTop: 20,
      color: colors.textSecondary,
      fontSize: 16,
    },
    templateGrid: {
      padding: 10,
    },
    templateItem: {
      flex: 1,
      margin: 5,
      backgroundColor: colors.backgroundSecondary,
      borderRadius: sizes.borderRadius,
      padding: 10,
      alignItems: 'center',
    },
    templateImage: {
      width: '100%',
      height: 150,
      borderRadius: sizes.borderRadius,
    },
  
    // Form Styles
    formContainer: {
      marginVertical: 20,
    },
    textInput: {
      borderWidth: 1,
      marginBottom: 15,
      padding: 12,
      color: colors.textPrimary,
      borderColor: colors.border,
      borderRadius: sizes.borderRadius,
      backgroundColor: colors.backgroundSecondary,
      fontSize: 16,
    },
    multilineInput: {
      minHeight: 80,
      textAlignVertical: 'top',
    },
    imagePreview: {
      width: '100%',
      height: 400,
      marginBottom: 20,
      borderRadius: sizes.borderRadius,
      resizeMode: 'cover',
    },
  
    // Submit Styles
    submitButton: {
      backgroundColor: colors.success,
      padding: 15,
      borderRadius: sizes.borderRadius,
      alignItems: 'center',
      marginTop: 10,
    },
    submitButtonDisabled: {
      backgroundColor: colors.disabled,
    },
    submitButtonText: {
      color: colors.textPrimary,
      fontSize: 16,
      fontWeight: '600',
    },
    submitButtonTextDisabled: {
      color: colors.textSecondary,
    },
    incompleteMessage: {
      color: colors.error,
      fontSize: 14,
      fontWeight: '500',
      marginTop: 10,
      textAlign: 'center',
    },
    sidebar: {
      position: "absolute",
      right: 20,
      top: 100,
      backgroundColor: colors.backgroundSecondary,
      paddingVertical: 10,
      paddingHorizontal: 8,
      borderRadius: sizes.borderRadius,
      alignItems: "center",
      zIndex: 20,
      shadowColor: shadows.medium.shadowColor,
      elevation: shadows.medium.elevation,
    },
    sidebarButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginVertical: 8,
      borderWidth: 2,
      borderColor: 'transparent',
    },
    sidebarUndo: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginTop: 12,
      backgroundColor: colors.error,
      justifyContent: "center",
      alignItems: "center",
    },
    checkButton: {
      position: "absolute",
      bottom: 30,
      right: "50%",
      transform: [{ translateX: 30 }],
      width: 60,
      height: 60,
      borderRadius: 30,
      backgroundColor: colors.success,
      justifyContent: "center",
      alignItems: "center",
      elevation: shadows.medium.elevation,
      shadowColor: shadows.medium.shadowColor,
    },
  });
};

const RouteImageCreator: React.FC = () => {
  const { colors, sizes, shadows } = useTheme();
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

  const styles = getStyles(colors, sizes, shadows);

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
          imageURI={imageUri}
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