import React, { useEffect } from 'react';
import { View, Text, FlatList, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect, useNavigation, useRouter, useLocalSearchParams } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import RouteImage from '@/components/RouteImage/RouteImage';

import { useGymStore } from '@/store/gymStore';
import { useRoutesData } from '@/hooks/useRoutesData';
import { useTheme } from '@/constants/theme';
import { Route, Location, BreadcrumbItem } from '@/types';

const getStyles = (colors: any, sizes: any, shadows: any, spacing: any) => {
  return StyleSheet.create({
    container: { flex: 1, padding: spacing.md, backgroundColor: colors.backgroundPrimary },
    breadcrumbContainer: { flexDirection: 'row', marginVertical: spacing.sm },
    breadcrumbGroup: { flexDirection: 'row', alignItems: 'center' },
    breadcrumbItem: { fontSize: 16, marginHorizontal: spacing.xs },
    breadcrumbSeparator: { fontSize: 16, marginHorizontal: spacing.xs },
    childLocationCard: { padding: spacing.sm, marginRight: spacing.md, borderRadius: sizes.borderRadius, justifyContent: 'center', alignItems: 'center' },
    childLocationName: { fontSize: 16 },
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
      shadowColor: shadows.medium.shadowColor,
      elevation: shadows.medium.elevation,
    },
    noGymSelectedText: {
      color: colors.textPrimary,
    },
    noRoutesFoundText: {
      color: colors.textSecondary,
      marginTop: spacing.md,
    },
  });
};

const HomeScreen = () => {
  const { colors, sizes, shadows, spacing } = useTheme();
  const router = useRouter();
  const navigation = useNavigation();
  const { shouldReload } = useLocalSearchParams();

  const { gymData, setGymData, setGymField, clearGymData, isLoading } = useGymStore();
  const { routes, childLocations, breadcrumb, loading, refetch } = useRoutesData<Route, Location, BreadcrumbItem>(gymData.gymId ? gymData.gymId : null, gymData.locationId);

  const styles = getStyles(colors, sizes, shadows, spacing);

  useFocusEffect(() => {
    if (shouldReload) {
      refetch();
      router.setParams({ shouldReload: 0 });
    }
  });

  useEffect(() => {
    if (gymData.gymName) {
      navigation.setOptions({ headerTitle: gymData.gymName ? gymData.gymName : "No Gym Selected" });
    }
  }, [gymData.gymName, navigation]);

  if (!gymData.gymName) {
    return (
      <View style={styles.container}>
        <Text style={styles.noGymSelectedText}>No gym selected. Please select a gym.</Text>
      </View>
    );
  }

  const handleRoutePress = (route: Route) => {
    router.push('/routes/routeDetail');
    router.setParams({ route: encodeURIComponent(JSON.stringify(route)) });
  };

  const handleAddRoute = () => {
    router.push('/routes/createRoute');
    router.setParams({ locationId: gymData.locationId });
  };

  return (
    <View style={styles.container}>
      {/* Breadcrumb */}
      <ScrollView horizontal style={styles.breadcrumbContainer}>
        <TouchableOpacity onPress={() => setGymField({ locationId: '' })}>
          <Text style={styles.breadcrumbItem}>Home</Text>
        </TouchableOpacity>
        {breadcrumb.map((loc, idx) => (
          <View key={loc.id} style={styles.breadcrumbGroup}>
            <Text style={styles.breadcrumbSeparator}>{'>'}</Text>
            <TouchableOpacity onPress={() => setGymField({ locationId: loc.id })}>
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
              onPress={() => setGymField({ locationId: '' })}
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
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.routeCard}
              onPress={() => handleRoutePress(item)}
            >
              <RouteImage imageURI={item.imageUrl} dataURL={item.annotationsUrl} style={styles.routeImage} />
              <View style={styles.routeInfo}>
                <Text style={styles.routeName}>{item.name || 'No Name'}</Text>
                <Text style={styles.routeDescription}>
                  {item.description || 'No Description'}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      ) : (
        <Text style={styles.noRoutesFoundText}>No routes found</Text>
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
