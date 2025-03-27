import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, TextInput, Alert, TouchableOpacity } from 'react-native';
import { setItemAsync, getItemAsync } from 'expo-secure-store';
import { StyleSheet } from 'react-native';
import { COLORS, SHADOWS, SIZES, globalStyles } from '@/constants/theme';
import config from '@/config';
import LoadingModal from '@/components/ui/LoadingModal';  // Import LoadingModal
import { fetchWithTimeout } from "@/utils/api";  // Import fetchWithTimeout

const ChooseGym: React.FC = () => {
  const [gyms, setGyms] = useState<any[]>([]);
  const [newGymName, setNewGymName] = useState('');
  const [newGymLocation, setNewGymLocation] = useState('');
  const [currentGymName, setCurrentGymName] = useState<string>('');
  const [loading, setLoading] = useState(false);  // State to track loading

  useEffect(() => {
    fetchGyms();
    fetchCurrentGymName();
  }, []);

  const fetchGyms = async () => {
    setLoading(true);  // Start loading
    try {
      const response = await fetchWithTimeout(`${config.API_URL}/api/list-gyms`, {
        method: 'GET',
      }, 5000);  // Timeout set to 5 seconds

      const data = await response.json();

      if (response.ok) {
        setGyms(data.gyms);
      } else {
        Alert.alert('Error', 'Failed to fetch gyms');
      }
    } catch (error) {
      console.error('Error fetching gyms:', error);
      Alert.alert('Error', 'Failed to fetch gyms');
    } finally {
      setLoading(false);  // Stop loading
    }
  };

  const fetchCurrentGymName = async () => {
    const currentGymName = await getItemAsync("gymName");
    setCurrentGymName(currentGymName || "");
  };

  const handleCreateGym = async () => {
    if (!newGymName || !newGymLocation) {
      Alert.alert('Error', 'Please provide both name and location for the gym');
      return;
    }

    setLoading(true);  // Start loading
    try {
      const response = await fetchWithTimeout(`${config.API_URL}/api/create-gym`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newGymName,
          location: newGymLocation,
        }),
      }, 5000);  // Timeout set to 5 seconds

      if (response.ok) {
        const data = await response.json();
        Alert.alert('Success', 'Gym created successfully!');
        setNewGymName('');
        setNewGymLocation('');
        fetchGyms();  // Refresh the list after creating a gym
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Failed to create gym');
      }
    } catch (error) {
      console.error('Error creating gym:', error);
      Alert.alert('Error', 'Failed to create gym');
    } finally {
      setLoading(false);  // Stop loading
    }
  };

  const renderGymItem = ({ item }: { item: any }) => {
    const handlePress = async () => {
      try {
        await setItemAsync("gymId", item.id);
        await setItemAsync("gymName", item.name);
        setCurrentGymName(item.name);
        console.log(`Gym ID ${item.id} selected.`);
      } catch (error) {
        console.error("Error saving gym ID:", error);
      }
    };

    return (
      <TouchableOpacity onPress={handlePress}>
        <View style={{ padding: 10, borderBottomWidth: 1, borderBottomColor: COLORS.textPrimary }}>
          <Text style={styles.text}>{item.name}</Text>
          <Text style={{ color: COLORS.textSecondary }}>{item.location}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={globalStyles.container}>
      {/* Form to create a new gym */}
      <TextInput
        value={newGymName}
        onChangeText={setNewGymName}
        placeholder="Gym Name"
        placeholderTextColor={COLORS.textSecondary}
        style={styles.textInput}
      />

      <TextInput
        value={newGymLocation}
        onChangeText={setNewGymLocation}
        placeholder="Gym Location"
        placeholderTextColor={COLORS.textSecondary}
        style={styles.textInput}
      />

      <TouchableOpacity style={styles.button} onPress={() => handleCreateGym()}>
        <Text style={styles.buttonText}>Create Gym</Text>
      </TouchableOpacity>

      {/* Display the name of the current gym */}
      {currentGymName ? (
        <Text style={[styles.text, { marginVertical: 30, textAlign: "center", fontWeight: 500, fontSize: 22 }]}>
          Current Gym: {currentGymName}
        </Text>
      ) : (
        <Text style={[styles.text, { marginVertical: 30 }]}>
          No gym selected.
        </Text>
      )}

      <Text style={{ fontSize: 20, marginBottom: 10, color: COLORS.textPrimary }}>Available Gyms</Text>

      {/* List of gyms */}
      <FlatList
        data={gyms}
        renderItem={renderGymItem}
        keyExtractor={(item) => item.id.toString()}
      />

      {/* Loading Modal */}
      <LoadingModal visible={loading} message=''/>
    </View>
  );
};

const styles = StyleSheet.create({
  textInput: {
    borderWidth: 1,
    marginBottom: 15,
    padding: 10,
    color: COLORS.textPrimary,
    borderColor: COLORS.border,
    borderRadius: SIZES.borderRadius,
    backgroundColor: COLORS.backgroundSecondary,
  },
  text: {
    fontSize: 18,
    color: COLORS.textPrimary
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: SIZES.borderRadius,
    padding: 13,
    alignItems: 'center',
  },
  buttonText: {
    color: COLORS.textPrimary,
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ChooseGym;
