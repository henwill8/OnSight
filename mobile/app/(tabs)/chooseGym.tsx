import React, { useState, useEffect } from 'react';
import { View, Text, Button, FlatList, TextInput, Alert, TouchableOpacity } from 'react-native';
import { setItemAsync, getItemAsync } from 'expo-secure-store';
import config from '@/config';

const ChooseGym: React.FC = () => {
  const [gyms, setGyms] = useState<any[]>([]); // Array to store the list of gyms
  const [newGymName, setNewGymName] = useState('');
  const [newGymLocation, setNewGymLocation] = useState('');
  const [currentGymName, setCurrentGymName] = useState<string>(''); // Store the selected gym's name

  // Fetch gyms when the component mounts
  useEffect(() => {
    fetchGyms();
    fetchCurrentGymName();
  }, []);

  const fetchGyms = async () => {
    try {
      const response = await fetch(`${config.API_URL}/api/list-gyms`);
      const data = await response.json();

      if (response.ok) {
        console.log("Gyms fetched:");
        data.gyms.forEach((gym, index) => {
          console.log(`Gym ${index + 1}: ID: ${gym.id}, Name: ${gym.name}, Location: ${gym.location}`);
        });
        setGyms(data.gyms);
      } else {
        Alert.alert('Error', 'Failed to fetch gyms');
      }
    } catch (error) {
      console.error('Error fetching gyms:', error);
      Alert.alert('Error', 'Failed to fetch gyms');
    }
  };

  const fetchCurrentGymName = async () => {
    try {
      const gymId = await getItemAsync('gymId');
      if (gymId) {
        const response = await fetch(`${config.API_URL}/api/get-gym/${gymId}`);
        const data = await response.json();

        if (response.ok && data.gym) {
          setCurrentGymName(data.gym.name); // Set the current gym name
        }
      }
    } catch (error) {
      console.error("Error fetching current gym name:", error);
    }
  };

  const handleCreateGym = async () => {
    if (!newGymName || !newGymLocation) {
      Alert.alert('Error', 'Please provide both name and location for the gym');
      return;
    }

    try {
      const response = await fetch(`${config.API_URL}/api/create-gym`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newGymName,
          location: newGymLocation,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        Alert.alert('Success', 'Gym created successfully!');
        setNewGymName('');
        setNewGymLocation('');
        fetchGyms(); // Refresh the list after creating a gym
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Failed to create gym');
      }
    } catch (error) {
      console.error('Error creating gym:', error);
      Alert.alert('Error', 'Failed to create gym');
    }
  };

  const renderGymItem = ({ item }: { item: any }) => {
    const handlePress = async () => {
      try {
        await setItemAsync("gymId", item.id);
        console.log(`Gym ID ${item.id} selected.`);
        setCurrentGymName(item.name); // Set the current gym name when selected
      } catch (error) {
        console.error("Error saving gym ID:", error);
      }
    };

    return (
      <TouchableOpacity onPress={handlePress}>
        <View style={{ padding: 10, borderBottomWidth: 1 }}>
          <Text style={{ fontSize: 18 }}>{item.name}</Text>
          <Text>{item.location}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      {/* Form to create a new gym */}
      <TextInput
        value={newGymName}
        onChangeText={setNewGymName}
        placeholder="Gym Name"
        style={{ borderWidth: 1, marginBottom: 10, padding: 10 }}
      />
      <TextInput
        value={newGymLocation}
        onChangeText={setNewGymLocation}
        placeholder="Gym Location"
        style={{ borderWidth: 1, marginBottom: 10, padding: 10 }}
      />
      <Button title="Create Gym" onPress={handleCreateGym} />

      {/* Display the name of the current gym */}
      {currentGymName ? (
        <Text style={{ fontSize: 18, marginVertical: 30 }}>
          Current Gym: {currentGymName}
        </Text>
      ) : (
        <Text style={{ fontSize: 18, marginVertical: 30 }}>
          No gym selected.
        </Text>
      )}

      <Text style={{ fontSize: 20, marginBottom: 10 }}>Available Gyms</Text>

      {/* List of gyms */}
      <FlatList
        data={gyms}
        renderItem={renderGymItem}
        keyExtractor={(item) => item.id.toString()}
      />
    </View>
  );
};

export default ChooseGym;
