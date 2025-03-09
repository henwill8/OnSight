import React, { useState } from "react";
import { View, Button, Image, Text } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const App: React.FC = () => {
    const insets = useSafeAreaInsets();
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [result, setResult] = useState<any>(null);
    const [serverTestResult, setServerTestResult] = useState<string | null>(null);

    const selectImage = async () => {
        // Ask for permissions first
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            alert("Permission to access gallery is required!");
            return;
        }
  
        // Launch the image picker
        const pickerResult = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            quality: 1,
        });
  
        if (pickerResult.assets && pickerResult.assets.length > 0) {
            // If an image is selected
            const uri = pickerResult.assets[0].uri;
            setImageUri(uri);
            await sendImageToServer(uri);
        } else {
            // If no image is selected (cancelled or empty selection)
            alert("No image selected or operation cancelled.");
        }
    };

    const sendImageToServer = async (uri: string) => {
        const formData = new FormData();
        formData.append("image", {
            uri,
            name: "photo.jpg",
            type: "image/jpeg",
        } as any);

        try {
            const response = await fetch("http://192.168.1.203:5000/predict", {
                method: "POST",
                body: formData,
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            const data = await response.json();
            console.log(data);
            setResult(data);
        } catch (error) {
            console.error("Error uploading image:", error);
        }
    };

    const testServerConnection = async () => {
        try {
            const response = await fetch("http://192.168.1.203:5000/");
            if (response.ok) {
                const data = await response.json();
                setServerTestResult("Server is reachable: " + JSON.stringify(data));
            } else {
                setServerTestResult("Server responded with status: " + response.status);
            }
        } catch (error) {
            setServerTestResult("Error connecting to server: " + error.message);
        }
    };

    return (
        <View style={{ paddingTop: insets.top, paddingBottom: insets.bottom, flex: 1 }}>
            <Button title="Pick an Image" onPress={selectImage} />
            {imageUri && <Image source={{ uri: imageUri }} style={{ width: 200, height: 200 }} />}
            {result && <Text>Prediction: {JSON.stringify(result)}</Text>}
            <Button title="Test server" onPress={testServerConnection} />
            {serverTestResult && <Text>{serverTestResult}</Text>}
        </View>
    );
};

export default App;
