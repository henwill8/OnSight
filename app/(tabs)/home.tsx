import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect, useNavigation } from 'expo-router';
import { AntDesign, Ionicons } from '@expo/vector-icons';
import { Menu, IconButton, Provider as PaperProvider } from 'react-native-paper';
import RouteImage from '@/components/RouteImage/RouteImage';

import { useGymStore } from '@/storage/gymStore';
import { useLocationStore } from '@/storage/locationStore';
import { useRouteStore } from '@/storage/routeStore';
import { useRoutesData } from '@/hooks/routes/useRoutesData';
import { RouteInfo } from '@/types';
import { useTheme } from '@/constants/theme';

const getStyles = (colors: any, sizes: any, shadows: any, spacing: any, font: any) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundPrimary,
    },
    breadcrumbContainer: { 
      flexDirection: 'row', 
      marginVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      alignItems: 'center',
    },
    breadcrumbGroup: { 
      flexDirection: 'row', 
      alignItems: 'center' 
    },
    breadcrumbItem: { 
      fontSize: font.body, 
      marginHorizontal: spacing.xs, 
      color: colors.textPrimary 
    },
    childLocationsContainer: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.xs,
      maxHeight: 60,
    },
    childLocationCard: { 
      padding: spacing.sm, 
      marginRight: spacing.md, 
      borderRadius: sizes.borderRadius, 
      justifyContent: 'center', 
      alignItems: 'center',
      backgroundColor: colors.backgroundSecondary,
    },
    childLocationName: { 
      fontSize: font.body, 
      color: colors.textPrimary 
    },
    controlRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    routesContainer: {
      flex: 1,
    },
    routesList: {
      paddingHorizontal: spacing.md,
    },
    routeCard: { 
      flexDirection: 'row', 
      marginBottom: spacing.md, 
      padding: spacing.md, 
      borderRadius: sizes.borderRadius, 
      backgroundColor: colors.backgroundSecondary 
    },
    routeImage: { 
      width: 80, 
      height: 80, 
      borderRadius: sizes.borderRadius, 
      marginRight: spacing.md 
    },
    routeInfo: { 
      flex: 1, 
      color: colors.textSecondary 
    },
    routeName: { 
      fontSize: font.h5, 
      fontWeight: '500', 
      color: colors.textPrimary 
    },
    routeDescription: { 
      fontSize: font.caption, 
      marginTop: spacing.xs, 
      color: colors.textSecondary 
    },
    routeDifficulty: {
      fontSize: font.caption,
      color: colors.textSecondary,
      marginTop: 6,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    noRoutesContainer: {
      paddingTop: spacing.xl,
      alignItems: 'center',
    },
    addButton: { 
      position: 'absolute',
      right: spacing.md,
      bottom: spacing.lg,
      width: 56,
      height: 56,
      borderRadius: 28,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.primary,
      elevation: 4,
    },
    noRoutesFoundText: {
      textAlign: 'center',
      fontSize: font.body,
      color: colors.textSecondary,
    },
    rowLeft: { flexDirection: 'column', flex: 1 },
    rowRight: { flexDirection: 'row', alignItems: 'center' },
  });
};

const HomeScreen = () => {
  const { colors, sizes, shadows, spacing, font } = useTheme();
  const navigation = useNavigation();
  const router = useRouter();
  const { shouldReload } = useLocalSearchParams();

  const { data: gymData } = useGymStore();
  const { data: locationData, updateData: updateLocation } = useLocationStore();
  const { updateData: setRoute } = useRouteStore();

  const { routes, childLocations, breadcrumb, loading, refetch } = useRoutesData(
    gymData?.id ? gymData?.id : null, 
    locationData?.id
  );

  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<'name' | 'difficulty'>('name');

  const [filterMenuVisible, setFilterMenuVisible] = useState(false);
  const [sortMenuVisible, setSortMenuVisible] = useState(false);

  const styles = getStyles(colors, sizes, shadows, spacing, font);

  useFocusEffect( 
    useCallback(() => {
      if (gymData?.name) {
        navigation.setOptions({ headerTitle: gymData?.name });
      } else {
        navigation.setOptions({ headerTitle: "No Gym Selected" });
      }
    }, [navigation, gymData?.name])
  )

  useFocusEffect(
    useCallback(() => {
      if (shouldReload) {
        // refetch routes when navigating back with shouldReload
        refetch?.();
      }
    }, [shouldReload, refetch])
  )

  const filteredAndSortedRoutes = useMemo(() => {
    let filtered = routes;
    if (selectedDifficulty) {
      filtered = routes.filter(r => r.difficulty === selectedDifficulty);
    }
    if (sortOption === 'name') {
      filtered = filtered.sort((a, b) => (a?.name || '').localeCompare(b?.name || ''));
    } else if (sortOption === 'difficulty') {
      filtered = filtered.sort((a, b) => (a.difficulty || '').localeCompare(b.difficulty || ''));
    }
    return filtered;
  }, [routes, selectedDifficulty, sortOption]);

  const handleRoutePress = (route: RouteInfo) => {
    const { route: routeData, ...otherParams } = route;
    setRoute(route.route);
    router.push({
      pathname: '/routes/routeDetail',
      params: {
        routeParams: encodeURIComponent(JSON.stringify(otherParams)),
      },
    });
  };

  const handleAddRoute = () => {
    router.push('/routes/createRoute');
    router.setParams({ locationId: locationData?.id });
  };

  return (
    <PaperProvider>
      <View style={styles.container}>
        {/* Top Row: Breadcrumb + Child Locations (left), Filter/Sort (right) */}
        <View style={styles.controlRow}>
          <View style={styles.rowLeft}>
            {/* Breadcrumb with Home */}
            <ScrollView 
              horizontal 
              // style={styles.breadcrumbContainer} 
              showsHorizontalScrollIndicator={false}
            >
              <TouchableOpacity onPress={() => updateLocation({ id: '' })}>
                <Text style={styles.breadcrumbItem}>Home</Text>
              </TouchableOpacity>
              {breadcrumb.map((loc, idx) => (
                <View key={loc?.id} style={styles.breadcrumbGroup}>
                  <Text style={styles.breadcrumbItem}>{'>'}</Text>
                  <TouchableOpacity onPress={() => updateLocation({ id: loc?.id })}>
                    <Text style={styles.breadcrumbItem}>{loc?.name}</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>

            {/* Child Locations */}
            {childLocations.length > 0 && (
              <View style={styles.childLocationsContainer}>
                <FlatList
                  data={childLocations}
                  keyExtractor={(item) => item?.id}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.childLocationCard}
                      onPress={() => updateLocation({ id: item?.id })}
                    >
                      <Text style={styles.childLocationName}>{item?.name}</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}
          </View>

          {/* Right Side Controls */}
          <View style={styles.rowRight}>
            {/* Filter Menu */}
            <Menu
              visible={filterMenuVisible}
              onDismiss={() => setFilterMenuVisible(false)}
              anchor={
                <IconButton
                  icon="filter-variant"
                  size={24}
                  onPress={() => setFilterMenuVisible(true)}
                />
              }
            >
              {['Easy', 'Medium', 'Hard'].map(diff => (
                <Menu.Item
                  key={diff}
                  onPress={() => {
                    setSelectedDifficulty(diff);
                    setFilterMenuVisible(false);
                  }}
                  title={diff}
                />
              ))}
              {selectedDifficulty && (
                <Menu.Item
                  onPress={() => {
                    setSelectedDifficulty(null);
                    setFilterMenuVisible(false);
                  }}
                  title="Clear filter"
                />
              )}
            </Menu>

            {/* Sort Menu */}
            <Menu
              visible={sortMenuVisible}
              onDismiss={() => setSortMenuVisible(false)}
              anchor={
                <IconButton
                  icon="sort"
                  size={24}
                  onPress={() => setSortMenuVisible(true)}
                />
              }
            >
              {['name', 'difficulty'].map(option => (
                <Menu.Item
                  key={option}
                  onPress={() => {
                    setSortOption(option as any);
                    setSortMenuVisible(false);
                  }}
                  title={`Sort by ${option}`}
                />
              ))}
            </Menu>
          </View>
        </View>

        {/* Routes Section */}
        <View style={styles.routesContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          ) : filteredAndSortedRoutes.length > 0 ? (
            <FlatList
              data={filteredAndSortedRoutes}
              keyExtractor={(item) => item?.id}
              contentContainerStyle={styles.routesList}
              showsVerticalScrollIndicator={false}
              renderItem={({ item: route }) => (
                <TouchableOpacity onPress={() => handleRoutePress(route)} style={styles.routeCard}>
                  <RouteImage mode='view' routeData={route.route} style={styles.routeImage} />
                  <View style={styles.routeInfo}>
                    <Text style={styles.routeName}>{route?.name || 'No Name'}</Text>
                    <Text style={styles.routeDescription}>
                      {route.description || 'No Description'}
                    </Text>
                    <Text style={styles.routeDifficulty}>Difficulty: {route.difficulty}</Text>
                  </View>
                </TouchableOpacity>
              )}
            />
          ) : (
            <View style={styles.noRoutesContainer}>
              <Text style={styles.noRoutesFoundText}>
                {selectedDifficulty ? `No routes found for difficulty: ${selectedDifficulty}` : 'No routes found'}
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity style={styles.addButton} onPress={handleAddRoute}>
          <AntDesign name="plus" size={32} color="#fff" />
        </TouchableOpacity>
      </View>
    </PaperProvider>
  );
};

export default HomeScreen;
