import React, { useState, useEffect } from "react";
import { TouchableOpacity, ViewStyle, StyleSheet } from "react-native";
import { COLORS, SHADOWS, SIZES, HOLD_SELECTION_COLORS, globalStyles } from '@/constants/theme';

interface ClimbingHoldButtonProps {
  style?: ViewStyle[]; // Accept style as a prop for customization
  showUnselectedHolds?: boolean;
}

const ClimbingHoldButton: React.FC<ClimbingHoldButtonProps> = ({ style, showUnselectedHolds = false }) => {
  const [buttonColorIndex, setButtonColorIndex] = useState(0);

  // Array of colors to cycle through
  const colors = [
    "rgba(0, 0, 0, 0)",  // Transparent
    HOLD_SELECTION_COLORS.intermediate,
    HOLD_SELECTION_COLORS.start,
    HOLD_SELECTION_COLORS.end
  ];

  // Function to handle color change on button click
  const handleColorChange = () => {
    setButtonColorIndex((prevIndex) => (prevIndex + 1) % colors.length);
  };

  // If showUnselectedHolds is true and color is transparent, change it to gray
  const currentColor = showUnselectedHolds && buttonColorIndex === 0 
    ? "rgb(0, 0, 0)" // Black for unselected holds
    : colors[buttonColorIndex];

  return (
    <TouchableOpacity
      style={[defaultStyles.button, { borderColor: currentColor }, style]}
      onPress={handleColorChange}
    />
  );
};

// Default styles for the button if no style is provided
const defaultStyles = StyleSheet.create({
  button: {
    position: "absolute",
    borderWidth: 2,
    backgroundColor: "transparent",
  },
});

export default ClimbingHoldButton;
