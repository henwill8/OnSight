import { useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import config from '@/config';
import { getFileType } from '@/utils/fileUtils';
import { fetchWithTimeout, pollJobStatus } from '@/utils/apiServices';
import { API_PATHS } from "@/constants/paths";
import { HOLD_SELECTION } from '@/constants/holdSelection';
import { calculatePolygonArea } from '@/utils/geometricUtils';
import { ClimbingHold } from '@/components/RouteImage/RouteImage';

interface ImagePredictionServiceProps {
  setDataReceived: (data: boolean) => void;
  setImageDimensions: (dimensions: { width: number; height: number; } | null) => void;
  routeAnnotationRef: React.MutableRefObject<any>;
}

export const useImagePredictionService = ({ setDataReceived, setImageDimensions, routeAnnotationRef }: ImagePredictionServiceProps) => {

  const handleError = useCallback((message: string) => {
    console.error(message);
    setDataReceived(true);
    Alert.alert("Predictions Failed!", "Hold predictions failed, but you can still draw.");
  }, [setDataReceived]);

  const handleJobDone = useCallback((statusData: any) => {
    const results = statusData.result;
    const predictions = results.predictions;

    console.log(`Received ${predictions.length} predictions`);

    const predictedClimbingHolds: ClimbingHold[] = predictions
      .map((coordinates: any) => ({
        coordinates: coordinates,
        holdSelectionState: HOLD_SELECTION.UNSELECTED,
      }))
      .sort((a: ClimbingHold, b: ClimbingHold) => calculatePolygonArea(b.coordinates) - calculatePolygonArea(a.coordinates));

    setDataReceived(true);
    setImageDimensions(results.imageSize);
    routeAnnotationRef.current?.loadPredictedClimbingHolds(predictedClimbingHolds);
  }, [setDataReceived, setImageDimensions, routeAnnotationRef]);

  const handleJobError = useCallback((statusData: any) => {
    handleError(`Job failed: ${statusData.error}`);
  }, [handleError]);

  const sendImageToServer = useCallback(async (uri: string) => {
    console.log("Sending to server...");

    const { extension, mimeType } = getFileType(uri);
    const formData = new FormData();

    if (Platform.OS === "web") {
      const response = await fetch(uri);
      const blob = await response.blob();
      const file = new File([blob], `photo.${extension}`, { type: mimeType });
      formData.append("image", file);
    } else {
      formData.append("image", {
        uri,
        name: `photo.${extension}`,
        type: mimeType,
      } as any);
    }

    try {
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
  }, [handleError, handleJobDone, handleJobError, fetchWithTimeout, pollJobStatus]);

  return {
    sendImageToServer,
    handleError,
    handleJobDone,
    handleJobError,
  };
};
