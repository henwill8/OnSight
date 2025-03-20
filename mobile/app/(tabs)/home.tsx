import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { getItemAsync } from 'expo-secure-store';
import { useFocusEffect } from '@react-navigation/native';
import config from '@/config';
import { useRouter } from 'expo-router';
import { globalStyles } from '@/app/_styles';

interface Route {
  id: string;
  name: string;
  description: string;
  difficulty: number;
  image_url: string;
}

const HomeScreen = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [gymId, setGymId] = useState<string | null>(null);
  const [gymIdLoading, setGymIdLoading] = useState<boolean>(true);

  const router = useRouter(); // Initialize the router

  useFocusEffect(
    React.useCallback(() => {
      const loadGymId = async () => {
        const id = await getItemAsync('gymId');
        console.log(`Loaded gym ID: ${id}`);
        setGymId(id);
        setGymIdLoading(false);
      };

      loadGymId();
    }, [])
  );

  useEffect(() => {
    const fetchRoutes = async () => {
      if (!gymId) {
        console.error('No gym ID found');
        setRoutes([]);
        setLoading(false);
        return;
      }

      setLoading(true);

      try {
        console.log(`Fetching routes for gym ID: ${gymId}`);
        const response = await fetch(`${config.API_URL}/api/get-routes/${gymId}`);
        if (!response.ok) throw new Error('Failed to fetch routes');

        const data = await response.json();
        console.log('Fetched routes:', data);
        setRoutes(data);
      } catch (error) {
        console.error('Error fetching routes:', error);
        setRoutes([]);
      } finally {
        setLoading(false);
      }
    };

    if (!gymIdLoading && gymId) {
      fetchRoutes();
    }
  }, [gymId, gymIdLoading]);

  const handleRoutePress = (route: Route) => {
    router.push(`/routeDetail?route=${JSON.stringify(route)}`);
  };

  if (loading || gymIdLoading) {
    return (
      <View style={globalStyles.container}>
        <ActivityIndicator size="large" color="#06d6a0" />
      </View>
    );
  }

  if (routes.length === 0) {
    return (
      <View style={globalStyles.container}>
        <Text style={styles.emptyText}>No routes found for this gym</Text>
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      <FlatList
        data={routes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.routeCard} onPress={() => handleRoutePress(item)}>
            <Image
              source={{ uri: item.image_url }}
              style={styles.routeImage}
              resizeMode="cover"
            />
            <View style={styles.routeInfo}>
              <Text style={styles.routeName}>{item.name || 'No Name'}</Text>
              <Text style={styles.routeDescription}>{item.description || 'No Description'}</Text>
              <Text style={styles.routeDifficulty}>Difficulty: {item.difficulty}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
  },
  routeCard: {
    flexDirection: 'row',
    backgroundColor: '#f9f9f9',
    marginBottom: 12,
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  routeImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    marginRight: 12,
  },
  routeInfo: {
    flex: 1,
  },
  routeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  routeDescription: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  routeDifficulty: {
    fontSize: 14,
    color: '#06d6a0',
    marginTop: 6,
  },
});

export default HomeScreen;
