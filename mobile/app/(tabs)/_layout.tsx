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
          tabBarActiveTintColor: COLORS.textPrimary,
          tabBarStyle: {
            backgroundColor: COLORS.backgroundSecondary
          },
          headerStyle: {
            backgroundColor: COLORS.backgroundSecondary
          },
          headerTintColor: COLORS.textPrimary,
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
          options={{ 
            title: 'Choose Gym', 
            tabBarIcon: ({ color }) => <TabBarIcon name="search" color={color} />
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{ 
            title: 'Profile', 
            tabBarIcon: ({ color }) => <TabBarIcon name="user" color={color} />
          }}
        />
      </Tabs>
    </KeyboardAvoidingView>
  );
}
