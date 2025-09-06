import { useState, useEffect, useCallback, Dispatch, SetStateAction } from "react";
import { Alert } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";

import { getSecureItem, setSecureItem } from '@/utils/secureStorageUtils';
import { createRoute, fetchTemplates, getCurrentGymName } from '@/utils/routeService';
import { Template } from '@/types';
import { useImagePicker } from '@/hooks/utils/useImagePicker';

interface RouteSecureStoreData {
  imageUri: string | null;
  annotations: string | null;
}

interface UseCreateRouteLogicReturn {
  name: string;
  setName: Dispatch<SetStateAction<string>>;
  description: string;
  setDescription: Dispatch<SetStateAction<string>>;
  difficulty: string;
  setDifficulty: Dispatch<SetStateAction<string>>;
  imageUri: string | null;
  setImageUri: Dispatch<SetStateAction<string | null>>;
  annotationsData: string | null;
  setAnnotationsData: Dispatch<SetStateAction<string | null>>;
  locationId: string | null;
  setLocationId: Dispatch<SetStateAction<string | null>>;
  gymName: string;
  setGymName: Dispatch<SetStateAction<string>>;
  templates: Template[];
  showTemplates: boolean;
  setShowTemplates: Dispatch<SetStateAction<boolean>>;
  loadingTemplates: boolean;
  canSubmit: boolean;
  loading: boolean;
  handleFetchTemplates: () => Promise<void>;
  handleTemplateSelect: (template: Template) => void;
  handleImagePick: (useCamera: boolean) => Promise<void>;
  handleSubmit: () => Promise<void>;
  handleShowTemplates: () => void;
  fetchGymName: () => Promise<void>;
  exportedUri: string | null;
  annotationsJSON: string | null;
}

export const useCreateRouteLogic = (navigation: any): UseCreateRouteLogicReturn => {
  const { locationId: locationIdParam } = useLocalSearchParams();
  const { pickImage } = useImagePicker();

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

  const [exportedUri, setExportedUri] = useState<string | null>(null);
  const [annotationsJSON, setAnnotationsJSON] = useState<string | null>(null);

  const [canSubmit, setCanSubmit] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadRouteData = async () => {
      const storedRouteData = await getSecureItem('routeData');
      if (storedRouteData) {
        const parsedData: RouteSecureStoreData = JSON.parse(storedRouteData);
        setExportedUri(parsedData.imageUri);
        setAnnotationsJSON(parsedData.annotations);
      }
    };
    loadRouteData();
  }, []);

  const setRouteData = useCallback(async (imageUri: string | null, annotations: string | null) => {
    const newRouteData: RouteSecureStoreData = { imageUri, annotations };
    await setSecureItem('routeData', JSON.stringify(newRouteData));
    setExportedUri(imageUri);
    setAnnotationsJSON(annotations);
  }, []);

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
    setRouteData(template.imageUrl, template.annotationsUrl);
    navigation.push("/routes/routeImageCreator");
    setShowTemplates(false);
  };

  const handleImagePick = useCallback(async (useCamera: boolean) => {
    const result = await pickImage(useCamera);

    if (result.success && result.uri) {
      setRouteData(result.uri, null);
      navigation.push("/routes/routeImageCreator");
    } else if (result.error) {
      // Alert.alert("Error", result.error); // Error handled within useImagePicker
    }
  }, [navigation, pickImage]);

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
      navigation.back();
      navigation.setParams({ shouldReload: 1 });
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

  useEffect(() => {
    setCanSubmit(!!difficulty && !!imageUri && !!name.trim());
  }, [difficulty, imageUri, name]);

  return {
    name,
    setName,
    description,
    setDescription,
    difficulty,
    setDifficulty,
    imageUri,
    setImageUri,
    annotationsData,
    setAnnotationsData,
    locationId,
    setLocationId,
    gymName,
    setGymName,
    templates,
    showTemplates,
    setShowTemplates,
    loadingTemplates,
    canSubmit,
    loading,
    handleFetchTemplates,
    handleTemplateSelect,
    handleImagePick,
    handleSubmit,
    handleShowTemplates,
    fetchGymName,
    exportedUri,
    annotationsJSON,
  };
};
