import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/constants/theme';

export default function ProfileScreen() {
  const { colors, global, font } = useTheme();
  return (
    <View style={global.centerItemsContainer}>
      <Text style={{color: colors.textPrimary, fontSize: font.h3}}>Profile Screen</Text>
    </View>
  );
}
