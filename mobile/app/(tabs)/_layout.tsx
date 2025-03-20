import React from 'react';
import { View, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { Link, Tabs } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import '@/constants/theme';
import { COLORS } from '@/constants/theme';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

export default function TabLayout() {
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Tabs 
        screenOptions={{
          tabBarActiveTintColor: COLORS.headerText,
          tabBarStyle: {
            backgroundColor: COLORS.backgroundSecondary
          },
          headerStyle: {
            backgroundColor: COLORS.backgroundSecondary
          },
          headerTintColor: COLORS.headerText,
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />
          }}
        />
        <Tabs.Screen
          name="chooseGym"
          options={{ title: 'Choose Gym' }}
        />
        <Tabs.Screen
          name="settings"
          options={{ title: 'Settings' }}
        />
      </Tabs>
    </KeyboardAvoidingView>
  );
}
