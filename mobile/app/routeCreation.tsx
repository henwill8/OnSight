import React, { useRef, useState, useCallback, useEffect } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from "expo-router";
import ClimbingHoldButton from '../components/ui/ClimbingHoldButton';
import PanRotateZoomView from '../components/ui/PanRotateZoomView';

const serverAddress = "http://192.168.1.203:5000";

type Prediction = [number, number, number, number];
type ImageSize = { width: number; height: number };

const RouteCreation: React.FC = () => {
  const router = useRouter();
  const { imageUri } = useLocalSearchParams();
  
  const imageUriString = Array.isArray(imageUri) ? imageUri[0] : imageUri;

  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [imageDimensions, setImageDimensions] = useState<ImageSize | null>(null);
  
  useEffect(() => {
    if (imageUri) {
      Image.getSize(imageUriString, (width, height) => {
        setImageDimensions({ width, height });
      });

      sendImageToServer(imageUriString);
    }
  }, [imageUri]);

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
      const test = await fetch(`${serverAddress}`, { method: "GET" });
      const w = await test.json();  // Parse the response body as JSON
      console.log(w);  // Log the parsed JSON data

      const response = await fetch(`${serverAddress}/predict`, {
        method: "POST",
        body: formData
      });

      const data = await response.json();

      if (data?.imageSize && Array.isArray(data.predictions)) {
        let num_predictions = data.predictions.length;
        console.log("Received " + num_predictions + " predictions");
        
        setPredictions(data.predictions);
        setImageDimensions(data.imageSize);
      } else {
        console.error("Unexpected response format", data);
      }
    } catch (error) {
      console.error("Error uploading image:", error);

      router.back();
    }
  }, []);
  
  const renderBoundingBoxes = () => {
    return predictions.map((box, index) => {
      const [x, y, width, height] = box;
      const scaleX = scaledImageDimensions!.width / imageDimensions!.width;
      const scaleY = scaledImageDimensions!.height / imageDimensions!.height;

      return (
        <ClimbingHoldButton
          key={index}
          style={[{
            left: x * scaleX,
            top: y * scaleY,
            width: width * scaleX,
            height: height * scaleY,
          }]}
        />
      );
    });
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => router.back()} // Use router.back() for navigation
      >
        {/* <Image source={require('../assets/close.png')} style={styles.closeIcon} /> */}
      </TouchableOpacity>

      {scaledImageDimensions && (
        <PanRotateZoomView>
          <Image
            source={{ uri: imageUriString }}
            style={{
              width: scaledImageDimensions!.width,
              height: scaledImageDimensions!.height,
            }}
          />
          {renderBoundingBoxes()}
        </PanRotateZoomView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain',
  },
  boundingBox: {
    position: 'absolute',
    borderColor: 'red',
    borderWidth: 2,
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
  },
  closeIcon: {
    width: 24,
    height: 24,
  },
});

export default RouteCreation;
