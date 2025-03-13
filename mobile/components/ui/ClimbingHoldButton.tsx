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
    "rgba(0, 68, 255, 1)",    // Red with 50% transparency
    "rgba(0, 255, 0, 1)",    // Green with 50% transparency
    "rgba(216, 0, 0, 1)", // Gray with 50% transparency
  ];;

  // Function to handle color change on button click
  const handleColorChange = () => {
    setButtonColorIndex((prevIndex) => (prevIndex + 1) % colors.length);
  };

  return (
    <TouchableOpacity
      style={[defaultStyles.button, { borderColor: colors[buttonColorIndex] }, style]} // Apply the custom style
      onPress={handleColorChange}
    />
  );
};

// Default styles for the button if no style is provided
const defaultStyles = StyleSheet.create({
  button: {
    position: "absolute",
    borderWidth: 2,
    backgroundColor: "transparent"
  },
});

export default ClimbingHoldButton;
