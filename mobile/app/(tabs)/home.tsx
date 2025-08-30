import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { setSecureItem, getSecureItem } from '@/utils/secureStorage';
import { useFocusEffect } from '@react-navigation/native';
import { useRouter, useNavigation, useLocalSearchParams } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';

// Local imports
import config from '@/config';
import { COLORS, SHADOWS, SIZES, globalStyles } from '@/constants/theme';
import { fetchWithTimeout } from '@/utils/api';
import { API_PATHS } from "@/constants/paths";
import RouteImage from '@/components/RouteImage/RouteImage';

// Types
export interface Route {
  id: string;
  name: string;
  description: string;
  difficulty: number;
  imageUrl: string;
  annotationsUrl: string;
}

export interface Location {
  id: string;
  name: string;
}

const HomeScreen = () => {
  // State management
  const [routes, setRoutes] = useState<Route[]>([]);
  const [childLocations, setChildLocations] = useState<Location[]>([]);
  const [breadcrumb, setBreadcrumb] = useState<Location[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [gymId, setGymId] = useState<string | null>(null);
  const [locationId, setLocationId] = useState<string | null>(null);
  const [gymIdLoading, setGymIdLoading] = useState<boolean>(true);
  const [currentGymName, setCurrentGymName] = useState<string>('');

  const router = useRouter();
  const navigation = useNavigation();

  const { shouldReload } = useLocalSearchParams();

  useFocusEffect(() => {
    const loadGymData = async () => {
      await fetchCurrentGymName();
      await loadGymId();
    };

    loadGymData();
  });

  // Helper functions for data fetching
  const fetchCurrentGymName = async () => {
    const currentGymName = await getSecureItem("gymName");
    setCurrentGymName(currentGymName || "");
    console.log("Current gym name:", currentGymName);
  };

  const loadGymId = async () => {
    const id = await getSecureItem('gymId');
    console.log(id, gymId);
    setGymId(id);
    setGymIdLoading(false);
  };

  useEffect(() => {
    if (currentGymName) {
      navigation.setOptions({ headerTitle: currentGymName ? currentGymName : "No Gym Selected" });
    }
  }, [currentGymName, navigation]);
  
  // Data fetching effects (fetch on gymId change or when shouldReload is true)
  useEffect(() => {
    if (gymId !== null) {
      console.log("Gym ID loaded:", gymId);
      fetchData();
    }
  }, [gymId, locationId]);

  useEffect(() => {
    if (shouldReload) {
      fetchData();

      router.setParams({ shouldReload: 0 }) // Reset shouldReload after data fetch
    }
  }, [shouldReload]);

  const fetchData = async () => {
    if (gymId) {
      console.log("Fetching data for gymId:", gymId, "and locationId:", locationId);

      setLoading(true);
      try {
        await Promise.all([fetchRoutes(), fetchChildLocations(), fetchBreadcrumb()]);
      } catch (error) {
        console.error('Error fetching data:', error);
        setRoutes([]);
        setChildLocations([]);
      } finally {
        setLoading(false);
      }
    }
  };

  // Specific data fetching functions
  const fetchRoutes = async () => {
    const routesUrl = `${config.API_URL}${API_PATHS.GET_ROUTES}?gymId=${gymId}${locationId ? `&locationId=${locationId}` : ""}`;
    const routesRes = await fetch(routesUrl);
    
    if (!routesRes.ok) throw new Error('Failed to fetch routes');
    const routeData = await routesRes.json();

    const routesWithSignedUrls = await Promise.all(
      routeData.map(async (route: any) => {
        try {
          const imageUrlRes = await fetchWithTimeout(route.imageUrl, { 
            method: 'GET', 
            headers: { 'Content-Type': 'application/json' } 
          });
          
          const annotationsUrlRes = await fetchWithTimeout(route.annotationsUrl, { 
            method: 'GET', 
            headers: { 'Content-Type': 'application/json' } 
          });

          const { url: imageUrl } = await imageUrlRes.json();
          let annotationsUrl = "";

          if (annotationsUrlRes.ok) {
            const { url } = await annotationsUrlRes.json();
            annotationsUrl = url;
          }

          return { ...route, imageUrl, annotationsUrl };
        } catch (err) {
          console.error(`Error getting signed URL for route: ${route.imageUrl}`, err);
          return { ...route, signedImageUrl: null };
        }
      })
    );
    
    setRoutes(routesWithSignedUrls);
  };

  const fetchChildLocations = async () => {
    const childUrl = `${config.API_URL}${API_PATHS.GET_CHILD_LOCATIONS(gymId || "")}${locationId ? `?parentId=${locationId}` : ""}`;
    const childRes = await fetch(childUrl);
    
    if (!childRes.ok) throw new Error('Failed to fetch child locations');
    const childData = await childRes.json();
    
    setChildLocations(childData.locations || []);
  };

  const fetchBreadcrumb = async () => {
    if (!locationId) {
      setBreadcrumb([]);
      return;
    }
    
    const breadcrumbUrl = `${config.API_URL}${API_PATHS.GET_LOCATION_ANCESTRY(locationId)}`;
    const breadcrumbRes = await fetch(breadcrumbUrl);
    
    if (!breadcrumbRes.ok) throw new Error('Failed to fetch breadcrumb');
    const breadcrumbData = await breadcrumbRes.json();
    
    setBreadcrumb(breadcrumbData.ancestry || []);
  };

  // Event handlers
  const handleRoutePress = (route: Route) => {
    router.push('/routes/routeDetail');
    router.setParams({ route: encodeURIComponent(JSON.stringify(route)) });
  };

  const handleLocationPress = (location: Location) => {
    setLocationId(location.id);
  };

  const handleBreadcrumbPress = (locationIndex: number) => {
    if (locationIndex === -1) {
      setLocationId(null); // back to gym root
    } else {
      setLocationId(breadcrumb[locationIndex].id);
    }
  };

  const handleAddRoute = () => {
    router.push('/routes/createRoute');
    router.setParams({ locationId: locationId });
  };

  // Render components
  const renderBreadcrumb = () => (
    <ScrollView 
      horizontal 
      showsHorizontalScrollIndicator={false} 
      style={styles.breadcrumbContainer}
      contentContainerStyle={styles.breadcrumbContent}
    >
      <TouchableOpacity onPress={() => handleBreadcrumbPress(-1)}>
        <Text style={styles.breadcrumbItem}>Home</Text>
      </TouchableOpacity>
      {breadcrumb.map((loc, idx) => (
        <View key={loc.id} style={styles.breadcrumbGroup}>
          <Text style={styles.breadcrumbSeparator}>{'>'}</Text>
          <TouchableOpacity onPress={() => handleBreadcrumbPress(idx)}>
            <Text style={styles.breadcrumbItem}>{loc.name}</Text>
          </TouchableOpacity>
        </View>
      ))}
    </ScrollView>
  );

  const renderChildLocations = () => {
    if (childLocations.length === 0)
      return;

    return (
      <View style={styles.childLocationsContainer}>
      <FlatList
        data={childLocations}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.childLocationCard}
            onPress={() => handleLocationPress(item)}
          >
            <Text style={styles.childLocationName}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
    );
  };

  const renderRoutes = () => {
    if (routes.length === 0) {
      return (
        <View style={styles.emptyRoutesContainer}>
          <Text style={styles.emptyText}>No routes found for this location</Text>
        </View>
      );
    }

    return (
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
    );
  };

  // Main render
  return (
    <View style={globalStyles.container}>
      {loading || gymIdLoading ? (
        <ActivityIndicator size="large" color="#06d6a0" />
      ) : (
        <View style={{ flex: 1 }}>
          {/* Breadcrumb Navigation */}
          {renderBreadcrumb()}

          {/* Child Locations */}
          {renderChildLocations()}

          {/* Routes */}
          {renderRoutes()}
        </View>
      )}

      {/* Add Button - only show when gym is selected */}
      {currentGymName && (
        <TouchableOpacity style={styles.addButton} onPress={handleAddRoute}>
          <AntDesign name="plus" size={32} color={COLORS.textPrimary} />
        </TouchableOpacity>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  emptyRoutesContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 18,
    color: '#999',
  },
  breadcrumbContainer: {
    flexDirection: 'row',
    marginVertical: 10,
    paddingHorizontal: 10,
    maxHeight: 30,
  },
  breadcrumbContent: {
    alignItems: 'center',
    height: 30,
  },
  breadcrumbGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 30,
  },
  breadcrumbItem: {
    fontSize: 16,
    color: COLORS.textPrimary,
    marginHorizontal: 5,
  },
  breadcrumbSeparator: {
    fontSize: 16,
    color: COLORS.textSecondary,
    marginHorizontal: 2,
    lineHeight: 20,
  },
  childLocationsContainer: {
    height: 50,
    marginBottom: 10,
  },
  childLocationCard: {
    padding: 10,
    backgroundColor: COLORS.primary,
    marginRight: 10,
    marginBottom: 10,
    borderRadius: 8,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  childLocationName: {
    fontSize: 16,
    color: COLORS.textPrimary,
    textAlign: 'center',
    textAlignVertical: 'center',
    lineHeight: 20,
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
});

export default HomeScreen;