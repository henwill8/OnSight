import { useCallback } from 'react';
import { Alert } from 'react-native';
import * as ImagePicker from "expo-image-picker";
import { resizeImageToMaxDimension } from "@/utils/imageUtils";

export interface ImagePickerResult {
  success: boolean;
  uri?: string;
  error?: string;
}

export const useImagePicker = () => {
  const requestCameraPermission = useCallback(async (): Promise<boolean> => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    return permission.status === "granted";
  }, []);

  const requestMediaLibraryPermission = useCallback(async (): Promise<boolean> => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return permission.status === "granted";
  }, []);

  const pickImage = useCallback(async (useCamera: boolean): Promise<ImagePickerResult> => {
    try {
      let hasPermission = false;
      if (useCamera) {
        hasPermission = await requestCameraPermission();
        if (!hasPermission) {
          Alert.alert("Permission Required", "You need to allow camera access to use this feature.");
          return { success: false, error: "Camera permission denied" };
        }
      } else {
        hasPermission = await requestMediaLibraryPermission();
        if (!hasPermission) {
          Alert.alert("Permission Required", "You need to allow photo library access to use this feature.");
          return { success: false, error: "Media library permission denied" };
        }
      }

      const result = useCamera
        ? await ImagePicker.launchCameraAsync({ quality: 1 })
        : await ImagePicker.launchImageLibraryAsync({ quality: 1 });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        return { success: false, error: "Image selection cancelled" };
      }

      const uri = result.assets[0].uri;
      const resizedImage = await resizeImageToMaxDimension(uri);
      
      return { success: true, uri: resizedImage.uri };
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Error", "Failed to pick image");
      return { success: false, error: "Failed to pick image" };
    }
  }, [requestCameraPermission, requestMediaLibraryPermission]);

  return {
    pickImage,
  };
};
