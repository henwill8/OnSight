import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { styles } from './_searchStyle.tsx';

export default function TabTwoScreen() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>Search</Text>
      <View style={styles.searchContainer}>
        <Feather name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchBar}
          placeholder="Search for gyms..."
          placeholderTextColor="#999" 
          value={searchQuery}
          onChangeText={(text) => setSearchQuery(text)} 
        />
      </View>
    </View>
  );
}
