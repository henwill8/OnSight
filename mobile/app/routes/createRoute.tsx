import React, { useEffect, useState, useCallback } from "react";
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import * as ImagePicker from "expo-image-picker";
import { useRouter, useLocalSearchParams } from "expo-router";
import { setItemAsync, getItemAsync } from 'expo-secure-store';
import { useFocusEffect } from '@react-navigation/native';
import RNPickerSelect from 'react-native-picker-select';
import { COLORS, SHADOWS, SIZES, globalStyles } from '@/constants/theme';
import config from "@/config";

const CreateRouteScreen = () => {
  const router = useRouter();
  
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [difficulty, setDifficulty] = useState<string | null>(null);
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
        formData.append("name", name);  // Assuming name is populated
        formData.append("description", description);  // Assuming description is populated
        formData.append("difficulty", difficulty);  // Assuming difficulty is populated
        formData.append("gym_id", gymId);  // Assuming gymId is populated

        // Assuming imageUri is a valid file path or URI
        const imageFile = {
          uri: imageUri, // The URI of the image
          name: "photo.jpg",  // The name of the image file
          type: "image/jpeg",  // The file type
        };

        formData.append("image", imageFile);

        // Log the form data contents
        formData.forEach((value, key) => {
          console.log(key, value);
        });

        // Send the form data
        const response = await fetch(config.API_URL + '/api/create-route', {
          method: "POST",
          body: formData,
        });
  
        const data = await response.json();
        if (response.ok) {
          console.log('Route created successfully:', data);

          // Show success alert
          Alert.alert('Success', 'Route created successfully!');

          // Reset form data
          setName('');
          setDescription('');
          setDifficulty('');
          setImageUri('');

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
    <View style={globalStyles.container}>
      <Text style={styles.title}>Create a Route</Text>

      <View style={styles.buttons}>
        <Button title="Pick an Image" onPress={() => handleImagePick(false)} />
        <View style={{ marginTop: 10 }} />
        <Button title="Take a Picture" onPress={() => handleImagePick(true)} />
      </View>

      <TextInput
        style={styles.input}
        placeholder="Route Name"
        value={name}
        onChangeText={setName}
      />

      <TextInput
        style={styles.input}
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
      />

      {/* Difficulty Dropdown */}
      <RNPickerSelect
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
      />

      <Button
        title="Submit"
        onPress={handleSubmit}
        disabled={!canSubmit}
        color={canSubmit ? '#4CAF50' : '#B0B0B0'}
      />

      {!canSubmit && (
        <Text style={styles.incompleteMessage}>
          Please fill in all fields before submitting.
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingLeft: 10,
    borderRadius: 5,
  },
  buttons: {
    color: COLORS.primary,
    marginBottom: 20,
  },
  picker: {
    height: 52,
    marginBottom: 20,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: 'white',
    color: 'black',
  },
  incompleteMessage: {
    color: 'red',
    fontSize: 14,
    marginTop: 10,
    textAlign: 'center',
  },
});

export default CreateRouteScreen;
