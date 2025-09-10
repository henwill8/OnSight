import { Link, Stack } from 'expo-router';
import { Text, View, StyleSheet } from 'react-native';
import { useTheme } from '@/constants/theme';

export default function NotFoundScreen() {
  const { colors, font, global } = useTheme();
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View>
        <Text style={{ fontSize: font.h3, color: colors.textPrimary }}>
          This page does not exist!
        </Text>
        <Link href="/auth/login" style={styles.link}>
          <Text style={{ fontSize: font.body, color: colors.primary }}>Go to login!</Text>
        </Link>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
