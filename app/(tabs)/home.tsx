import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function App() {
  const insets = useSafeAreaInsets();

  return (
    <View style={{ paddingTop: insets.top, paddingBottom: insets.bottom, flex: 1 }}>
      <Text>Top inset: {insets.top}</Text>
      <Text>Bottom inset: {insets.bottom}</Text>
    </View>
  );
}