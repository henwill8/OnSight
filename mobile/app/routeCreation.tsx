import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Text, ActivityIndicator, Modal, View, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from "expo-router";
import ClimbingHoldButton from '../components/ui/ClimbingHoldButton';
import PanRotateZoomView, { PanRotateZoomViewRef } from '../components/ui/PanRotateZoomView';

const dev = false; // Switch to __DEV__ once you can get that working

type Prediction = [number, number, number, number];
type ImageSize = { width: number; height: number };

const RouteCreation: React.FC = () => {
  const serverAddress = dev ? "http://192.168.1.203:5000" : "https://thecarpenterwall.com";
  console.log("Using server address " + serverAddress);

  const router = useRouter();
  const { imageUri } = useLocalSearchParams();
  
  const imageUriString = Array.isArray(imageUri) ? imageUri[0] : imageUri;

  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [imageDimensions, setImageDimensions] = useState<ImageSize | null>(null);
  
  const panRotateZoomViewRef = useRef<PanRotateZoomViewRef>(null);

  const [dataReceived, setDataReceived] = useState(false);

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
  
  const handleError = (message: string) => {
    console.error(message);
    router.back();
  };

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
        body: formData
      });

      if (!response.ok) {
        handleError(`Server error: ${response.status}`);
        return;
      }

      const data = await response.json();

      if (data?.imageSize && Array.isArray(data.predictions)) {
        let num_predictions = data.predictions.length;
        console.log("Received " + num_predictions + " predictions");

        setPredictions(data.predictions);
        setImageDimensions(data.imageSize);
        setDataReceived(true);
      } else {
        handleError("Unexpected response format");
      }
    } catch (error) {
      handleError("Error uploading image: " + error);
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

  // Handle export button
  const handleExport = async () => {
    if (panRotateZoomViewRef.current) {
      await panRotateZoomViewRef.current.exportView();
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => router.back()} // Use router.back() for navigation
      >
        <Image source={require('../assets/images/close.png')} style={styles.closeIcon} />
      </TouchableOpacity>

      {scaledImageDimensions && (
        <PanRotateZoomView ref={panRotateZoomViewRef}>
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

      {/* Export Button */}
      <TouchableOpacity style={styles.exportButton} onPress={handleExport}>
        <Text style={styles.exportButtonText}>Export</Text>
      </TouchableOpacity>

      <Modal
        transparent={true}
        visible={!dataReceived}
        animationType="fade"
      >
        <View style={styles.overlay}>
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>Detecting Climbing Holds...</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
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
  exportButton: {
    position: 'absolute',
    bottom: 40,
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    zIndex: 10,
  },
  exportButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  loaderContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#333',
    padding: 20,
    borderRadius: 10,
  },
  loadingText: {
    color: '#fff',
    marginTop: 10,
    fontSize: 16,
  },
});

export default RouteCreation;
