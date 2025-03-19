import React from 'react';
import { StyleSheet, View, Text, FlatList } from 'react-native';
import { styles } from './_styles'; 

const climbs = [
  { V1: 'climb1' },
  { V2: 'climb2' },
  { V3: 'climb3' },
  { V4: 'climb4' },
  { V5: 'climb5' },
  { V6: 'climb6' },
  { V7: 'climb7' },
  { V8: 'climb8' },
  { V9: 'climb9' },
  { V10: 'climb10' },
  { V11: 'climb11' },
];

const climbingGym = "The Carpenter Wall";


export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.headerText}>{climbingGym}</Text>
      <FlatList
        data={climbs}
        renderItem={({ item }) => {
          const grade = Object.keys(item)[0];
          const climbName = item[grade]; 

          return (
            <View style={styles.climbItem}>
              <Text style={styles.item}>
                {climbName}: {grade}
              </Text>
            </View>
          );
        }}
        keyExtractor={(item, index) => index.toString()} 
        contentContainerStyle={styles.flatListContent} 
      />
    </View>
  );
}
