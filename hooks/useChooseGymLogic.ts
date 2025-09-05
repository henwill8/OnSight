import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import config from '@/config';
import { API_PATHS } from '@/constants/paths';
import { fetchWithTimeout } from '@/utils/api';
import { useGymStore } from '@/store/gymStore';
import { Gym } from '@/types';

export const useChooseGymLogic = () => {
  const { setGymData } = useGymStore();

  const [gyms, setGyms] = useState<Gym[]>([]);
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

  const handleSelectGym = async (gym: Gym) => {
    try {
      setGymData({ gymName: gym.name, gymId: gym.id, locationId: '' });
    } catch (error) {
      console.error(error);
    }
  };

  return {
    gyms,
    newGymName,
    setNewGymName,
    newGymLocation,
    setNewGymLocation,
    loading,
    handleCreateGym,
    handleSelectGym,
  };
};
