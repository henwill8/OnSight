import { Platform } from "react-native";
import { useRef } from "react";
import { FittedImageRectOutput } from "@/utils/imageUtils";

/**
 * Provides cross-platform touch and mouse event handlers for drawing interactions.
 * This hook abstracts away the differences between web (mouse/touch events) and
 * React Native (responder system) to provide a unified drawing experience.
 *
 * @param interactable A boolean indicating if the drawing canvas is currently interactable.
 * @param fittedImageRect An object containing the dimensions and offsets of the fitted image.
 * @param onDrawStart Callback function triggered when a drawing gesture starts.
 * @param onDrawMove Callback function triggered when a drawing gesture moves.
 * @param onDrawEnd Callback function triggered when a drawing gesture ends.
 * @returns An object containing `eventHandlers` for the component and `pointerEvents` CSS style.
 */
export const useTouchHandler = (
  interactable: boolean,
  fittedImageRect: FittedImageRectOutput,
  onDrawStart: (point: { x: number; y: number }) => void,
  onDrawMove: (point: { x: number; y: number }) => void,
  onDrawEnd: (point: { x: number; y: number }) => void
) => {
  
  /**
   * Extracts the x and y coordinates from a given event, normalizing them
   * based on the platform (web or native) and the fitted image dimensions.
   * 
   * @param event The touch or mouse event object.
   * @returns An object with the extracted and normalized x and y coordinates.
   */
  const extractPoint = (event: any) => {
    if (Platform.OS === 'web') {
      // Web mouse/touch events
      const clientX = event.clientX ?? event.touches?.[0]?.clientX ?? event.changedTouches?.[0]?.clientX;
      const clientY = event.clientY ?? event.touches?.[0]?.clientY ?? event.changedTouches?.[0]?.clientY;
      
      if (clientX !== undefined && clientY !== undefined) {
        const rect = event.currentTarget.getBoundingClientRect();
        return {
          x: (clientX - rect.left) / (rect.width / fittedImageRect.width),
          y: (clientY - rect.top) / (rect.height / fittedImageRect.height),
        };
      }
    } else {
      // Mobile responder events
      const touch = event.nativeEvent.touches?.[0] || event.nativeEvent;
      return {
        x: touch.locationX || touch.pageX,
        y: touch.locationY || touch.pageY,
      };
    }
    return { x: 0, y: 0 };
  };

  const touchMoveOccurring = useRef(false);

  const handleTouchStart = (event: any) => {
    if (!interactable) return;
    
    touchMoveOccurring.current = false; // Reset move flag
  };

  const handleTouchMove = (event: any) => {
    if (!interactable) return;
    
    const point = extractPoint(event);

    // First move - trigger the start
    if (!touchMoveOccurring.current) {
      touchMoveOccurring.current = true;
      onDrawStart(point);
    }
    
    onDrawMove(point);
  };

  const handleTouchEnd = (event: any) => {
    if (!interactable) return;
    
    // Only call onDrawEnd if there was movement
    if (touchMoveOccurring.current) {
      const point = extractPoint(event);
      onDrawEnd(point);
    }
  };

  const handleMouseStart = (event: any) => {
    if (!interactable) return;
    
    const point = extractPoint(event);
    onDrawStart(point);
  };

  const handleMouseMove = (event: any) => {
    if (!interactable) return;
    
    const point = extractPoint(event);
    onDrawMove(point);
  };

  const handleMouseEnd = (event: any) => {
    if (!interactable) return;
    
    const point = extractPoint(event);
    onDrawEnd(point);
  };

  const getEventHandlers = () => {
    if (!interactable) return {};
    
    if (Platform.OS === 'web') {
      return {
        onMouseDown: handleMouseStart,
        onMouseMove: handleMouseMove,
        onMouseUp: handleMouseEnd,
        onMouseLeave: handleMouseEnd,
        onTouchStart: handleTouchStart,
        onTouchMove: handleTouchMove,
        onTouchEnd: handleTouchEnd,
        onTouchCancel: handleTouchEnd,
        // Prevent context menu on right click
        onContextMenu: (e: any) => e.preventDefault(),
        // Prevent text selection while drawing
        style: { 
          userSelect: 'none',
          WebkitUserSelect: 'none',
          touchAction: 'none', // Prevent default touch behaviors
        }
      };
    }
    
    return {
      onStartShouldSetResponder: () => true,
      onMoveShouldSetResponder: () => true,
      onResponderGrant: handleTouchStart,
      onResponderMove: handleTouchMove,
      onResponderRelease: handleTouchEnd,
    };
  };

  return {
    eventHandlers: getEventHandlers(),
    pointerEvents: (interactable ? "auto" : "none") as "auto" | "none",
  };
};