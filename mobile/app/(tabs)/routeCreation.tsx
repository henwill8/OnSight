import React, { useEffect, useState, useCallback } from "react";
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
import * as ImagePicker from "expo-image-picker";
import { useRouter, useLocalSearchParams } from "expo-router";
import RNPickerSelect from 'react-native-picker-select'; // Import the picker component

const RouteCreation = () => {
  const router = useRouter();
  const { name: passedName, description: passedDescription, difficulty: passedDifficulty, gymId: passedGymId, imageUri: passedImageUri } = useLocalSearchParams(); // Retrieve params

  const [name, setName] = useState(passedName || ''); // Use passed values or defaults
  const [description, setDescription] = useState(passedDescription || '');
  const [difficulty, setDifficulty] = useState(passedDifficulty || 'v0'); // Set initial difficulty to v0
  const [gymId, setGymId] = useState(passedGymId || '');
  const [imageUri, setImageUri] = useState(passedImageUri || '');

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
        pathname: '/routeImage',
        params: {
          imageUri: encodeURIComponent(uri),
          name,
          description,
          difficulty,
          gymId
        },
      });
    }
  }, [router, name, description, difficulty, gymId, imageUri]);

  const handleSubmit = () => {
    // Here you can handle form submission, e.g., send data to the backend
    const formData = {
      name,
      description,
      difficulty,
      gym_id: gymId,
      image_Uri: imageUri,
    };
    console.log('Form data:', formData);
    // Submit the data to your backend or API
  };

  return (
    <View style={styles.container}>
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
        style={pickerSelectStyles}
        value={difficulty}
        placeholder={{ label: 'Select Difficulty', value: null }}
      />

      <Button title="Submit" onPress={handleSubmit} />
    </View>
  );
};

const pickerSelectStyles = StyleSheet.create({
  inputIOS: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingLeft: 10,
    width: "90%",
  },
  inputAndroid: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingLeft: 10,
    width: "90%",
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 20,
    paddingLeft: 10,
    width: "90%",
  },
  buttons: {
    width: "90%",
    marginBottom: 30
  }
});

export default RouteCreation;
