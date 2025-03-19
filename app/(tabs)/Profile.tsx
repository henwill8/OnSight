import React from 'react';
import { View, FlatList, Text, StatusBar, StyleSheet } from 'react-native';
import { styles } from './_styles';

const ProfileData = [
  'Logged Climbs',
  'Set Clmibs',
];

export default function TabTwoScreen() {
  const renderItem = ({ item }) => (
    <View style={styles.climbItem}>
      <Text style={styles.item}>{item}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <Text style={styles.headerText}>Profile</Text>

      <FlatList
        data={ProfileData}
        renderItem={renderItem} 
        keyExtractor={(item, index) => index.toString()} 
      />
    </View>
  );
}

