import React, { useLayoutEffect, useState, useEffect, useCallback } from "react";
import {
  View,
  TextInput,
  FlatList,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ScrollView,
  Image,
  Modal,
} from "react-native";
import { useRouter, useLocalSearchParams, useNavigation } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

import { useTheme } from "@/constants/theme";

import LoadingModal from "@/components/ui/LoadingModal";
import RouteImage from "@/components/RouteImage/RouteImage";

// Services
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Template, SaveRouteRequest } from '@/types';
import { useImageSelection } from '@/hooks/routes/useImageSelection';
import { useRouteTemplates } from '@/hooks/routes/useRouteTemplates';
import { useRouteForm } from '@/hooks/routes/useRouteForm';
import { useRouteSubmission } from '@/hooks/routes/useRouteSubmission';

const getStyles = (colors: any, sizes: any, spacing: any, font: any) => {
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
      backgroundColor: colors.backgroundPrimary,
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
  });
};

const CreateRouteScreen = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const { colors, sizes, spacing, global, font } = useTheme();
  const styles = getStyles(colors, sizes, spacing, font);

  const { locationId: locationIdParam } = useLocalSearchParams();

  // Composed Hooks
  const { imageUri, setImageUri, annotationsData, setAnnotationsData, exportedUri, annotationsJSON, handleImagePick: imageSelectionHandleImagePick, setRouteData } = useImageSelection();
  const { templates, showTemplates, setShowTemplates, loadingTemplates, handleFetchTemplates, handleTemplateSelect: templateHandleTemplateSelect, handleShowTemplates: templateHandleShowTemplates } = useRouteTemplates();
  const { name, setName, description, setDescription, difficulty, setDifficulty, canSubmit } = useRouteForm(imageUri);
  const { loading, handleSubmit: submitHandleSubmit } = useRouteSubmission();

  const [locationId, setLocationId] = useState<string>("");
  const [gymName, setGymName] = useState<string>("");

  // Handlers that compose the new hooks
  const handleImagePick = useCallback(async (useCamera: boolean) => {
    await imageSelectionHandleImagePick(useCamera, () => router.push("/routes/routeImageCreator"));
  }, [imageSelectionHandleImagePick, router]);

  const handleTemplateSelect = useCallback((template: Template) => {
    templateHandleTemplateSelect(template, setRouteData, () => router.push("/routes/routeImageCreator"));
  }, [templateHandleTemplateSelect, setRouteData, router]);

  const handleSubmit = useCallback(async () => {
    const submissionData: SaveRouteRequest = {
      name,
      description,
      difficulty,
      imageUri,
      annotationsJSON,
      locationId: locationId || undefined,
    };
    await submitHandleSubmit(submissionData, () => {
      router.back();
      router.setParams({ shouldReload: "true" }); // shouldReload needs to be a string for setParams
    });
  }, [name, description, difficulty, imageUri, annotationsJSON, locationId, submitHandleSubmit, router]);

  const handleShowTemplates = useCallback(() => {
    templateHandleShowTemplates(locationIdParam as string || ""); // Use the composed handleShowTemplates
  }, [templateHandleShowTemplates, locationIdParam]);

  useEffect(() => {
    setLocationId((locationIdParam || "") as string);
  }, [locationIdParam]);

  useFocusEffect(
    useCallback(() => {
      if (exportedUri) setImageUri(exportedUri as string);
      if (annotationsJSON) setAnnotationsData(annotationsJSON as string);
    }, [exportedUri, annotationsJSON, setImageUri, setAnnotationsData])
  );

  // Effects
  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Create Route",
      headerStyle: { backgroundColor: colors.backgroundPrimary },
      headerTintColor: "white",
    });
    setGymName(gymName); 
  }, [navigation, colors.backgroundPrimary, gymName, setGymName]);

  // Render methods
  const renderTemplateItem = ({ item }: { item: Template }) => (
    <TouchableOpacity 
      style={styles.templateItem} 
      onPress={() => handleTemplateSelect(item)}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.templateImage} />
    </TouchableOpacity>
  );

  const renderTemplateModal = () => (
    <Modal 
      visible={showTemplates} 
      transparent 
      animationType="slide" 
      onRequestClose={() => setShowTemplates(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Select a Template</Text>
            <TouchableOpacity onPress={() => setShowTemplates(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>
          
          {loadingTemplates ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : templates.length === 0 ? (
            <Text style={styles.emptyMessage}>
              No templates available.
            </Text>
          ) : (
            <FlatList
              data={templates}
              keyExtractor={(item) => item.id || Math.random().toString()}
              renderItem={renderTemplateItem}
              numColumns={2}
              contentContainerStyle={styles.templateGrid}
            />
          )}
        </View>
      </View>
    </Modal>
  );

  return (
    <ScrollView 
      contentContainerStyle={styles.container} 
      style={styles.scrollView}
    >
      <Text style={styles.title}>{gymName}</Text>

      {/* Options Section */}
      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={[styles.button, loadingTemplates && styles.buttonDisabled]}
          onPress={handleShowTemplates}
          disabled={loadingTemplates}
        >
          <Text style={styles.buttonText}>Use a Template</Text>
        </TouchableOpacity>

        <Text style={styles.orText}>OR</Text>

        <View style={styles.imageButtonsContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.halfButton]} 
            onPress={() => handleImagePick(false)}
          >
            <Text style={styles.buttonText}>Pick Image</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.button, styles.halfButton]} 
            onPress={() => handleImagePick(true)}
          >
            <Text style={styles.buttonText}>Take Photo</Text>
          </TouchableOpacity>
        </View>
      </View>

      {renderTemplateModal()}

      {/* Image Preview */}
      {imageUri && (
        <RouteImage 
          style={styles.imagePreview} 
          imageURI={imageUri} 
          dataJSON={annotationsData || ""} 
          interactable={false} 
        />
      )}

      {/* Form Inputs */}
      <View style={styles.formContainer}>
        <TextInput 
          style={styles.textInput} 
          placeholder="Route Name" 
          value={name} 
          onChangeText={setName} 
          placeholderTextColor={colors.textSecondary} 
        />
        
        <TextInput 
          style={[styles.textInput, styles.multilineInput]} 
          placeholder="Description" 
          value={description} 
          onChangeText={setDescription} 
          placeholderTextColor={colors.textSecondary} 
          multiline 
        />
        
        <TextInput 
          style={styles.textInput} 
          placeholder="Difficulty" 
          value={difficulty} 
          onChangeText={setDifficulty} 
          placeholderTextColor={colors.textSecondary} 
        />
      </View>

      {/* Submit Section */}
      <TouchableOpacity
        style={[styles.submitButton, !canSubmit && styles.submitButtonDisabled]}
        onPress={handleSubmit}
        disabled={!canSubmit}
      >
        <Text style={[styles.submitButtonText, !canSubmit && styles.submitButtonTextDisabled]}>
          Submit
        </Text>
      </TouchableOpacity>

      {!canSubmit && (
        <Text style={styles.incompleteMessage}>
          Please fill in all required fields before submitting.
        </Text>
      )}

      <LoadingModal visible={loading} message="Submitting..." />
    </ScrollView>
  );
};

export default CreateRouteScreen;