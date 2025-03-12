import React, { useRef, useState } from "react";
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

const serverAddress = "http://192.168.1.203:5000"

const App: React.FC = () => {
    const insets = useSafeAreaInsets();
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [predictions, setPredictions] = useState<any[]>([]);
    const [showPredictions, setShowPredictions] = useState<boolean>(false);
    const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);

    // Animated values for transformations
    const scale = useRef(new Animated.Value(1)).current;
    const translateX = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(0)).current;
    const rotation = useRef(new Animated.Value(0)).current;

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderMove: (event, gesture) => {
                const { touches } = event.nativeEvent;
    
                if (touches.length === 2) {
                    // Compute distance between fingers for scaling
                    const dx = touches[0].pageX - touches[1].pageX;
                    const dy = touches[0].pageY - touches[1].pageY;
                    const distance = Math.sqrt(dx * dx + dy * dy);
    
                    // Compute rotation angle between fingers
                    const angle = Math.atan2(dy, dx) * (180 / Math.PI);
    
                    // Scale based on distance
                    scale.setValue(distance / 200); // Adjust sensitivity
    
                    // Move based on average position of both fingers
                    const centerX = (touches[0].pageX + touches[1].pageX) / 2;
                    const centerY = (touches[0].pageY + touches[1].pageY) / 2;
                    translateX.setValue(centerX - screenWidth / 2);
                    translateY.setValue(centerY - screenHeight / 2);
    
                    // Rotate based on finger angle
                    rotation.setValue(angle);
                }
            },
            onPanResponderRelease: () => {},
        })
    ).current;

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

            if (!data || !data.imageSize || !Array.isArray(data.predictions)) {
                console.error("Unexpected response format", data);
                return;
            }

            setPredictions(data.predictions);
            setImageDimensions(data.imageSize);
            setShowPredictions(true);
        } catch (error) {
            console.error("Error uploading image:", error);
        }
    };

    const screenWidth = Dimensions.get("window").width;
    const screenHeight = Dimensions.get("window").height;

    const scaledImageDimensions = imageDimensions ? (() => {
        const imageAspectRatio = imageDimensions.width / imageDimensions.height;
        let scaledWidth = screenWidth;
        let scaledHeight = screenWidth / imageAspectRatio;

        if (scaledHeight > screenHeight * 0.8) {
            scaledHeight = screenHeight * 0.8;
            scaledWidth = scaledHeight * imageAspectRatio;
        }

        return { width: scaledWidth, height: scaledHeight };
    })() : null;

    return (
        <View style={styles.container}>
            {imageUri && scaledImageDimensions && (
                <Animated.View
                    {...panResponder.panHandlers}
                    style={[
                        styles.imageContainer,
                        {
                            width: scaledImageDimensions.width,
                            height: scaledImageDimensions.height,
                            transform: [
                                { translateX },
                                { translateY },
                                { scale },
                                { rotate: rotation.interpolate({ inputRange: [-360, 360], outputRange: ['-360deg', '360deg'] }) }
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
                    {showPredictions &&
                        predictions.map((box, index) => {
                            if (!Array.isArray(box) || box.length < 4) return null;
                            const [x, y, width, height] = box;

                            const scaleX = scaledImageDimensions.width / imageDimensions!.width;
                            const scaleY = scaledImageDimensions.height / imageDimensions!.height;

                            return (
                                <Animated.View
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
                        })}
                </Animated.View>
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
