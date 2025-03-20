import React from 'react';
import { View, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { Tabs } from 'expo-router';
import { globalStyles } from './_styles';

export default function TabLayout() {
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Tabs 
        screenOptions={{
          tabBarStyle: {
            backgroundColor: "#333333"
          }
        }}
      >
        <Tabs.Screen
          name="home"
          options={{ title: 'Home' }}
        />
        <Tabs.Screen
          name="routeList"
          options={{ title: 'Route List' }}
        />
        <Tabs.Screen
          name="routeCreation"
          options={{ title: 'Route Creation' }}
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
