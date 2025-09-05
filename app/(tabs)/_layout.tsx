import React from 'react';
import { View, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { Link, Tabs } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTheme } from '@/constants/theme';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={24} style={{ marginBottom: -3 }} {...props} />;
}

const getStyles = (colors: any, spacing: any) => {
  return StyleSheet.create({
    keyboardAvoidingView: {
      flex: 1,
    },
    tabBarIcon: {
      marginBottom: -spacing.xxs, // Assuming a very small spacing for -3
    },
  });
};

export default function TabLayout() {
  const { colors, spacing, global } = useTheme();
  const styles = getStyles(colors, spacing);

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Tabs 
        screenOptions={{
          tabBarActiveTintColor: colors.textPrimary,
          tabBarStyle: {
            backgroundColor: colors.backgroundSecondary
          },
          headerStyle: {
            backgroundColor: colors.backgroundSecondary
          },
          headerTintColor: colors.textPrimary,
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} style={styles.tabBarIcon} />
          }}
        />
        <Tabs.Screen
          name="chooseGym"
          options={{ 
            title: 'Choose Gym', 
            tabBarIcon: ({ color }) => <TabBarIcon name="search" color={color} style={styles.tabBarIcon} />
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{ 
            title: 'Profile', 
            tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} style={styles.tabBarIcon} />,
            href: null
          }}
        />
      </Tabs>
    </KeyboardAvoidingView>
  );
}