import { useState, useEffect, useCallback, Dispatch, SetStateAction } from "react";
import { useImagePicker } from '@/hooks/utils/useImagePicker';
import { getSecureItem, setSecureItem } from '@/utils/secureStorageUtils';

interface RouteSecureStoreData {
  imageUri: string | null;
  annotations: string | null;
}

interface UseImageSelectionReturn {
  imageUri: string | null;
  setImageUri: Dispatch<SetStateAction<string | null>>;
  annotationsData: string | null;
  setAnnotationsData: Dispatch<SetStateAction<string | null>>;
  exportedUri: string | null;
  annotationsJSON: string | null;
  handleImagePick: (useCamera: boolean, navigateToCreator: () => void) => Promise<void>;
  setRouteData: (imageUri: string | null, annotations: string | null) => Promise<void>;
}

export const useImageSelection = (): UseImageSelectionReturn => {
  const { pickImage } = useImagePicker();

  const [imageUri, setImageUri] = useState<string | null>(null);
  const [annotationsData, setAnnotationsData] = useState<string | null>(null);
  const [exportedUri, setExportedUri] = useState<string | null>(null);
  const [annotationsJSON, setAnnotationsJSON] = useState<string | null>(null);

  useEffect(() => {
    const loadRouteData = async () => {
      const storedRouteData = await getSecureItem('routeData');
      if (storedRouteData) {
        const parsedData: RouteSecureStoreData = JSON.parse(storedRouteData);
        setExportedUri(parsedData.imageUri);
        setAnnotationsJSON(parsedData.annotations);
      }
    };
    loadRouteData();
  }, []);

  const setRouteData = useCallback(async (imageUri: string | null, annotations: string | null) => {
    const newRouteData: RouteSecureStoreData = { imageUri, annotations };
    await setSecureItem('routeData', JSON.stringify(newRouteData));
    setExportedUri(imageUri);
    setAnnotationsJSON(annotations);
  }, []);

  const handleImagePick = useCallback(async (useCamera: boolean, navigateToCreator: () => void) => {
    const result = await pickImage(useCamera);

    if (result.success && result.uri) {
      await setRouteData(result.uri, null);
      navigateToCreator();
    } else if (result.error) {
      // Alert.alert("Error", result.error); // Error handled within useImagePicker
    }
  }, [pickImage, setRouteData]);

  return {
    imageUri,
    setImageUri,
    annotationsData,
    setAnnotationsData,
    exportedUri,
    annotationsJSON,
    handleImagePick,
    setRouteData,
  };
};
