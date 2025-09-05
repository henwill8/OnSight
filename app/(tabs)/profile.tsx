import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '@/constants/theme';

export default function ProfileScreen() {
  const { colors, global } = useTheme();
  return (
    <View style={global.centerItemsContainer}>
      <Text style={{color: colors.textPrimary}}>Profile Screen</Text>
    </View>
  );
}
