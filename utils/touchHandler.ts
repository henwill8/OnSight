import { Platform } from "react-native";

export const crossPlatformTouchHandler = (
  interactable: boolean,
  onDrawStart: (point: { x: number; y: number }) => void,
  onDrawMove: (point: { x: number; y: number }) => void,
  onDrawEnd: (point: { x: number; y: number }) => void
) => {
  let touchActive = false;
  let touchEndTimeout: number | null = null;
  
  const extractPoint = (event: any) => {
    if (Platform.OS === 'web') {
      // Web mouse/touch events
      const clientX = event.clientX ?? event.touches?.[0]?.clientX;
      const clientY = event.clientY ?? event.touches?.[0]?.clientY;
      
      if (clientX !== undefined && clientY !== undefined) {
        const rect = event.currentTarget.getBoundingClientRect();
        return {
          x: clientX - rect.left,
          y: clientY - rect.top,
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

  const handleTouchStart = (event: any) => {
    if (!interactable) return;
    
    // Set touch as active and clear any pending timeout
    touchActive = true;
    if (touchEndTimeout) {
      clearTimeout(touchEndTimeout);
      touchEndTimeout = null;
    }
    
    event.preventDefault();
    const point = extractPoint(event);
    onDrawStart(point);
  };

  const handleTouchMove = (event: any) => {
    if (!interactable) return;
    
    event.preventDefault();
    const point = extractPoint(event);
    onDrawMove(point);
  };

  const handleTouchEnd = (event: any) => {
    if (!interactable) return;
    
    event.preventDefault();
    const point = extractPoint(event);
    onDrawEnd(point);
    
    touchEndTimeout = setTimeout(() => {
      touchActive = false;
    }, 300); // 300ms delay to prevent mouse events after touch
  };

  const handleMouseStart = (event: any) => {
    if (!interactable || touchActive) return;
    
    const point = extractPoint(event);
    onDrawStart(point);
  };

  const handleMouseMove = (event: any) => {
    if (!interactable || touchActive) return;
    
    const point = extractPoint(event);
    onDrawMove(point);
  };

  const handleMouseEnd = (event: any) => {
    if (!interactable || touchActive) return;
    
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