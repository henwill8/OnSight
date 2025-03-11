import React, { useState } from "react";
import { View, Button, Image, StyleSheet, Dimensions } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const serverAddress = "http://192.168.1.203:5000"

const App: React.FC = () => {
    const insets = useSafeAreaInsets();
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [predictions, setPredictions] = useState<any[]>([]);
    const [showPredictions, setShowPredictions] = useState<boolean>(false);
    const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);

    const takePicture = async () => {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
            alert("Permission to access camera is required!");
            return;
        }
    
        const pickerResult = await ImagePicker.launchCameraAsync({
            allowsEditing: false,
            quality: 1,
        });

        setShowPredictions(false);
    
        if (pickerResult.assets && pickerResult.assets.length > 0) {
            const uri = pickerResult.assets[0].uri;
            setImageUri(uri);
    
            Image.getSize(uri, (width, height) => {
                setImageDimensions({ width, height });
            });
    
            await sendImageToServer(uri);
        } else {
            alert("No image captured or operation cancelled.");
        }
    };    

    const selectImage = async () => {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
            alert("Permission to access gallery is required!");
            return;
        }

        const pickerResult = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            quality: 1,
        });

        setShowPredictions(false);

        if (pickerResult.assets && pickerResult.assets.length > 0) {
            const uri = pickerResult.assets[0].uri;
            setImageUri(uri);

            Image.getSize(uri, (width, height) => {
                setImageDimensions({ width, height });
            });

            await sendImageToServer(uri);
        } else {
            alert("No image selected or operation cancelled.");
        }
    };

    const sendImageToServer = async (uri: string) => {
        console.log("sending to server");
    
        const formData = new FormData();
        formData.append("image", {
            uri,
            name: "photo.jpg",
            type: "image/jpeg",
        } as any);
    
        try {
            const response = await fetch(serverAddress + "/predict", {
                method: "POST",
                body: formData,
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
    
            const data = await response.json();
            console.log("Server Response:", data);
    
            // Check for the expected format
            if (!data || !data.imageSize || !Array.isArray(data.predictions)) {
                console.error("Unexpected response format", data);
                return;
            }
    
            // Set the predictions and image size
            setPredictions(data.predictions);
            setImageDimensions(data.imageSize);  // Set image dimensions from server
            setShowPredictions(true);
        } catch (error) {
            console.error("Error uploading image:", error);
        }
    };

    // Get screen width and height
    const screenWidth = Dimensions.get("window").width;
    const screenHeight = Dimensions.get("window").height;

    // Calculate image scaling while keeping the aspect ratio
    const scaledImageDimensions = imageDimensions ? (() => {
        const imageAspectRatio = imageDimensions.width / imageDimensions.height;
        let scaledWidth = screenWidth;
        let scaledHeight = screenWidth / imageAspectRatio;

        if (scaledHeight > screenHeight * 0.8) { // Limit to 80% of screen height
            scaledHeight = screenHeight * 0.8;
            scaledWidth = scaledHeight * imageAspectRatio;
        }

        return { width: scaledWidth, height: scaledHeight };
    })() : null;

    return (
        <View style={styles.container}>
            {imageUri && scaledImageDimensions && (
                <View style={[styles.imageContainer, { width: scaledImageDimensions.width, height: scaledImageDimensions.height }]}>
                    <Image 
                        source={{ uri: imageUri }}
                        style={{
                            width: scaledImageDimensions.width,
                            height: scaledImageDimensions.height,
                        }}
                    />
                    {(() => {
                        if (!showPredictions) {
                            return null;
                        }

                        if (!Array.isArray(predictions)) {
                            console.warn("Predictions is not an array, skipping bounding box rendering.");
                            return null;
                        }

                        if (!predictions.length || !imageDimensions || !scaledImageDimensions) {
                            console.warn("No predictions available, or missing image dimensions.");
                            return null;
                        }

                        console.log("Total predictions:", predictions.length);
                        console.log({imageDimensions, scaledImageDimensions})

                        const boundingBoxes = [];

                        for (let index = 0; index < predictions.length; index++) {
                            const box = predictions[index];

                            // Ensure the box format is valid (e.g., [x, y, width, height])
                            if (!Array.isArray(box) || box.length < 4) continue;

                            const [x, y, width, height] = box;

                            // Scale the bounding boxes according to the image dimensions
                            const scaleX = scaledImageDimensions.width / imageDimensions.width;
                            const scaleY = scaledImageDimensions.height / imageDimensions.height;

                            boundingBoxes.push(
                                <View
                                    key={index}
                                    style={[
                                        styles.boundingBox,
                                        {
                                            left: x * scaleX,
                                            top: y * scaleY,
                                            width: width * scaleX,
                                            height: height * scaleY,
                                        },
                                    ]}
                                />
                            );
                        }

                        return boundingBoxes;
                    })()}
                </View>
            )}
            <View style={{ position: "absolute", bottom: insets.bottom + 10, width: "90%" }}>
                <Button title="Pick an Image" onPress={selectImage} />
                <View style={{ marginTop: 10 }} />
                <Button title="Take a Picture" onPress={takePicture} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    imageContainer: {
        position: "relative",
        alignItems: "center",
        justifyContent: "center",
    },
    boundingBox: {
        position: "absolute",
        borderColor: "red",
        borderWidth: 2,
    },
});

export default App;