import React, { useRef, useState, useCallback } from "react";
import {
    View,
    Button,
    Text,
    Image,
    StyleSheet,
    Dimensions,
    TouchableOpacity,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import ImagePanResponder from '../../components/ui/ImagePanResponder';
import ClimbingHoldButton from '../../components/ui/ClimbingHoldButton';

const serverAddress = "http://192.168.1.203:5000";

type Prediction = [number, number, number, number];
type ImageSize = { width: number; height: number };

const App: React.FC = () => {
    const insets = useSafeAreaInsets();
    
    // State
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [predictions, setPredictions] = useState<Prediction[]>([]);
    const [imageDimensions, setImageDimensions] = useState<ImageSize | null>(null);
    const [showPredictions, setShowPredictions] = useState(false);

    // Screen dimensions
    const screenWidth = Dimensions.get("window").width;
    const screenHeight = Dimensions.get("window").height;

    // Scale image while keeping aspect ratio
    const scaledImageDimensions = imageDimensions
        ? (() => {
            const aspectRatio = imageDimensions.width / imageDimensions.height;
            let width = screenWidth;
            let height = screenWidth / aspectRatio;

            if (height > screenHeight * 0.8) {
                height = screenHeight * 0.8;
                width = height * aspectRatio;
            }

            return { width, height };
        })()
        : null;

    // Handle image selection and capturing
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
            setImageUri(uri);

            Image.getSize(uri, (width, height) => {
                setImageDimensions({ width, height });
            });

            setShowPredictions(false);
            await sendImageToServer(uri);
        }
    }, []);

    // Send image to server
    const sendImageToServer = useCallback(async (uri: string) => {
        console.log("Sending to server...");

        const formData = new FormData();
        formData.append("image", {
            uri,
            name: "photo.jpg",
            type: "image/jpeg",
        } as any);

        try {
            const response = await fetch(`${serverAddress}/predict`, {
                method: "POST",
                body: formData,
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });

            const data = await response.json();

            if (data?.imageSize && Array.isArray(data.predictions)) {
                console.log("Received predictions: " + data.predictions);
                setPredictions(data.predictions);
                setImageDimensions(data.imageSize);
                setShowPredictions(true);
            } else {
                console.error("Unexpected response format", data);
            }
        } catch (error) {
            console.error("Error uploading image:", error);
        }
    }, []);

    // Render predictions (no scaling)
    const renderBoundingBoxes = () => {
        if (!showPredictions || !scaledImageDimensions) return null;

        return predictions.map((box, index) => {
            const [x, y, width, height] = box;
            const scaleX = scaledImageDimensions.width / imageDimensions!.width;
            const scaleY = scaledImageDimensions.height / imageDimensions!.height;

            return (
                <ClimbingHoldButton
                    key={index}
                    style={[
                        {
                            left: x * scaleX,
                            top: y * scaleY,
                            width: width * scaleX,
                            height: height * scaleY,
                        },
                    ]}
                />
            );
        });
    };

    return (
        <View style={styles.container}>
            {imageUri && scaledImageDimensions && (
                <ImagePanResponder>
                    <Image
                        source={{ uri: imageUri }}
                        style={{
                            width: scaledImageDimensions.width,
                            height: scaledImageDimensions.height,
                        }}
                    />
                    {renderBoundingBoxes()}
                </ImagePanResponder>
            )}

            <View style={styles.buttonContainer}>
                <Button title="Pick an Image" onPress={() => handleImagePick(false)} />
                <View style={{ marginTop: 10 }} />
                <Button title="Take a Picture" onPress={() => handleImagePick(true)} />
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
    },
    buttonContainer: {
        position: "absolute",
        bottom: 20,
        width: "90%",
    },
    transparentRedButton: {
      backgroundColor: 'rgba(255, 0, 0, 0.2)', // Transparent red (50% opacity)
      padding: 10,
      borderWidth: 1,
      borderColor: '#fff', // You can adjust the border color if needed
      borderRadius: 5,
    },
    buttonText: {
      color: '#fff', // Text color (white)
      fontSize: 16,
      textAlign: 'center',
    },
});

export default App;
