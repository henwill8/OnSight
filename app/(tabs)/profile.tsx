import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SHADOWS, SIZES, globalStyles } from '@/constants/theme';

export default function ProfileScreen() {
  return (
    <View style={globalStyles.centerItemsContainer}>
      <Text style={{color: COLORS.textPrimary}}>Profile Screen</Text>
    </View>
  );
}
