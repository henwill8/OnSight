import React, { useState } from "react";
import { View, Button, Image, StyleSheet, Dimensions } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const App: React.FC = () => {
    const insets = useSafeAreaInsets();
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [predictions, setPredictions] = useState<any[]>([]);
    const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);

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
            console.log("Server Response:", data);

            if (!data || !Array.isArray(data.prediction)) {
                console.error("Unexpected response format", data);
                return;
            }

            setPredictions(data.prediction);
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
                        if (!Array.isArray(predictions)) {
                            console.warn("Predictions is not an array, skipping bounding box rendering.");
                            return null;
                        }

                        if (!predictions.length || !imageDimensions || !scaledImageDimensions) {
                            console.warn("No predictions available, or missing image dimensions.");
                            return null;
                        }

                        console.log("Total predictions:", predictions.length);

                        const boundingBoxes = [];

                        for (let index = 0; index < predictions.length; index++) {
                            const box = predictions[index];
                        
                            if (!Array.isArray(box) || box.length < 4) continue;
                        
                            const [x, y, width, height] = box;
                        
                            console.log({x, y, width, height});
                        
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