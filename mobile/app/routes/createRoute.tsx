import React, { useEffect, useState, useCallback } from "react";
import { View, TextInput, Button, Text, StyleSheet, Alert, TouchableOpacity, ScrollView } from 'react-native';
import * as ImagePicker from "expo-image-picker";
import { useRouter, useLocalSearchParams } from "expo-router";
import { setItemAsync, getItemAsync } from 'expo-secure-store';
import { useFocusEffect } from '@react-navigation/native';
import RNPickerSelect from 'react-native-picker-select';
import { COLORS, SHADOWS, SIZES, globalStyles } from '@/constants/theme';
import config from "@/config";
import { getFileType } from '@/components/FileUtils';

const CreateRouteScreen = () => {
  const router = useRouter();
  
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [difficulty, setDifficulty] = useState<string>('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [canSubmit, setCanSubmit] = useState(false);

  const { exportedUri } = useLocalSearchParams();

  useFocusEffect(
    useCallback(() => {
      if (exportedUri) {
        setImageUri(exportedUri);
      }
    }, [exportedUri])
  );

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
    if (imageUri) {
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

        const response = await fetch(config.API_URL + '/api/create-route', {
          method: "POST",
          body: formData,
        });
  
        const data = await response.json();
        if (response.ok) {
          Alert.alert('Success', 'Route created successfully!');
          router.replace("/(tabs)/home");
        } else {
          console.error('Error creating route:', data.error);
        }
      } catch (error) {
        console.error('Error fetching the image:', error);
      }
    } else {
      console.error('Image URI is missing');
    }
  };  

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      style={{ backgroundColor: COLORS.backgroundPrimary }}
    >
      <Text style={styles.title}>Create a Route</Text>

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.button} onPress={() => handleImagePick(false)}>
          <Text style={styles.buttonText}>Pick an Image</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => handleImagePick(true)}>
          <Text style={styles.buttonText}>Take a Picture</Text>
        </TouchableOpacity>
      </View>

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

      {/* Difficulty Dropdown */}
      {/* Difficulty Dropdown */}
      {/* <RNPickerSelect
        onValueChange={(value) => setDifficulty(value)}
        items={[
          { label: 'v0', value: 'v0' },
          { label: 'v1', value: 'v1' },
          { label: 'v2', value: 'v2' },
          { label: 'v3', value: 'v3' },
          { label: 'v4', value: 'v4' },
          { label: 'v5', value: 'v5' },
          { label: 'v6', value: 'v6' },
          { label: 'v7', value: 'v7' },
          { label: 'v8', value: 'v8' },
          { label: 'v9', value: 'v9' },
          { label: 'v10', value: 'v10' },
          { label: 'v11', value: 'v11' },
          { label: 'v12', value: 'v12' },
          { label: 'v13', value: 'v13' },
          { label: 'v14', value: 'v14' },
          { label: 'v15', value: 'v15' },
          { label: 'v16', value: 'v16' },
          { label: 'v17', value: 'v17' },
        ]}
        value={difficulty}
        placeholder={{ label: 'Select Difficulty', value: null }}
        style={{
          inputIOS: styles.picker,
          inputAndroid: styles.picker,
          placeholder: { color: 'gray' },
        }}
      /> */}

      <TextInput
        style={styles.textInput}
        placeholder="Difficulty"
        value={difficulty}
        onChangeText={setDifficulty}
        placeholderTextColor={COLORS.textSecondary}
      />


      <TouchableOpacity
        style={[styles.submitButton, { backgroundColor: canSubmit ? COLORS.primary : '#B0B0B0' }]}
        onPress={handleSubmit}
        disabled={!canSubmit}
      >
        <Text style={styles.submitButtonText}>Submit</Text>
      </TouchableOpacity>

      {!canSubmit && (
        <Text style={styles.incompleteMessage}>
          Please fill in all fields before submitting.
        </Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: COLORS.textPrimary,
  },
  buttons: {
    marginBottom: 20,
  },
  button: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: SIZES.borderRadius,
    alignItems: 'center',
    marginBottom: 10,
    // ...SHADOWS.small,
  },
  buttonText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  textInput: {
    borderWidth: 1,
    marginBottom: 10,
    padding: 10,
    color: COLORS.textPrimary,
    borderColor: COLORS.border,
    borderRadius: SIZES.borderRadius,
    backgroundColor: COLORS.backgroundSecondary,
    // ...SHADOWS.small,
  },
  picker: {
    height: 52,
    marginBottom: 20,
    paddingHorizontal: 10,
    borderRadius: SIZES.borderRadius,
    backgroundColor: COLORS.backgroundSecondary,
    color: COLORS.textPrimary,
    // ...SHADOWS.small,
  },
  submitButton: {
    padding: 15,
    borderRadius: SIZES.borderRadius,
    alignItems: 'center',
    // ...SHADOWS.small,
  },
  submitButtonText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
  incompleteMessage: {
    color: 'red',
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
  },
});

export default CreateRouteScreen;