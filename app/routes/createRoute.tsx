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
import { COLORS, SIZES } from "@/constants/theme";

import LoadingModal from "@/components/ui/LoadingModal";
import RouteImage from "@/components/RouteImage/RouteImage";

// Services
import { RouteService, Template } from '@/services/RouteService';
import { ImagePickerService } from '@/services/ImagePickerService';

const CreateRouteScreen = () => {
  const router = useRouter();
  const navigation = useNavigation();
  const { locationId: locationIdParam } = useLocalSearchParams();
  const { imageUri: exportedUri, annotations: annotationsJSON } = useRouteStore();

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
      const fetchedTemplates = await RouteService.fetchTemplates(locationIdParam as string);
      setTemplates(fetchedTemplates);
    } catch (error) {
      Alert.alert("Error", "Failed to load templates");
    } finally {
      setLoadingTemplates(false);
    }
  }, [locationIdParam]);

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
      await RouteService.createRoute({
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
      const currentGymName = await RouteService.getCurrentGymName();
      setGymName(currentGymName);
    } catch (error) {
      console.error("Error fetching gym name:", error);
    }
  }, []);

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
      headerStyle: { backgroundColor: COLORS.backgroundSecondary },
      headerTintColor: "white",
    });
    fetchGymName();
  }, [navigation, fetchGymName]);

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
              <ActivityIndicator size="large" color={COLORS.primary} />
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
          placeholderTextColor={COLORS.textSecondary} 
        />
        
        <TextInput 
          style={[styles.textInput, styles.multilineInput]} 
          placeholder="Description" 
          value={description} 
          onChangeText={setDescription} 
          placeholderTextColor={COLORS.textSecondary} 
          multiline 
        />
        
        <TextInput 
          style={styles.textInput} 
          placeholder="Difficulty" 
          value={difficulty} 
          onChangeText={setDifficulty} 
          placeholderTextColor={COLORS.textSecondary} 
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

const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: COLORS.backgroundPrimary,
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
    color: COLORS.textPrimary,
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
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.borderRadius,
    padding: 13,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  orText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
    marginVertical: 10,
  },
  
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.backgroundPrimary,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    height: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  closeButton: {
    fontSize: 24,
    color: COLORS.textSecondary,
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
    color: COLORS.textSecondary,
    fontSize: 16,
  },
  templateGrid: {
    padding: 10,
  },
  templateItem: {
    flex: 1,
    margin: 5,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: SIZES.borderRadius,
    padding: 10,
    alignItems: 'center',
  },
  templateImage: {
    width: '100%',
    height: 150,
    borderRadius: SIZES.borderRadius,
  },
  
  // Form Styles
  formContainer: {
    marginVertical: 20,
  },
  textInput: {
    borderWidth: 1,
    marginBottom: 15,
    padding: 12,
    color: COLORS.textPrimary,
    borderColor: COLORS.border,
    borderRadius: SIZES.borderRadius,
    backgroundColor: COLORS.backgroundSecondary,
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
    borderRadius: SIZES.borderRadius,
    resizeMode: 'cover',
  },
  
  // Submit Styles
  submitButton: {
    backgroundColor: '#2f8f4c',
    padding: 15,
    borderRadius: SIZES.borderRadius,
    alignItems: 'center',
    marginTop: 10,
  },
  submitButtonDisabled: {
    backgroundColor: '#B0BEC5',
  },
  submitButtonText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  submitButtonTextDisabled: {
    color: '#2e2e2e',
  },
  incompleteMessage: {
    color: 'red',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 10,
    textAlign: 'center',
  },
});

export default CreateRouteScreen;