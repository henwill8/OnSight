import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import RouteImage from '@/components/RouteImage/RouteImage';

import { useGymStore } from '@/storage/gymStore';
import { Gym } from '@/types';
import { useRoutesData } from '@/hooks/routes/useRoutesData';
import { useTheme } from '@/constants/theme';
import { Route, Location, BreadcrumbItem } from '@/types';

const getStyles = (colors: any, sizes: any, shadows: any, spacing: any) => {
  return StyleSheet.create({
    breadcrumbContainer: { flexDirection: 'row', marginVertical: spacing.sm },
    breadcrumbGroup: { flexDirection: 'row', alignItems: 'center' },
    breadcrumbItem: { fontSize: 16, marginHorizontal: spacing.xs, color: colors.textPrimary },
    breadcrumbSeparator: { fontSize: 16, marginHorizontal: spacing.xs },
    childLocationCard: { padding: spacing.sm, marginRight: spacing.md, borderRadius: sizes.borderRadius, justifyContent: 'center', alignItems: 'center' },
    childLocationName: { fontSize: 16, color: colors.textPrimary },
    routeCard: { flexDirection: 'row', marginBottom: spacing.md, padding: spacing.md, borderRadius: sizes.borderRadius, borderWidth: 1 },
    routeImage: { width: 80, height: 80, borderRadius: sizes.borderRadius, marginRight: spacing.md },
    routeInfo: { flex: 1 },
    routeName: { fontSize: 17, fontWeight: '500' },
    routeDescription: { fontSize: 14, marginTop: spacing.xs },
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
  const { colors, sizes, shadows, spacing, global } = useTheme();
  const router = useRouter();
  const navigation = useNavigation();
  const { shouldReload } = useLocalSearchParams();

  const { state, updateGym } = useGymStore();
  const gymData = state.data;

  const { routes, childLocations, breadcrumb, loading, refetch } = useRoutesData<Route, Location, BreadcrumbItem>(gymData.id ? gymData.id : null, gymData.location);

  const styles = getStyles(colors, sizes, shadows, spacing);

  const setGymField = (partial: Partial<Gym>) => {
    updateGym(partial);
  };

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

  const handleRoutePress = (route: Route) => {
    router.navigate('/routes/routeDetail');
    router.setParams({ route: encodeURIComponent(JSON.stringify(route)) });
  };

  const handleAddRoute = () => {
    router.push('/routes/createRoute');
    router.setParams({ locationId: gymData.location });
  };

  return (
    <View style={global.centerItemsContainer}>
      {/* Breadcrumb */}
      <ScrollView horizontal style={styles.breadcrumbContainer}>
        <TouchableOpacity onPress={() => setGymField({ location: '' })}>
          <Text style={styles.breadcrumbItem}>Home</Text>
        </TouchableOpacity>
        {breadcrumb.map((loc, idx) => (
          <View key={loc.id} style={styles.breadcrumbGroup}>
            <Text style={styles.breadcrumbSeparator}>{'>'}</Text>
            <TouchableOpacity onPress={() => setGymField({ location: loc.id })}>
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
              onPress={() => setGymField({ location: '' })}
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
          renderItem={({ item: route, index }: { item: Route, index: number }) => (
            <TouchableOpacity onPress={() => handleRoutePress(route)} style={styles.routeCard}>
              <RouteImage imageURI={route.imageUrl} dataURL={route.annotationsUrl} style={styles.routeImage} />
              <View style={styles.routeInfo}>
                <Text style={styles.routeName}>{route.name || 'No Name'}</Text>
                <Text style={styles.routeDescription}>
                  {route.description || 'No Description'}
                </Text>
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
