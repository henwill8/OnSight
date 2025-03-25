import React, { useEffect, useState, useCallback, useLayoutEffect } from "react";
import { View, TextInput, Button, Text, StyleSheet, Alert, TouchableOpacity, ScrollView, Image, Modal, ActivityIndicator } from 'react-native';
import * as ImagePicker from "expo-image-picker";
import { useRouter, useLocalSearchParams, useNavigation } from "expo-router";
import { setItemAsync, getItemAsync } from 'expo-secure-store';
import { useFocusEffect } from '@react-navigation/native';
import RNPickerSelect from 'react-native-picker-select';
import { COLORS, SHADOWS, SIZES, globalStyles } from '@/constants/theme';
import config from "@/config";
import { getFileType } from '@/components/FileUtils';
import { fetchWithTimeout } from "@/utils/api";
import LoadingModal from '@/components/ui/LoadingModal';

const CreateRouteScreen = () => {
  const router = useRouter();
  const navigation = useNavigation();
  
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [difficulty, setDifficulty] = useState<string>('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [canSubmit, setCanSubmit] = useState(false);
  const [gymName, setGymName] = useState<string>('');
  const [loading, setLoading] = useState(false);  // State for loading modal

  const { exportedUri } = useLocalSearchParams();

  useFocusEffect(
    useCallback(() => {
      if (exportedUri) {
        setImageUri(exportedUri);
      }
    }, [exportedUri])
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Create Route",
      headerStyle: { backgroundColor: COLORS.backgroundSecondary },
      headerTintColor: "white"
    });

    fetchCurrentGymName();
  }, [navigation]);

  const fetchCurrentGymName = async () => {
    const currentGymName = await getItemAsync("gymName");
    setGymName(currentGymName || "");
  };

  useEffect(() => {
    setCanSubmit(!!difficulty && !!imageUri);
  }, [difficulty, imageUri]);

  const handleImagePick = useCallback(async (useCamera: boolean) => {
    const permission = useCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permission.status !== "granted") {
      alert("Permission is required!");
      return;
    }

    const pickerResult = useCamera
      ? await ImagePicker.launchCameraAsync({ quality: 1 })
      : await ImagePicker.launchImageLibraryAsync({ quality: 1 });

    if (pickerResult.assets && pickerResult.assets.length > 0) {
      const uri = pickerResult.assets[0].uri;

      router.push({
        pathname: '/routes/routeImage',
        params: {
          imageUri: encodeURIComponent(uri),
          name,
          description,
          difficulty
        },
      });
    }
  }, [name, description, difficulty]);

  const handleSubmit = async () => {
    if (!imageUri) return console.error('Image URI is missing');
    
    setLoading(true);  // Show the loading modal

    try {
      const gymId = await getItemAsync("gymId");

      const formData = new FormData();
      formData.append("name", name);  
      formData.append("description", description);  
      formData.append("difficulty", difficulty || "");  
      formData.append("gym_id", gymId || "");  

      const { extension, mimeType } = getFileType(imageUri);
      formData.append("image", {
        uri: imageUri,
        name: `photo.${extension}`,
        type: mimeType,
      } as any);

      const response = await fetchWithTimeout(config.API_URL + '/api/create-route', {
        method: "POST",
        body: formData,
      }, 5000);

      const data = await response.json();
      if (response.ok) {
        Alert.alert('Success', 'Route created successfully!');
        router.replace("/(tabs)/home");
      } else {
        console.error('Error creating route:', data.error);
        Alert.alert('Error', 'Failed to create route');
      }
    } catch (error) {
      console.error('Error fetching the image:', error);
      Alert.alert('Error', 'An error occurred while creating the route');
    } finally {
      setLoading(false);  // Hide the loading modal
    }
  };

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      style={{ backgroundColor: COLORS.backgroundPrimary }}
    >
      <Text style={[styles.title, { textAlign: "center", marginBottom: 25 }]}>{gymName}</Text>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={styles.button} onPress={() => handleImagePick(false)}>
          <Text style={styles.buttonText}>Pick an Image</Text>
        </TouchableOpacity>

        <Text style={[styles.buttonText, { textAlign: "center" }]}>OR</Text>

        <TouchableOpacity style={styles.button} onPress={() => handleImagePick(true)}>
          <Text style={styles.buttonText}>Take a Picture</Text>
        </TouchableOpacity>
      </View>

      {imageUri && (
        <Image 
          source={{ uri: imageUri }} 
          style={styles.imagePreview} 
        />
      )}

      <TextInput
        style={styles.textInput}
        placeholder="Route Name"
        value={name}
        onChangeText={setName}
        placeholderTextColor={COLORS.textSecondary}
      />

      <TextInput
        style={styles.textInput}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
        placeholderTextColor={COLORS.textSecondary}
        multiline
      />

      <TextInput
        style={[styles.textInput, { marginBottom: 30 }]}
        placeholder="Difficulty"
        value={difficulty}
        onChangeText={setDifficulty}
        placeholderTextColor={COLORS.textSecondary}
      />

      <TouchableOpacity
        style={[styles.submitButton, { backgroundColor: canSubmit ? '#2f8f4c' : '#B0BEC5' }]}
        onPress={handleSubmit}
        disabled={!canSubmit}
      >
        <Text style={[styles.submitButtonText, { color: canSubmit ? COLORS.textPrimary : '#2e2e2e' }]}>Submit</Text>
      </TouchableOpacity>

      {!canSubmit && (
        <Text style={styles.incompleteMessage}>
          Please fill in all fields before submitting.
        </Text>
      )}

      {/* Loading Modal */}
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
  buttonsContainer: {
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: 130,
    marginBottom: 20,
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
