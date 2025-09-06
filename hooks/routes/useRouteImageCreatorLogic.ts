import { useRef, useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import { useNavigation } from "expo-router";
import { getSecureItem, setSecureItem } from '@/utils/secureStorageUtils';
import { useImageDimensions } from '../utils/useImageDimensions';
import { useImagePredictionService } from './useImagePredictionService';

interface RouteSecureStoreData {
  imageUri: string | null;
  annotations: string | null;
}

export const useRouteImageCreatorLogic = () => {
  const navigation = useNavigation();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [annotations, setAnnotations] = useState<string | null>(null);
  const [dataReceived, setDataReceived] = useState(false); // Whether data has been received
  const [showUnselectedHolds, setShowUnselectedHolds] = useState<boolean>(false); // Show bounding boxes state
  const [selectedColor, setSelectedColor] = useState<string | null>(null); // Color selection state

  const routeAnnotationRef = useRef<any>(null);
  const { imageDimensions, scaleX, scaleY } = useImageDimensions(imageUri, 220);
  const { sendImageToServer, handleError, handleJobDone, handleJobError } = useImagePredictionService({
    setDataReceived,
    setImageDimensions: (dimensions: { width: number; height: number; } | null) => { /* useImageDimensions handles this */ },
    routeAnnotationRef,
  });

  useEffect(() => {
    const loadRouteData = async () => {
      const storedRouteData = await getSecureItem('routeData');
      if (storedRouteData) {
        const parsedData: RouteSecureStoreData = JSON.parse(storedRouteData);
        setImageUri(parsedData.imageUri);
        setAnnotations(parsedData.annotations);
      }
    };
    loadRouteData();
  }, []);

  const setRouteData = useCallback(async (newImageUri: string | null, newAnnotations: string | null) => {
    const newRouteData: RouteSecureStoreData = { imageUri: newImageUri, annotations: newAnnotations };
    await setSecureItem('routeData', JSON.stringify(newRouteData));
    setImageUri(newImageUri);
    setAnnotations(newAnnotations);
  }, []);

  useEffect(() => {
    if (imageUri) {
      if (annotations) {
        loadAnnotations(annotations);
      } else if (imageUri && imageDimensions) {
        sendImageToServer(imageUri);
      }
    } else {
      console.error("No imageUri provided");
    }
  }, [imageUri, annotations, imageDimensions, sendImageToServer]);

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
  }, [imageUri, sendImageToServer]);

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
      await setRouteData(imageUri, routeAnnotationRef.current?.exportAnnotationJSON());

      navigation.goBack(); // Go back to previous screen
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
