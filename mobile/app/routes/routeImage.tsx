import React, { useRef, useState, useCallback, useEffect, useLayoutEffect } from 'react';
import { Alert, Text, ActivityIndicator, Modal, View, Image, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter, useNavigation } from "expo-router";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ReactNativeZoomableView } from 'react-native-zoomable-view';
import RouteAnnotations, { RouteAnnotationsRef, ClimbingHold } from "@/components/RouteAnnotations/RouteAnnotations";
import { COLORS, SHADOWS, SIZES, globalStyles } from '@/constants/theme';
import { HOLD_SELECTION, HOLD_SELECTION_COLORS } from '@/constants/holdSelection';
import config from '@/config';
import { getFileType } from '@/utils/FileUtils';
import ViewShot from 'react-native-view-shot';
import LoadingModal from '@/components/ui/LoadingModal';
import { fetchWithTimeout, pollJobStatus } from '@/utils/api';

type ImageSize = { width: number; height: number };

const RouteImage: React.FC = () => {
  const router = useRouter();
  const navigation = useNavigation();

  const { imageUri } = useLocalSearchParams();
  const imageUriString = Array.isArray(imageUri) ? imageUri[0] : imageUri;

  const [imageDimensions, setImageDimensions] = useState<ImageSize | null>(null); // Image size
  const [scaleX, setScaleX] = useState<number>(1); // Values used to scale the image to the screen size
  const [scaleY, setScaleY] = useState<number>(1);

  const [dataReceived, setDataReceived] = useState(false); // Whether data has been received
  const [showUnselectedHolds, setShowUnselectedHolds] = useState<boolean>(false); // Show bounding boxes state
  const [selectedColor, setSelectedColor] = useState<string | null>(null); // Color selection state

  const routeAnnotationRef = useRef<RouteAnnotationsRef>(null);
  
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
    setShowUnselectedHolds(prev => !prev);
  };

  const handleColorSelect = (color: string) => {
    setSelectedColor(prevColor => {
      const newColor = prevColor === color ? null : color; // Toggle selection
      console.log(`Selected color changed to: ${newColor ?? "None"}`); // Log when color changes
      return newColor;
    });
  };

  const handleExport = async () => {
    setShowUnselectedHolds(false);

    try {  
      router.back(); // Go back to previous screen
      router.setParams({
        exportedUri: encodeURIComponent(imageUriString || ""),
        annotationsJSON: routeAnnotationRef.current?.exportAnnotationJSON()
      });
    } catch (error) {
      console.error("Error exporting image: ", error);
      Alert.alert("Export Failed", "There was an error exporting the image.");
    }
  };

  const handleUndo = () => {
    if(routeAnnotationRef.current) {
      routeAnnotationRef.current.undo();
    }
  };

  // Function to calculate the area of a polygon using the shoelace theorem
  const calculatePolygonArea = (coordinates: number[]) => {
    let area = 0;
    const n = coordinates.length / 2; // Number of points in the polygon

    for (let i = 0; i < n; i++) {
      const x1 = coordinates[2 * i];
      const y1 = coordinates[2 * i + 1];
      const x2 = coordinates[2 * ((i + 1) % n)];
      const y2 = coordinates[2 * ((i + 1) % n) + 1];

      area += x1 * y2 - x2 * y1;
    }

    return Math.abs(area) / 2;
  };

  const handleJobDone = (statusData: any) => {
    const results = statusData.result;
    const predictions = results.predictions;
  
    console.log(`Received ${predictions.length} predictions`);
  
    // Map the received climbingHolds to a ClimbingHold list with a default value for hold selection state
    const predictedClimbingHolds: ClimbingHold[] = predictions
      .map((coordinates: any) => ({
        coordinates: coordinates,
        holdSelectionState: HOLD_SELECTION.UNSELECTED,
      }))
      .sort((a: ClimbingHold, b: ClimbingHold) => calculatePolygonArea(b.coordinates) - calculatePolygonArea(a.coordinates));
    
    setDataReceived(true);
    setImageDimensions(results.imageSize);
    routeAnnotationRef.current?.loadPredictedClimbingHolds(predictedClimbingHolds);
  };

  const handleJobError = (statusData: any) => {
    handleError(`Job failed: ${statusData.error}`);
  };

  // Main function to send image to the server
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
      // Predictions can take a long variable amount of time so a job is created that the client pings
      const response = await fetchWithTimeout(config.API_URL + '/api/predict', {
        method: "POST",
        body: formData,
      }, 10000);

      const data = await response.json();

      if (!response.ok) {
        handleError(`Server error: ${response.status}, ${data.message}`);
        return;
      }
  
      if (!data.jobId) {
        handleError("Unexpected response format: No jobId received");
        return;
      }
  
      pollJobStatus(data.jobId, 2000, handleJobDone, handleJobError, 10000);
      
    } catch (error: any) {
      handleError(`Error uploading image: ${error.message}`);
    }
  }, []);

  const handleError = (message: string) => {
    console.error(message);
    setDataReceived(true);
    Alert.alert("Predictions Failed!", "Hold predictions failed, but you can still draw.");
  };

  const screenWidth = Dimensions.get("window").width;
  const screenHeight = Dimensions.get("window").height;

  const insets = useSafeAreaInsets();

  // Calculate available screen space
  const calculateOptimalImageDimensions = useCallback(() => {
    if (!imageDimensions) return null;
    
    const aspectRatio = imageDimensions.width / imageDimensions.height;
    
    // Account for UI elements and safe areas
    const availableHeight = screenHeight - insets.top - insets.bottom - 160; // Subtract space for buttons
    const availableWidth = screenWidth - insets.left - insets.right;
    
    // Try fitting by width first
    let width = availableWidth;
    let height = width / aspectRatio;
    
    // If height exceeds available space, fit by height instead
    if (height > availableHeight) {
      height = availableHeight;
      width = height * aspectRatio;
    }
    
    return { newScaleX: width / imageDimensions.width, newScaleY: height / imageDimensions.height };
  }, [imageDimensions, screenWidth, screenHeight, insets]);
  
  useEffect(() => {
    if (!imageDimensions) return;

    const scaled = calculateOptimalImageDimensions();

    setScaleX(scaled?.newScaleX || 1);
    setScaleY(scaled?.newScaleY || 1);
  }, [imageDimensions]);

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

      {imageDimensions && (
        <ReactNativeZoomableView
          maxZoom={10.0}
          minZoom={0.5}
          zoomStep={0.5}
          initialZoom={1.0}
          bindToBorders={true}
          style={{ width: imageDimensions.width * scaleX, height: imageDimensions.height * scaleY, borderRadius: SIZES.borderRadius }}
          panEnabled={selectedColor == null}
          disableMomentum={selectedColor != null}
          onStartShouldSetPanResponder={(evt, gestureState) => {
            // dont let zoomable view become pan responder if the player is drawing
            return selectedColor == null || gestureState.numberActiveTouches > 1
          }}
          onMoveShouldSetPanResponderCapture={(evt, gestureState) => {
            // If gesture starts as single touch, but becomes multi-touch, take control
            return gestureState.numberActiveTouches > 1;
          }}
        >
          <RouteAnnotations
            ref={routeAnnotationRef}
            style={{
              borderRadius: SIZES.borderRadius,
              width: imageDimensions.width * scaleX,
              height: imageDimensions.height * scaleY,
            }}
            imageURI={imageUriString}
            interactable={true}
            climbingHoldOverlayProps={{
              showUnselectedHolds: showUnselectedHolds,
            }}
            drawingCanvasProps={{
              canDraw: selectedColor != null,
              color: selectedColor || "black"
            }}
          />
        </ReactNativeZoomableView>
      )}

      <TouchableOpacity style={styles.toggleButton} onPress={handleToggleBoundingBoxes}>
        <Text style={styles.toggleButtonText}>{showUnselectedHolds ? "Hide" : "Show"} Unselected Holds</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.exportButton} onPress={handleExport}>
        <Text style={styles.exportButtonText}>Save</Text>
      </TouchableOpacity>

      <LoadingModal visible={!dataReceived} message={"Detecting Climbing Holds...\n(may take up to 10 seconds)"}/>
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
