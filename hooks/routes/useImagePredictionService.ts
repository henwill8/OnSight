import { useCallback } from 'react';
import { Alert, Platform } from 'react-native';
import { getFileType } from '@/utils/FileUtils';
import { useApi } from '@/hooks/utils/useApi';
import { useRouteStore } from '@/storage/routeStore';
import { pollJobStatus } from '@/utils/apiServices';
import { API_PATHS } from "@/constants/paths";
import { HOLD_SELECTION, ClimbingHold, AnnotationsData } from '@/types/annotationTypes';
import { calculatePolygonArea } from '@/utils/geometricUtils';

interface ImagePredictionServiceProps {
  setDataReceived: (data: boolean) => void;
  setImageDimensions: (dimensions: { width: number; height: number; } | null) => void;
}

export const useImagePredictionService = ({ setDataReceived, setImageDimensions }: ImagePredictionServiceProps) => {
  const { callApi } = useApi();
  const { updateData } = useRouteStore();

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

    const annotations: AnnotationsData = {
      climbingHolds: predictedClimbingHolds,
      drawingPaths: [],
      history: []
    }

    setDataReceived(true);
    setImageDimensions(results.imageSize);
    updateData({ annotations });
  }, [setDataReceived, setImageDimensions, updateData]);

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
      const data = await callApi<{ jobId: string }>(API_PATHS.PREDICT, {
        method: "POST",
        body: formData,
        timeout: 10000,
      });

      if (!data.jobId) {
        handleError("Unexpected response format: No jobId received");
        return;
      }

      // Start polling for job status
      pollJobStatus(data.jobId, 2000, handleJobDone, handleJobError, 10000);

    } catch (error: any) {
      handleError(`Error uploading image: ${error.message}`);
    }
  }, [callApi, handleError, handleJobDone, handleJobError]);

  return {
    sendImageToServer,
    handleError,
    handleJobDone,
    handleJobError,
  };
};
