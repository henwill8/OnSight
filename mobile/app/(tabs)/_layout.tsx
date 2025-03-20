import React from 'react';
import { View, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import '@/constants/theme';
import { COLORS } from '@/constants/theme';

export default function TabLayout() {
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Tabs 
        screenOptions={{
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
          options={{ title: 'Home' }}
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
