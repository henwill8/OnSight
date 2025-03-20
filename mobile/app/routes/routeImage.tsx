import React, { useRef, useState, useCallback, useEffect } from 'react';
import { Alert, Text, ActivityIndicator, Modal, View, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from "expo-router";
import ClimbingHoldButton from '@/components/ui/ClimbingHoldButton';
import PanRotateZoomView, { PanRotateZoomViewRef } from '@/components/ui/PanRotateZoomView';
import DrawingCanvas from "@/components/ui/DrawingCanvas";
import { COLORS, SHADOWS, SIZES, HOLD_SELECTION_COLORS, globalStyles } from '@/constants/theme';
import config from '@/config';

type Prediction = [number, number, number, number];
type ImageSize = { width: number; height: number };

const RouteImage: React.FC = () => {
  const router = useRouter();
  const { imageUri } = useLocalSearchParams();
  const imageUriString = Array.isArray(imageUri) ? imageUri[0] : imageUri;

  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [imageDimensions, setImageDimensions] = useState<ImageSize | null>(null);
  const [dataReceived, setDataReceived] = useState(false);
  const [showBoundingBoxes, setShowBoundingBoxes] = useState<boolean>(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(null); // New state for color selection

  const panRotateZoomViewRef = useRef<PanRotateZoomViewRef>(null);

  useEffect(() => {
    if (imageUriString) {
      Image.getSize(imageUriString, (width, height) => {
        setImageDimensions({ width, height });
      });

      sendImageToServer(imageUriString);
    } else {
      console.error("No imageUri provided");
    }
  }, [imageUriString]);

  const handleToggleBoundingBoxes = () => {
    setShowBoundingBoxes(prev => !prev);
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(prevColor => {
      const newColor = prevColor === color ? null : color; // Toggle selection
      console.log(`Selected color changed to: ${newColor ?? "None"}`); // Log when color changes
      return newColor;
    });
  };

  const handleExport = async () => {
    if (panRotateZoomViewRef.current) {
      const uri = await panRotateZoomViewRef.current.exportView();
      router.back();
      router.setParams({ exportedUri: encodeURIComponent(uri) });
    }
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
      const response = await fetch(config.API_URL + '/api/predict', {
        method: "POST",
        body: formData
      });

      if (!response.ok) {
        handleError(`Server error: ${response.status}`);
        return;
      }

      const data = await response.json();

      if (data?.imageSize && Array.isArray(data.predictions)) {
        console.log(`Received ${data.predictions.length} predictions`);
        setPredictions(data.predictions);
        setDataReceived(true);
        setImageDimensions(data.imageSize);
      } else {
        handleError("Unexpected response format");
      }
    } catch (error) {
      handleError(`Error uploading image: ${error}`);
    }
  }, []);

  const handleError = (message: string) => {
    console.error(message);
    setDataReceived(true);
    Alert.alert("Predictions Failed!", "Hold predictions failed, but you can still draw.");
  };

  const renderBoundingBoxes = () => {
    return predictions
      .sort((a, b) => (b[2] * b[3]) - (a[2] * a[3])) // Smallest areas on top
      .map((box, index) => {
        const [x, y, width, height] = box;
        const scaleX = scaledImageDimensions!.width / imageDimensions!.width;
        const scaleY = scaledImageDimensions!.height / imageDimensions!.height;

        return (
          <ClimbingHoldButton
            key={index}
            style={{
              left: x * scaleX,
              top: y * scaleY,
              width: width * scaleX,
              height: height * scaleY,
            }}
            showUnselectedHolds={showBoundingBoxes}
          />
        );
      });
  };

  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;

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

  return (
    <View style={styles.container}>
      <View style={styles.colorSelectionContainer}>
        {[HOLD_SELECTION_COLORS.intermediate, HOLD_SELECTION_COLORS.start, HOLD_SELECTION_COLORS.end].map((color) => (
          <TouchableOpacity
            key={color}
            style={[
              styles.colorButton,
              { backgroundColor: color, borderWidth: selectedColor === color ? 5 : 1 },
            ]}
            onPress={() => handleColorSelect(color)}
          />
        ))}
      </View>

      <TouchableOpacity style={styles.toggleButton} onPress={handleToggleBoundingBoxes}>
        <Text style={styles.toggleButtonText}>
          {showBoundingBoxes ? "Hide" : "Show"} Unselected Holds
        </Text>
      </TouchableOpacity>

      {scaledImageDimensions && (
        <PanRotateZoomView enableRotate={false} ref={panRotateZoomViewRef}>
          <Image
            source={{ uri: imageUriString }}
            style={{
              width: scaledImageDimensions!.width,
              height: scaledImageDimensions!.height,
            }}
          />
          {renderBoundingBoxes()}
          <DrawingCanvas
            enabled={!!selectedColor} // Disable drawing if no color is selected
            color={selectedColor || "gray"}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              zIndex: 10,
            }}
          />
        </PanRotateZoomView>
      )}

      <TouchableOpacity style={styles.exportButton} onPress={handleExport}>
        <Text style={styles.exportButtonText}>Save</Text>
      </TouchableOpacity>

      <Modal transparent={true} visible={!dataReceived} animationType="fade">
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
  colorSelectionContainer: {
    flexDirection: "row",
    position: "absolute",
    top: 40,
    alignSelf: "center",
    zIndex: 10,
    backgroundColor: "#ffffffaa",
    padding: 8,
    borderRadius: 10,
  },
  colorButton: {
    width: 40,
    height: 40,
    marginHorizontal: 10,
    borderRadius: 20,
    borderColor: "black",
  },
  toggleButton: {
    position: "absolute",
    bottom: 100,
    backgroundColor: "#2196F3",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    zIndex: 10,
  },
  toggleButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  exportButton: {
    position: "absolute",
    bottom: 40,
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    zIndex: 10,
  },
  exportButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  loaderContainer: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#333",
    padding: 20,
    borderRadius: 10,
  },
  loadingText: {
    color: "#fff",
    marginTop: 10,
    fontSize: 16,
  },
});

export default RouteImage;

