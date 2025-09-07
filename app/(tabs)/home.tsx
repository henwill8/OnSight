import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import RouteImage from '@/components/RouteImage/RouteImage';

import { useGymStore } from '@/storage/gymStore';
import { useLocationStore } from '@/storage/locationStore';
import { Route, useRouteStore } from '@/storage/routeStore';
import { useRoutesData } from '@/hooks/routes/useRoutesData';
import { RouteInfo } from '@/types';
import { useTheme } from '@/constants/theme';

const getStyles = (colors: any, sizes: any, shadows: any, spacing: any, font: any) => {
  return StyleSheet.create({
    breadcrumbContainer: { flexDirection: 'row', marginVertical: spacing.sm },
    breadcrumbGroup: { flexDirection: 'row', alignItems: 'center' },
    breadcrumbItem: { fontSize: font.body, marginHorizontal: spacing.xs, color: colors.textPrimary },
    breadcrumbSeparator: { fontSize: font.body, marginHorizontal: spacing.xs },
    childLocationCard: { padding: spacing.sm, marginRight: spacing.md, borderRadius: sizes.borderRadius, justifyContent: 'center', alignItems: 'center' },
    childLocationName: { fontSize: font.body, color: colors.textPrimary },
    routeCard: { flexDirection: 'row', marginBottom: spacing.md, padding: spacing.md, borderRadius: sizes.borderRadius, backgroundColor: colors.backgroundSecondary },
    routeImage: { width: 80, height: 80, borderRadius: sizes.borderRadius, marginRight: spacing.md },
    routeInfo: { flex: 1, color: colors.textSecondary },
    routeName: { fontSize: font.h5, fontWeight: '500', color: colors.textSecondary },
    routeDescription: { fontSize: font.caption, marginTop: spacing.xs, color: colors.textSecondary },
    routeDifficulty: {
      fontSize: font.caption,
      color: colors.textSecondary,
      marginTop: 6,
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
      shadowColor: shadows.medium.shadowColor,
      elevation: shadows.medium.elevation,
    },
    noGymSelectedText: {
      color: colors.textPrimary,
      textAlign: 'center',
    },
    noRoutesFoundText: {
      color: colors.textSecondary,
      textAlign: 'center',
    },
  });
};

const HomeScreen = () => {
  const { colors, sizes, shadows, spacing, global, font } = useTheme();
  const router = useRouter();
  const navigation = useNavigation();
  const { shouldReload } = useLocalSearchParams();

  const { data: gymData } = useGymStore();
  const { data: locationData, updateData: updateLocation } = useLocationStore();
  const { updateData: setRoute } = useRouteStore();

  const { routes, childLocations, breadcrumb, loading, refetch } = useRoutesData(gymData.id ? gymData.id : null, locationData.id);

  const styles = getStyles(colors, sizes, shadows, spacing, font);

  useFocusEffect( 
    React.useCallback(() => {
      if (gymData.name) {
        navigation.setOptions({ headerTitle: gymData.name });
      } else {
        navigation.setOptions({ headerTitle: "No Gym Selected" });
      }

      if (shouldReload) {
        refetch();
        router.setParams({ shouldReload: undefined });
      }
    }, [gymData.name, navigation, shouldReload, refetch, router])
  );

  if (!gymData.name) {
    return (
      <View style={global.centerItemsContainer}>
        <Text style={styles.noGymSelectedText}>No gym selected. Please select a gym.</Text>
      </View>
    );
  }

  const handleRoutePress = (route: RouteInfo) => {
    const { route: routeData, ...otherParams } = route;
    router.navigate('/routes/routeDetail');
    router.setParams({ routeParams: encodeURIComponent(JSON.stringify(otherParams)) });
    setRoute(route.route);
  };

  const handleAddRoute = () => {
    router.push('/routes/createRoute');
    router.setParams({ locationId: locationData.id });
  };

  return (
    <View style={global.centerItemsContainer}>
      {/* Breadcrumb */}
      <ScrollView horizontal style={styles.breadcrumbContainer}>
        <TouchableOpacity onPress={() => updateLocation({ id: '' })}>
          <Text style={styles.breadcrumbItem}>Home</Text>
        </TouchableOpacity>
        {breadcrumb.map((loc, idx) => (
          <View key={loc.id} style={styles.breadcrumbGroup}>
            <Text style={styles.breadcrumbSeparator}>{'>'}</Text>
            <TouchableOpacity onPress={() => updateLocation({ id: loc.id })}>
              <Text style={styles.breadcrumbItem}>{loc.name}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* Child Locations */}
      {childLocations.length > 0 && (
        <FlatList
          data={childLocations}
          keyExtractor={(item) => item.id}
          horizontal
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.childLocationCard}
              onPress={() => updateLocation({ id: '' })}
            >
              <Text style={styles.childLocationName}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Routes */}
      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} />
      ) : routes.length > 0 ? (
        <FlatList
          data={routes}
          keyExtractor={(item) => item.id}
          renderItem={({ item: route, index }: { item: RouteInfo, index: number }) => (
            <TouchableOpacity onPress={() => handleRoutePress(route)} style={styles.routeCard}>
              <RouteImage mode='view' routeData={route.route} style={styles.routeImage} />
              <View style={styles.routeInfo}>
                <Text style={styles.routeName}>{route.name || 'No Name'}</Text>
                <Text style={styles.routeDescription}>
                  {route.description || 'No Description'}
                </Text>
                <Text style={styles.routeDifficulty}>Difficulty: {route.difficulty}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      ) : (
        <View style={{ flex: 1 }}>
          <Text style={styles.noRoutesFoundText}>No routes found</Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.addButton}
        onPress={handleAddRoute}
      >
        <AntDesign name="plus" size={32} color={colors.textPrimary} />
      </TouchableOpacity>
    </View>
  );
};

export default HomeScreen;
