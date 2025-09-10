import React from 'react';
import { View, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { Link, Tabs } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useTheme } from '@/constants/theme';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
  style?: object;
}) {
  return <FontAwesome size={24} style={{ marginBottom: -3 }} {...props} />;
}

const getStyles = (colors: any, spacing: any, font: any) => {
  return StyleSheet.create({
    keyboardAvoidingView: {
      flex: 1,
    },
    tabBarIcon: {
      marginBottom: -spacing.xxs, // Assuming a very small spacing for -3
    },
    tabBarLabel: {
      fontSize: font.caption,
    },
    headerTitle: {
      fontSize: font.h4,
      fontWeight: 'bold',
    },
  });
};

export default function TabLayout() {
  const { colors, spacing, global, font } = useTheme();
  const styles = getStyles(colors, spacing, font);

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
          headerTitleStyle: styles.headerTitle,
          tabBarLabelStyle: styles.tabBarLabel,
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
          name="profile/profile"
          options={{ 
            title: 'Profile', 
            tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} style={styles.tabBarIcon} />
          }}
        />

        // Should not be navigable from tab bar
        <Tabs.Screen
          name="profile/edit-profile"
          options={{
            href: null,
          }}
        />
      </Tabs>
    </KeyboardAvoidingView>
  );
}