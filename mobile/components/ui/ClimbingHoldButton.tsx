import React, { useState } from "react";
import { TouchableOpacity, ViewStyle, StyleSheet } from "react-native";

interface ClimbingHoldButtonProps {
  style?: ViewStyle[]; // Accept style as a prop for customization
}

const ClimbingHoldButton: React.FC<ClimbingHoldButtonProps> = ({ style }) => {
  const [buttonColorIndex, setButtonColorIndex] = useState(0);

  // Array of colors to cycle through
  const colors = [
    "rgba(0, 0, 0, 0)",       // Transparent
    "rgba(0, 68, 255, 0.5)",    // Red with 50% transparency
    "rgba(0, 255, 0, 0.5)",    // Green with 50% transparency
    "rgba(216, 0, 0, 0.5)", // Gray with 50% transparency
  ];;

  // Function to handle color change on button click
  const handleColorChange = () => {
    setButtonColorIndex((prevIndex) => (prevIndex + 1) % colors.length);
  };

  return (
    <TouchableOpacity
      style={[defaultStyles.button, { backgroundColor: colors[buttonColorIndex] }, style]} // Apply the custom style
      onPress={handleColorChange}
    />
  );
};

// Default styles for the button if no style is provided
const defaultStyles = StyleSheet.create({
  button: {
    position: "absolute",
  },
});

export default ClimbingHoldButton;
