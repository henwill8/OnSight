import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, Image, ActivityIndicator, TouchableOpacity } from 'react-native';
import { getItemAsync } from 'expo-secure-store';
import { useFocusEffect } from '@react-navigation/native';
import config from '@/config';
import { useRouter } from 'expo-router';
import { COLORS, SHADOWS, SIZES, globalStyles } from '@/constants/theme';
import { AntDesign } from '@expo/vector-icons';
import { fetchWithTimeout } from '@/utils/api';
import RouteImage from '@/components/RouteImage/RouteImage';

export interface Route {
  id: string;
  name: string;
  description: string;
  difficulty: number;
  imageUrl: string;
  annotationsUrl: string;
}

const HomeScreen = () => {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [gymId, setGymId] = useState<string | null>(null);
  const [gymIdLoading, setGymIdLoading] = useState<boolean>(true);
  const [currentGymName, setCurrentGymName] = useState<string>('');

  const router = useRouter();

  useFocusEffect(
    useCallback(() => {
      fetchCurrentGymName();
    }, [])
  );

  const fetchCurrentGymName = async () => {
    const currentGymName = await getItemAsync("gymName");
    setCurrentGymName(currentGymName || "");
  };

  useFocusEffect(
    useCallback(() => {
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
    
        const routesWithSignedUrls = await Promise.all(
          data.map(async (route: any) => {
            try {
              const imageUrlRes = await fetchWithTimeout(
                route.imageUrl,
                {
                  method: 'GET',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                }
              );
    
              if (!imageUrlRes.ok) throw new Error('Failed to get signed URL');

              const annotationsUrlRes = await fetchWithTimeout(
                route.annotationsUrl,
                {
                  method: 'GET',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                }
              );
    
              const { url: imageUrl } = await imageUrlRes.json();

              let annotationsUrl = "";
              if (annotationsUrlRes.ok) {
                const { url } = await annotationsUrlRes.json();
                annotationsUrl = url;
              }

              return { ...route, imageUrl: imageUrl, annotationsUrl: annotationsUrl };
            } catch (err) {
              console.error(`Error getting signed URL for image: ${route.imageUrl}`, err);
              return { ...route, signedImageUrl: null };
            }
          })
        );
    
        setRoutes(routesWithSignedUrls);
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
    router.push(`/routes/routeDetail?route=${encodeURIComponent(JSON.stringify(route))}`);
  };

  const handleAddRoute = () => {
    router.push('/routes/createRoute');
  };

  return (
    <View style={globalStyles.container}>
      {loading || gymIdLoading ? (
        <ActivityIndicator size="large" color="#06d6a0" />
      ) : (
        <>
          {currentGymName ? (
            <Text style={[styles.text, { marginVertical: 30, textAlign: "center", fontWeight: 500, fontSize: 25 }]}>
              {currentGymName}
            </Text>
          ) : (
            <Text style={[styles.text, { marginVertical: 30, textAlign: "center" }]}>
              No gym selected.
            </Text>
          )}

          {routes.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No routes found for this gym</Text>
            </View>
          ) : (
            <FlatList
              data={routes}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.routeCard} onPress={() => handleRoutePress(item)}>
                  <RouteImage
                    imageURI={item.imageUrl}
                    dataURL={item.annotationsUrl}
                    style={styles.routeImage}

                    imageProps={{ resizeMode: "cover" }}
                  />
                  <View style={styles.routeInfo}>
                    <Text style={styles.routeName}>{item.name || 'No Name'}</Text>
                    <Text style={styles.routeDescription}>{item.description || 'No Description'}</Text>
                    <Text style={styles.routeDifficulty}>Difficulty: {item.difficulty}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          )}
        </>
      )}

      {currentGymName ? (
        // Only allow users to create a route if a gym is selected
        <TouchableOpacity style={styles.addButton} onPress={handleAddRoute}>
          <AntDesign name="plus" size={32} color={COLORS.textPrimary} />
        </TouchableOpacity>
      ) : (
        <></>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
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
    backgroundColor: COLORS.backgroundSecondary,
    marginBottom: 12,
    padding: 12,
    borderRadius: SIZES.borderRadius,
    elevation: SHADOWS.elevation,
    shadowColor: SHADOWS.shadowColor,
    shadowOffset: SHADOWS.shadowOffset,
    shadowOpacity: SHADOWS.shadowOpacity,
    shadowRadius: SHADOWS.shadowRadius,
    borderWidth: 1,
    borderColor: COLORS.border,
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
    fontSize: 17,
    fontWeight: '500',
    color: COLORS.textPrimary,
  },
  routeDescription: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  routeDifficulty: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 6,
  },
  addButton: {
    position: 'absolute',
    right: 20,
    bottom: 30,
    backgroundColor: COLORS.primary,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  text: {
    fontSize: 18,
    color: COLORS.textPrimary,
  },
});

export default HomeScreen;
