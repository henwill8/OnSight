import React, { useRef, useState, useCallback } from "react";
import {
    View,
    Button,
    Image,
    StyleSheet,
    Dimensions,
    Animated,
    PanResponder
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

    // Animated values for transformations
    const scale = useRef(new Animated.Value(1)).current;
    const translateX = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(0)).current;
    const rotation = useRef(new Animated.Value(0)).current;

    // Store previous scale, rotation, and position values
    const lastDistance = useRef<number | null>(null); // Create a ref to store the previous distance between the two fingers
    const lastRotation = useRef<number | null>(null); // Create a ref to store the previous distance between the two fingers
    const lastTranslateX = useRef<number | null>(null); // Create a ref to store the previous distance between the two fingers
    const lastTranslateY = useRef<number | null>(null); // Create a ref to store the previous distance between the two fingers

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

        const panResponder = useRef(
            PanResponder.create({
                onStartShouldSetPanResponder: () => true,
                onMoveShouldSetPanResponder: () => true,
                onPanResponderGrant: (event) => {
                    // last distance should be null when gesture starts as there was no previous distance
                    lastDistance.current = null;
                    lastRotation.current = null;
                    lastTranslateX.current = null;
                    lastTranslateY.current = null;
                },
                onPanResponderMove: (event, gesture) => {
                    const { touches } = event.nativeEvent;
        
                    if (touches.length === 2) {
                        const dx = touches[0].pageX - touches[1].pageX;
                        const dy = touches[0].pageY - touches[1].pageY;
                        const currentDistance = Math.sqrt(dx * dx + dy * dy);
        
                        // If this is not the first movement, calculate the change in distance
                        if (lastDistance.current !== null) {
                            const distanceChange = currentDistance - lastDistance.current;
        
                            // Incrementally update scale based on the change in distance
                            const newScale = distanceChange / 200; // Adjust this value to control sensitivity
                            scale.setValue(scale.__getValue() * (newScale + 1)); // Apply scaling incrementally
                        }
        
                        // Update the last distance for the next movement
                        lastDistance.current = currentDistance;
        
                        // Calculate the rotation angle change
                        const angle = Math.atan2(dy, dx) * (180 / Math.PI);
        
                        // If this is not the first rotation, calculate the change in rotation
                        if (lastRotation.current !== null) {
                            const rotationChange = angle - lastRotation.current;
        
                            // Incrementally update rotation based on the change in angle
                            rotation.setValue(rotation.__getValue() + rotationChange);
                        }
        
                        // Update the last rotation for the next movement
                        lastRotation.current = angle;
        
                        // Calculate the center position of the two touches
                        const centerX = (touches[0].pageX + touches[1].pageX) / 2;
                        const centerY = (touches[0].pageY + touches[1].pageY) / 2;
        
                        // If this is not the first translation, calculate the change in position
                        if (lastTranslateX.current !== null && lastTranslateY.current !== null) {
                            const translateXChange = centerX - lastTranslateX.current;
                            const translateYChange = centerY - lastTranslateY.current;
        
                            // Incrementally update translation based on the change in position
                            translateX.setValue(translateX.__getValue() + translateXChange);
                            translateY.setValue(translateY.__getValue() + translateYChange);
                        }
        
                        // Update the last translate position for the next movement
                        lastTranslateX.current = centerX;
                        lastTranslateY.current = centerY;
                    }
                }
            })
        ).current;

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
        });
    };

    return (
        <View style={styles.container}>
            {imageUri && scaledImageDimensions && (
                <Animated.View
                    {...panResponder.panHandlers}
                    style={[
                        styles.imageContainer,
                        {
                            transform: [
                                { translateX },
                                { translateY },
                                { scale },
                                { rotate: rotation.interpolate({ inputRange: [-360, 360], outputRange: ["-360deg", "360deg"] }) }
                            ],
                        },
                    ]}
                >
                    <Image
                        source={{ uri: imageUri }}
                        style={{
                            width: scaledImageDimensions.width,
                            height: scaledImageDimensions.height,
                        }}
                    />
                    {renderBoundingBoxes()}
                </Animated.View>
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
    boundingBox: {
        position: "absolute",
        borderColor: "red",
        borderWidth: 2,
    },
    buttonContainer: {
        position: "absolute",
        bottom: 20,
        width: "90%",
    },
});

export default App;
