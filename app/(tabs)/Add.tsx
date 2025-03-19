import React, { useState } from 'react';
import { View, FlatList, Text, StatusBar, StyleSheet, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { styles } from './_styles'; 

const ProfileData = [
  'The Carpenter Wall',
  'Contact Climbing Gym',
];

export default function TabTwoScreen() {

  const [searchQuery, setSearchQuery] = useState('');


  const filteredData = ProfileData.filter((item) =>
    item.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderItem = ({ item }) => (
    <View style={styles.climbItem}>
      <Text style={styles.item}>{item}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" translucent backgroundColor="transparent" />
      <Text style={styles.headerText}>Gyms</Text>

      <View style={styles.searchContainer}>
        <Text style={styles.item}>Name</Text>
        <TextInput
          style={styles.searchBar}
          placeholder="Problem name..."
          placeholderTextColor="#999"
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)} 
        />
      </View>

      <FlatList
        data={filteredData} 
        renderItem={renderItem}
        keyExtractor={(item, index) => index.toString()}
      />
    </View>
  );
}
