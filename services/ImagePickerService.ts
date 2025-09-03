import * as ImagePicker from "expo-image-picker";
import { Alert } from "react-native";
import { resizeImageToMaxDimension } from "@/utils/imageUtils";

export interface ImagePickerResult {
  success: boolean;
  uri?: string;
  error?: string;
}

export class ImagePickerService {
  /**
   * Requests camera permissions
   */
  static async requestCameraPermission(): Promise<boolean> {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    return permission.status === "granted";
  }

  /**
   * Requests media library permissions
   */
  static async requestMediaLibraryPermission(): Promise<boolean> {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    return permission.status === "granted";
  }

  /**
   * Launches camera to take a photo
   */
  static async launchCamera(): Promise<ImagePickerResult> {
    try {
      const hasPermission = await this.requestCameraPermission();
      
      if (!hasPermission) {
        Alert.alert("Permission Required", "You need to allow camera access to use this feature.");
        return { success: false, error: "Camera permission denied" };
      }

      const result = await ImagePicker.launchCameraAsync({ quality: 1 });
      
      if (result.canceled || !result.assets || result.assets.length === 0) {
        return { success: false, error: "Image capture cancelled" };
      }

      const uri = result.assets[0].uri;
      const resizedImage = await resizeImageToMaxDimension(uri);
      
      return { success: true, uri: resizedImage.uri };
    } catch (error) {
      console.error("Error launching camera:", error);
      return { success: false, error: "Failed to capture image" };
    }
  }

  /**
   * Launches image picker to select from gallery
   */
  static async launchImageLibrary(): Promise<ImagePickerResult> {
    try {
      const hasPermission = await this.requestMediaLibraryPermission();
      
      if (!hasPermission) {
        Alert.alert("Permission Required", "You need to allow photo library access to use this feature.");
        return { success: false, error: "Media library permission denied" };
      }

      const result = await ImagePicker.launchImageLibraryAsync({ quality: 1 });
      
      if (result.canceled || !result.assets || result.assets.length === 0) {
        return { success: false, error: "Image selection cancelled" };
      }

      const uri = result.assets[0].uri;
      const resizedImage = await resizeImageToMaxDimension(uri);
      
      return { success: true, uri: resizedImage.uri };
    } catch (error) {
      console.error("Error launching image library:", error);
      return { success: false, error: "Failed to select image" };
    }
  }
}