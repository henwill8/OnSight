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
import * as ImagePicker from "expo-image-picker";
import { useRouter, useLocalSearchParams, useNavigation } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

import { setSecureItem, getSecureItem } from "@/utils/secureStorage";
import { resizeImageToMaxDimension } from "@/utils/imageUtils";
import { fetchWithTimeout, createImageFormData } from "@/utils/api";
import { API_PATHS } from "@/constants/paths";
import { COLORS, SIZES } from "@/constants/theme";
import config from "@/config";

import LoadingModal from "@/components/ui/LoadingModal";
import RouteImage from "@/components/RouteImage/RouteImage";

interface Template {
  imageUrl: string;
  annotationsUrl: string;
}

const CreateRouteScreen = () => {
  const router = useRouter();
  const navigation = useNavigation();

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

  const { locationId: locationIdParam, exportedUri, annotationsJSON } = useLocalSearchParams();

  /** Fetch Templates **/
  const fetchTemplates = useCallback(async () => {
    setLoadingTemplates(true);
    try {
      const gymId = await getSecureItem("gymId");
      const response = await fetchWithTimeout(
        config.API_URL + API_PATHS.GET_TEMPLATES + (gymId ? `?gymId=${gymId}` : "") + (locationIdParam && gymId ? `&locationId=${locationIdParam}` : ""),
        { method: "GET" }
      );
      const data = await response.json();
      console.log(data)
      if (response.ok) {
        const templates: Template[] = (data || []).map(t => ({
          imageUrl: t.imageUrl,
          annotationsUrl: t.annotationsUrl
        }));
        setTemplates(templates);
      } else {
        console.error("Error fetching templates:", data.error);
        Alert.alert("Error", "Failed to load templates");
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
      Alert.alert("Error", "Failed to load templates");
    } finally {
      setLoadingTemplates(false);
    }
  }, []);

  /** Handle Template Select **/
  const handleTemplateSelect = (template: Template) => {
    router.push({
      pathname: "/routes/routeImageCreator",
      params: {
        imageUri: encodeURIComponent(template.imageUrl),
        annotationsUri: encodeURIComponent(template.annotationsUrl),
        name,
        description,
        difficulty,
      },
    });
    setShowTemplates(false);
  };

  /** Handle Image Pick **/
  const handleImagePick = useCallback(
    async (useCamera: boolean) => {
      const permission = useCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (permission.status !== "granted") {
        Alert.alert("Permission Required", "You need to allow access to use this feature.");
        return;
      }

      const pickerResult = useCamera
        ? await ImagePicker.launchCameraAsync({ quality: 1 })
        : await ImagePicker.launchImageLibraryAsync({ quality: 1 });

      if (pickerResult.assets && pickerResult.assets.length > 0) {
        const uri = pickerResult.assets[0].uri;
        try {
          const resizedImage = await resizeImageToMaxDimension(uri);

          router.push({
            pathname: "/routes/routeImageCreator",
            params: {
              imageUri: encodeURIComponent(resizedImage.uri),
              name,
              description,
              difficulty,
            },
          });
        } catch (error) {
          console.error("Error manipulating image:", error);
          Alert.alert("Error", "Failed to process the image.");
        }
      }
    },
    [name, description, difficulty, router]
  );

  /** Handle Submit **/
  const handleSubmit = async () => {
    if (!imageUri) return console.error("Image URI is missing");
    setLoading(true);
    try {
      const gymId = await getSecureItem("gymId");
      const formData = await createImageFormData({
        name,
        description,
        difficulty,
        gymId: gymId || "",
        annotations: annotationsData,
        locationId,
        imageUri,
      });
      const response = await fetchWithTimeout(config.API_URL + API_PATHS.CREATE_ROUTE, {
        method: "POST",
        body: formData,
      }, 5000);
      const data = await response.json();
      if (response.ok) {
        Alert.alert("Success", "Route created successfully!");
        router.back();
        router.setParams({ shouldReload: 1 });
      } else {
        console.error("Error creating route:", data.error);
        Alert.alert("Error", "Failed to create route");
      }
    } catch (error) {
      console.error("Error creating route:", error);
      Alert.alert("Error", "An error occurred while creating the route");
    } finally {
      setLoading(false);
    }
  };

  /** Effects **/
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
    fetchCurrentGymName();
  }, [navigation]);

  const fetchCurrentGymName = async () => {
    const currentGymName = await getSecureItem("gymName");
    setGymName(currentGymName || "");
  };

  useEffect(() => {
    setCanSubmit(!!difficulty && !!imageUri);
  }, [difficulty, imageUri]);

  return (
    <ScrollView contentContainerStyle={styles.container} style={{ backgroundColor: COLORS.backgroundPrimary }}>
      <Text style={[styles.title, { textAlign: "center", marginBottom: 25 }]}>{gymName}</Text>

      <View style={styles.optionsContainer}>
        <TouchableOpacity
          style={[styles.button, loadingTemplates && { opacity: 0.5 }]}
          onPress={() => {
            setShowTemplates(true);
            fetchTemplates();
          }}
          disabled={loadingTemplates}
        >
          <Text style={styles.buttonText}>Use a Template</Text>
        </TouchableOpacity>

        <Text style={[styles.buttonText, { textAlign: "center", marginVertical: 10 }]}>OR</Text>

        <View style={styles.imageButtonsContainer}>
          <TouchableOpacity style={[styles.button, styles.halfButton]} onPress={() => handleImagePick(false)}>
            <Text style={styles.buttonText}>Pick Image</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.button, styles.halfButton]} onPress={() => handleImagePick(true)}>
            <Text style={styles.buttonText}>Take Photo</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Template Selection Modal */}
      <Modal visible={showTemplates} transparent animationType="slide" onRequestClose={() => setShowTemplates(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select a Template</Text>
              <TouchableOpacity onPress={() => setShowTemplates(false)}>
                <Text style={styles.closeButton}>✕</Text>
              </TouchableOpacity>
            </View>
            {loadingTemplates ? (
              <ActivityIndicator size="large" color={COLORS.primary} />
            ) : templates.length === 0 ? (
              <Text style={{ textAlign: "center", marginTop: 20, color: COLORS.textSecondary }}>
                No templates available.
              </Text>
            ) : (
              <FlatList
                data={templates}
                keyExtractor={(item) => item.id || Math.random().toString()}
                renderItem={({ item }) => (
                  <TouchableOpacity style={styles.templateItem} onPress={() => handleTemplateSelect(item)}>
                    <Image source={{ uri: item.imageUrl }} style={styles.templateImage} />
                    <Text style={styles.templateName}>{item.name}</Text>
                  </TouchableOpacity>
                )}
                numColumns={2}
                contentContainerStyle={styles.templateGrid}
              />
            )}
          </View>
        </View>
      </Modal>

      {imageUri && (
        <RouteImage style={styles.imagePreview} imageURI={imageUri} dataJSON={annotationsData || ""} interactable={false} />
      )}

      {/* Inputs */}
      <TextInput style={styles.textInput} placeholder="Route Name" value={name} onChangeText={setName} placeholderTextColor={COLORS.textSecondary} />
      <TextInput style={styles.textInput} placeholder="Description" value={description} onChangeText={setDescription} placeholderTextColor={COLORS.textSecondary} multiline />
      <TextInput style={[styles.textInput, { marginBottom: 30 }]} placeholder="Difficulty" value={difficulty} onChangeText={setDifficulty} placeholderTextColor={COLORS.textSecondary} />

      {/* Submit */}
      <TouchableOpacity
        style={[styles.submitButton, { backgroundColor: canSubmit ? "#2f8f4c" : "#B0BEC5" }]}
        onPress={handleSubmit}
        disabled={!canSubmit}
      >
        <Text style={[styles.submitButtonText, { color: canSubmit ? COLORS.textPrimary : "#2e2e2e" }]}>Submit</Text>
      </TouchableOpacity>

      {!canSubmit && <Text style={styles.incompleteMessage}>Please fill in all fields before submitting.</Text>}

      <LoadingModal visible={loading} message="Submitting..." />
    </ScrollView>
  );
};


const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 35,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: COLORS.textPrimary,
  },
  optionsContainer: {
    flexDirection: 'column',
    width: '100%',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 15,
    textAlign: 'center',
  },
  imageButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  halfButton: {
    flex: 0.48,
  },
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
    marginBottom: 8,
  },
  templateName: {
    color: COLORS.textPrimary,
    fontSize: 14,
    textAlign: 'center',
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.borderRadius,
    padding: 13,
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  textInput: {
    borderWidth: 1,
    marginBottom: 15,
    padding: 10,
    color: COLORS.textPrimary,
    borderColor: COLORS.border,
    borderRadius: SIZES.borderRadius,
    backgroundColor: COLORS.backgroundSecondary,
  },
  imagePreview: {
    width: '100%',
    height: 400,
    marginBottom: 20,
    borderRadius: SIZES.borderRadius,
    resizeMode: 'cover',
  },
  submitButton: {
    padding: 15,
    borderRadius: SIZES.borderRadius,
    alignItems: 'center',
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  incompleteMessage: {
    color: 'red',
    fontSize: 16,
    fontWeight: "500",
    marginTop: 10,
    textAlign: 'center',
  },
});

export default CreateRouteScreen;
