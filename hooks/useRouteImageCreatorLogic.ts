import { useRef, useState, useCallback, useEffect } from 'react';
import { Alert, Image, Dimensions, Platform } from 'react-native';
import { useLocalSearchParams, useRouter, useNavigation } from "expo-router";
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { calculateOptimalImageDimensions } from '@/utils/imageUtils';
import { calculatePolygonArea } from '@/utils/geometricUtils';
import { HOLD_SELECTION, HOLD_SELECTION_COLORS } from '@/constants/holdSelection';
import config from '@/config';
import { getFileType } from '@/utils/fileUtils';
import { fetchWithTimeout, pollJobStatus } from '@/utils/api';
import { API_PATHS } from "@/constants/paths";
import { useRouteStore } from '@/store/routeStore';
import { ClimbingHold } from '@/components/RouteImage/RouteImage';

type ImageSize = { width: number; height: number };

export const useRouteImageCreatorLogic = () => {
  const router = useRouter();
  const navigation = useNavigation();

  const { imageUri, annotations } = useRouteStore();

  const [imageDimensions, setImageDimensions] = useState<ImageSize | null>(null); // Image size
  const [scaleX, setScaleX] = useState<number>(1); // Values used to scale the image to the screen size
  const [scaleY, setScaleY] = useState<number>(1);

  const [dataReceived, setDataReceived] = useState(false); // Whether data has been received
  const [showUnselectedHolds, setShowUnselectedHolds] = useState<boolean>(false); // Show bounding boxes state
  const [selectedColor, setSelectedColor] = useState<string | null>(null); // Color selection state

  const routeAnnotationRef = useRef<any>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (imageUri) {
      Image.getSize(imageUri, (width, height) => {
        setImageDimensions({ width, height });
      });

      // Check if we have existing annotations
      if (annotations) {
        loadAnnotations(annotations);
      } else {
        sendImageToServer(imageUri);
      }
    } else {
      console.error("No imageUri provided");
    }
  }, [imageUri, annotations]);

  const loadAnnotations = useCallback(async (annotationsUri: string) => {
    console.log("Loading existing annotations...");

    try {
      const response = await fetch(annotationsUri);
      if (!response.ok) {
        throw new Error(`Failed to fetch annotations: ${response.status}`);
      }
      let annotationsData = await response.text();

      routeAnnotationRef.current?.loadAnnotationJSON(annotationsData);
      setDataReceived(true);

    } catch (error: any) {
      sendImageToServer(imageUri || "")
    }
  }, [imageUri]);

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
      useRouteStore.getState().setRouteData(imageUri, routeAnnotationRef.current?.exportAnnotationJSON)

      router.back(); // Go back to previous screen
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

    const { extension, mimeType } = getFileType(uri);
    const formData = new FormData();

    if (Platform.OS === "web") {
      // For web, fetch the file as a blob
      const response = await fetch(uri);
      const blob = await response.blob();
      const file = new File([blob], `photo.${extension}`, { type: mimeType });
      formData.append("image", file);
    } else {
      // For React Native
      formData.append("image", {
        uri,
        name: `photo.${extension}`,
        type: mimeType,
      } as any);
    }

    try {
      // Predictions can take a long variable amount of time so a job is created that the client pings
      const response = await fetchWithTimeout(config.API_URL + API_PATHS.PREDICT, {
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

  useEffect(() => {
    if (!imageDimensions) return;
    const scaled = calculateOptimalImageDimensions({
      imageWidth: imageDimensions.width,
      imageHeight: imageDimensions.height,
      insets,
      extraHeight: 220,
    });
    setScaleX(scaled?.scaleX || 1);
    setScaleY(scaled?.scaleY || 1);
  }, [imageDimensions, insets]);

  return {
    imageUri,
    annotations,
    imageDimensions,
    scaleX,
    scaleY,
    dataReceived,
    showUnselectedHolds,
    selectedColor,
    routeAnnotationRef,
    handleToggleBoundingBoxes,
    handleColorSelect,
    handleExport,
    handleUndo,
    handleError,
    navigation,
  };
};
