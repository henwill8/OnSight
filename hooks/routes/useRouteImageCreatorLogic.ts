import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from "expo-router";
import { useImageDimensions } from '../utils/useImageDimensions';
import { useImagePredictionService } from './useImagePredictionService';
import { useRouteStore } from '@/storage/routeStore';

export const useRouteImageCreatorLogic = () => {
  const navigation = useNavigation();
  const { data: routeData, updateData: updateRouteData } = useRouteStore();

  const [dataReceived, setDataReceived] = useState(false); // Whether data has been received
  const [showUnselectedHolds, setShowUnselectedHolds] = useState<boolean>(false); // Show bounding boxes state
  const [selectedColor, setSelectedColor] = useState<string | null>(null); // Color selection state

  const { imageDimensions, scaleX, scaleY } = useImageDimensions(routeData.imageUri, 220);
  const { sendImageToServer, handleError, handleJobDone, handleJobError } = useImagePredictionService({
    setDataReceived,
    setImageDimensions: (dimensions: { width: number; height: number; } | null) => { /* useImageDimensions handles this */ },
  });

  useEffect(() => {
    if (routeData.imageUri) {
      if (routeData.annotations) {
        loadAnnotations(routeData.annotations);
      } else if (routeData.imageUri && imageDimensions) {
        sendImageToServer(routeData.imageUri);
      }
    } else {
      console.error("No imageUri provided");
    }
  }, [routeData.imageUri, routeData.annotations, imageDimensions, sendImageToServer]);

  const loadAnnotations = useCallback(async (annotationsUri: string) => {
    console.log("Loading existing annotations...");

    try {
      const response = await fetch(annotationsUri);
      if (!response.ok) {
        throw new Error(`Failed to fetch annotations: ${response.status}`);
      }
      let annotationsData = await response.json();

      updateRouteData({ annotations: annotationsData });
      setDataReceived(true);

    } catch (error: any) {
      sendImageToServer(routeData.imageUri || "")
    }
  }, [routeData.imageUri, sendImageToServer, updateRouteData]);


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
      // The annotations are already stored in the route store
      // No need to export from a ref since we're using the store
      navigation.goBack(); // Go back to previous screen
    } catch (error) {
      console.error("Error exporting image: ", error);
      Alert.alert("Export Failed", "There was an error exporting the image.");
    }
  };

  const handleUndo = useCallback(() => {
    
  }, [updateRouteData]);

  return {
    imageUri: routeData.imageUri,
    annotations: routeData.annotations,
    imageDimensions,
    scaleX,
    scaleY,
    dataReceived,
    showUnselectedHolds,
    selectedColor,
    handleColorSelect,
    handleExport,
    handleUndo,
    handleError,
    navigation,
  };
};
