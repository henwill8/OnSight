import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { API_PATHS } from '../../constants/paths';
import { Gym } from '../../types';
import { callApi } from '../../utils/api';
import { useGymStore } from '@/storage/gymStore';

export const useChooseGymLogic = () => {

  const [gyms, setGyms] = useState<Gym[]>([]);
  const [newGymName, setNewGymName] = useState('');
  const [newGymLocation, setNewGymLocation] = useState('');
  const [loading, setLoading] = useState(false);
  const { state: gymStoreState, setGym, updateGym } = useGymStore();

  useEffect(() => {
    fetchGyms();
  }, []);

  const fetchGyms = async () => {
    setLoading(true);
    try {
      const response = await callApi<{ gyms: Gym[] }>(API_PATHS.LIST_GYMS, { method: 'GET', timeout: 5000 });
      if (response.gyms) setGyms(response.gyms);
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
      const response = await callApi<{ message?: string }>(API_PATHS.CREATE_GYM, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: { name: newGymName, location: newGymLocation },
        timeout: 5000
      });

      Alert.alert('Success', 'Gym created successfully!');
      setNewGymName('');
      setNewGymLocation('');
      fetchGyms();
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to create gym');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectGym = async (gym: Gym) => {
    try {
      console.log("setting gym data", gym);
      setGym(gym);
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
