import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import { useGymStore } from '@/store/gymStore';
import { useTheme } from '@/constants/theme';
import config from '@/config';
import LoadingModal from '@/components/ui/LoadingModal';
import { fetchWithTimeout } from "@/utils/api";
import { API_PATHS } from "@/constants/paths";
import { setSecureItem, getSecureItem } from '@/utils/secureStorage';

const ChooseGym: React.FC = () => {
  const { colors, sizes } = useTheme();
  const { gymName, gymId, setGymData } = useGymStore();

  const [gyms, setGyms] = useState<any[]>([]);
  const [newGymName, setNewGymName] = useState('');
  const [newGymLocation, setNewGymLocation] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchGyms();
  }, []);

  const fetchGyms = async () => {
    setLoading(true);
    try {
      const response = await fetchWithTimeout(config.API_URL + API_PATHS.LIST_GYMS, { method: 'GET' }, 5000);
      const data = await response.json();
      if (response.ok) setGyms(data.gyms);
      else Alert.alert('Error', 'Failed to fetch gyms');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to fetch gyms');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGym = async () => {
    if (!newGymName || !newGymLocation) {
      Alert.alert('Error', 'Please provide both name and location for the gym');
      return;
    }

    setLoading(true);
    try {
      const response = await fetchWithTimeout(
        config.API_URL + API_PATHS.CREATE_GYM,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: newGymName, location: newGymLocation }),
        },
        5000
      );

      if (response.ok) {
        Alert.alert('Success', 'Gym created successfully!');
        setNewGymName('');
        setNewGymLocation('');
        fetchGyms();
      } else {
        const errorData = await response.json();
        Alert.alert('Error', errorData.message || 'Failed to create gym');
      }
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to create gym');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectGym = async (gym: any) => {
    try {
      setGymData(gym.name, gym.id, '');
    } catch (error) {
      console.error(error);
    }
  };

  const renderGymItem = ({ item }: { item: any }) => (
    <TouchableOpacity onPress={() => handleSelectGym(item)}>
      <View style={[styles.gymItem, { borderBottomColor: colors.textPrimary }]}>
        <Text style={[styles.gymText, { color: colors.textPrimary }]}>{item.name}</Text>
        <Text style={{ color: colors.textSecondary }}>{item.location}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
      {/* New Gym Form */}
      <TextInput
        value={newGymName}
        onChangeText={setNewGymName}
        placeholder="Gym Name"
        placeholderTextColor={colors.textSecondary}
        style={[styles.textInput, { borderColor: colors.border, backgroundColor: colors.backgroundSecondary, color: colors.textPrimary, borderRadius: sizes.borderRadius }]}
      />
      <TextInput
        value={newGymLocation}
        onChangeText={setNewGymLocation}
        placeholder="Gym Location"
        placeholderTextColor={colors.textSecondary}
        style={[styles.textInput, { borderColor: colors.border, backgroundColor: colors.backgroundSecondary, color: colors.textPrimary, borderRadius: sizes.borderRadius }]}
      />
      <TouchableOpacity style={[styles.button, { backgroundColor: colors.primary, borderRadius: sizes.borderRadius }]} onPress={handleCreateGym}>
        <Text style={[styles.buttonText, { color: colors.textPrimary }]}>Create Gym</Text>
      </TouchableOpacity>

      {/* Current Gym */}
      <Text style={[styles.currentGymText, { color: colors.textPrimary }]}>
        {gymName ? `Current Gym: ${gymName}` : 'No gym selected.'}
      </Text>

      {/* Available Gyms */}
      <Text style={{ fontSize: 20, marginBottom: 10, color: colors.textPrimary }}>Available Gyms</Text>
      <FlatList
        data={gyms}
        renderItem={renderGymItem}
        keyExtractor={(item) => item.id.toString()}
      />

      {/* Loading */}
      <LoadingModal visible={loading} message="" />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  textInput: { borderWidth: 1, marginBottom: 15, padding: 10 },
  button: { padding: 13, alignItems: 'center', marginBottom: 20 },
  buttonText: { fontSize: 16, fontWeight: '600' },
  currentGymText: { fontSize: 22, fontWeight: '500', textAlign: 'center', marginVertical: 30 },
  gymItem: { padding: 10, borderBottomWidth: 1 },
  gymText: { fontSize: 18 },
});

export default ChooseGym;
