import React, { useRef, useState, useCallback, useEffect, useLayoutEffect } from 'react';
import { Alert, Text, ActivityIndicator, Modal, View, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter, useNavigation } from "expo-router";
import ClimbingHoldButton from '@/components/ui/ClimbingHoldButton';
import { ReactNativeZoomableView } from '@openspacelabs/react-native-zoomable-view';
import DrawingCanvas from "@/components/ui/DrawingCanvas";
import { COLORS, SHADOWS, SIZES, HOLD_SELECTION_COLORS, globalStyles } from '@/constants/theme';
import config from '@/config';
import { getFileType } from '@/components/FileUtils';
import ViewShot from 'react-native-view-shot';

type Prediction = [number, number, number, number];
type ImageSize = { width: number; height: number };

const RouteImage: React.FC = () => {
  const router = useRouter();
  const navigation = useNavigation();

  const { imageUri } = useLocalSearchParams();
  const imageUriString = Array.isArray(imageUri) ? imageUri[0] : imageUri;

  const [predictions, setPredictions] = useState<Prediction[]>([]); // Bounding boxes data
  const [imageDimensions, setImageDimensions] = useState<ImageSize | null>(null); // Image size
  const [dataReceived, setDataReceived] = useState(false); // Whether data has been received
  const [showBoundingBoxes, setShowBoundingBoxes] = useState<boolean>(false); // Show bounding boxes state
  const [selectedColor, setSelectedColor] = useState<string | null>(null); // Color selection state

  const drawingCanvasRef = useRef(null);
  const viewShotRef = useRef<ViewShot>(null);
  
  useLayoutEffect(() => {
    navigation.setOptions({
      title: "Create Route Image",
      headerStyle: { backgroundColor: COLORS.backgroundSecondary },
      headerTintColor: "white"
    });
  }, [navigation]);

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
    setShowBoundingBoxes(false);

    if (viewShotRef.current) {
      try {
        await new Promise((resolve) => setTimeout(resolve, 500)); // Add a small delay to ensure rendering

        // Capture the entire zoomable view
        const uri = await await viewShotRef.current.capture();
  
        console.log("Captured image URI: ", uri);
        router.back(); // Go back to previous screen
        router.setParams({ exportedUri: encodeURIComponent(uri) }); // Pass URI to router params
      } catch (error) {
        console.error("Error exporting image: ", error);
        Alert.alert("Export Failed", "There was an error exporting the image.");
      }
    }
  };

  const sendImageToServer = useCallback(async (uri: string) => {
    console.log("Sending to server...");

    const formData = new FormData();

    const { extension, mimeType } = getFileType(uri);
    formData.append("image", {
      uri,
      name: `photo.${extension}`,
      type: mimeType,
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
            style={{ // position is already absolute
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

  const handleUndo = () => {
    // Call the undo function of the DrawingCanvas
    if (drawingCanvasRef.current) {
      drawingCanvasRef.current.undo();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.colorSelectionContainer}>
        {[HOLD_SELECTION_COLORS.intermediate, HOLD_SELECTION_COLORS.start, HOLD_SELECTION_COLORS.end].map((color) => (
          <TouchableOpacity
            key={color}
            style={[styles.colorButton, { backgroundColor: color, borderWidth: selectedColor === color ? 5 : 1 }]}
            onPress={() => handleColorSelect(color)}
          />
        ))}

        {/* Undo Button next to the color buttons */}
        <TouchableOpacity style={styles.undoButton} onPress={handleUndo}>
          <Text style={styles.undoButtonText}>Undo</Text>
        </TouchableOpacity>
      </View>

      {scaledImageDimensions && (
        <ReactNativeZoomableView
          maxZoom={10.0}
          minZoom={0.5}
          zoomStep={0.5}
          initialZoom={1.0}
          bindToBorders={true}
          style={{ width: scaledImageDimensions.width, height: scaledImageDimensions.height }}
        >
          {/* This second container is necessary for some reason, idk why you cant just have the zoomable view position be relative */}
          <ViewShot ref={viewShotRef} options={{ format: "jpg", quality: 0.9 }} style={{ position: 'relative', width: scaledImageDimensions!.width, height: scaledImageDimensions!.height }}>
            <Image
              source={{ uri: imageUriString }}
              style={{
                top: 0,
                borderRadius: SIZES.borderRadius,
                width: scaledImageDimensions!.width,
                height: scaledImageDimensions!.height,
              }}
            />
            {renderBoundingBoxes()}
            <DrawingCanvas
              ref={drawingCanvasRef} // Reference to DrawingCanvas
              enabled={!!selectedColor} // Disable drawing if no color is selected
              color={selectedColor || "gray"}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: scaledImageDimensions!.width,
                height: scaledImageDimensions!.height,
                zIndex: 10,
              }}
            />
          </ViewShot>
        </ReactNativeZoomableView>
      )}

      <TouchableOpacity style={styles.toggleButton} onPress={handleToggleBoundingBoxes}>
        <Text style={styles.toggleButtonText}>{showBoundingBoxes ? "Hide" : "Show"} Unselected Holds</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.exportButton} onPress={handleExport}>
        <Text style={styles.exportButtonText}>Save</Text>
      </TouchableOpacity>

      <Modal transparent={true} visible={!dataReceived} animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.loaderContainer}>
            <ActivityIndicator size="large" color="#fff" />
            <Text style={styles.loadingText}>Detecting Climbing Holds...{"\n"}(may take up to 10 seconds)</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.backgroundPrimary
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
  undoButton: {
    backgroundColor: "#f44336",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginLeft: 10,
  },
  undoButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  toggleButton: {
    position: 'absolute',
    bottom: 80,
    width: '75%',
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    zIndex: 10,
  },
  toggleButtonText: {
    color: COLORS.textPrimary,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
  },
  exportButton: {
    position: "absolute",
    bottom: 20,
    width: '75%',
    backgroundColor: "#4CAF50",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    zIndex: 10,
  },
  exportButtonText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    textAlign: "center",
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
    borderRadius: SIZES.borderRadius,
  },
  loadingText: {
    color: "#fff",
    marginTop: 10,
    fontSize: 16,
    textAlign: "center"
  },
});

export default RouteImage;
