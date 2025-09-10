import { AnnotationsData } from "@/types/annotationTypes";

export const loadAnnotations = async (annotationsUri: string): Promise<AnnotationsData> => {
  console.log("Loading existing annotations...");

  try {
    const response = await fetch(annotationsUri);
    if (!response.ok) {
      throw new Error(`Failed to fetch annotations: ${response.status}`);
    }
    let annotationsData = await response.json();

    return annotationsData;
  } catch (error: any) {
    console.error("Error loading annotations:", error)
    return {
      climbingHolds: [],
      drawingPaths: [],
      history: []
    };
  }
};