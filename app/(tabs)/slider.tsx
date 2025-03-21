import React, { useState } from 'react';
import { View, Text, StyleSheet, Slider } from 'react-native'; // Built-in Slider

export default function SliderExample() {
  const [sliderValue, setSliderValue] = useState(0);

  const handleSliderChange = (value) => {
    setSliderValue(value);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Slider Value: {sliderValue.toFixed(2)}</Text>

      <Slider
        style={styles.slider}
        minimumValue={0}
        maximumValue={100}
        step={1}
        value={sliderValue}
        onValueChange={handleSliderChange}
        minimumTrackTintColor="#FF5733"
        maximumTrackTintColor="#ddd"
        thumbTintColor="#FF5733"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  label: {
    fontSize: 18,
    marginBottom: 20,
  },
  slider: {
    width: 300,
    height: 40,
  },
});
