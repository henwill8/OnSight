import React, { useEffect, useState, useCallback, useLayoutEffect } from "react";
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
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams, useNavigation } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

import { useRouteStore } from '@/store/routeStore';
import { useTheme } from "@/constants/theme";

import LoadingModal from "@/components/ui/LoadingModal";
import RouteImage from "@/components/RouteImage/RouteImage";

// Services
import { ImagePickerService } from '@/services/ImagePickerService';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouteService } from '@/hooks/useRouteService';
import { Template } from '@/types';

const getStyles = (colors: any, sizes: any, spacing: any) => {
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
      fontSize: 24,
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
      fontSize: 16,
      fontWeight: '600',
    },
    orText: {
      color: colors.textPrimary,
      fontSize: 16,
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
      fontSize: 20,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    closeButton: {
      fontSize: 24,
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
      fontSize: 16,
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
      fontSize: 16,
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
      marginTop: spacing.sm,
      textAlign: 'center',
    },
  });
};

const CreateRouteScreen = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const { locationId: locationIdParam } = useLocalSearchParams();
  const { imageUri: exportedUri, annotations: annotationsJSON } = useRouteStore();
  const { fetchTemplates, createRoute, getCurrentGymName } = useRouteService();

  const { colors, sizes, spacing, global } = useTheme();
  const styles = getStyles(colors, sizes, spacing);

  // State
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [loadingTemplates, setLoadingTemplates] = useState(false);
  
  const [name, setName] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [difficulty, setDifficulty] = useState<string>("");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [annotationsData, setAnnotationsData] = useState<string | null>(null);
  const [locationId, setLocationId] = useState<string | null>(null);
  const [gymName, setGymName] = useState<string>("");
  
  const [canSubmit, setCanSubmit] = useState(false);
  const [loading, setLoading] = useState(false);

  // Handlers
  const handleFetchTemplates = useCallback(async () => {
    setLoadingTemplates(true);
    try {
      const fetchedTemplates = await fetchTemplates(locationIdParam as string);
      setTemplates(fetchedTemplates);
    } catch (error) {
      Alert.alert("Error", "Failed to load templates");
    } finally {
      setLoadingTemplates(false);
    }
  }, [locationIdParam, fetchTemplates]);

  const handleTemplateSelect = (template: Template) => {
    useRouteStore.getState().setRouteData(template.imageUrl, template.annotationsUrl);
    router.push("/routes/routeImageCreator");
    setShowTemplates(false);
  };

  const handleImagePick = useCallback(async (useCamera: boolean) => {
    const result = useCamera 
      ? await ImagePickerService.launchCamera()
      : await ImagePickerService.launchImageLibrary();

    if (result.success && result.uri) {
      useRouteStore.getState().setRouteData(result.uri, null);
      router.push("/routes/routeImageCreator");
    } else if (result.error) {
      Alert.alert("Error", result.error);
    }
  }, [router]);

  const handleSubmit = async () => {
    if (!imageUri || !annotationsJSON) {
      Alert.alert("Error", "Missing required data");
      return;
    }

    setLoading(true);
    try {
      await createRoute({
        name,
        description,
        difficulty,
        imageUri,
        annotationsJSON,
        locationId: locationId || undefined,
      });

      Alert.alert("Success", "Route created successfully!");
      router.back();
      router.setParams({ shouldReload: 1 });
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to create route");
    } finally {
      setLoading(false);
    }
  };

  const handleShowTemplates = () => {
    setShowTemplates(true);
    handleFetchTemplates();
  };

  // Effects
  const fetchGymName = useCallback(async () => {
    try {
      const currentGymName = await getCurrentGymName();
      setGymName(currentGymName);
    } catch (error) {
      console.error("Error fetching gym name:", error);
    }
  }, [getCurrentGymName]);

  useFocusEffect(
    useCallback(() => {
      if (exportedUri) setImageUri(exportedUri as string);
      if (annotationsJSON) setAnnotationsData(annotationsJSON as string);
      if (locationIdParam) setLocationId(locationIdParam as string);
    }, [exportedUri, annotationsJSON, locationIdParam])
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Create Route",
      headerStyle: { backgroundColor: colors.backgroundSecondary },
      headerTintColor: "white",
    });
    fetchGymName();
  }, [navigation, fetchGymName, colors.backgroundSecondary]);

  useEffect(() => {
    setCanSubmit(!!difficulty && !!imageUri && !!name.trim());
  }, [difficulty, imageUri, name]);

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