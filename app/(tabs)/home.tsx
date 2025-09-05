import React from 'react';
import { View, Text, FlatList, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useFocusEffect, useNavigation, useRouter, useLocalSearchParams } from 'expo-router';
import { AntDesign } from '@expo/vector-icons';
import RouteImage from '@/components/RouteImage/RouteImage';

import { useGymStore } from '@/store/gymStore';
import { useRoutesData } from '@/hooks/useRoutesData';
import { useTheme } from '@/constants/theme';

const HomeScreen = () => {
  const { colors, sizes, shadows } = useTheme();
  const router = useRouter();
  const navigation = useNavigation();
  const { shouldReload } = useLocalSearchParams();

  const { store: gymData } = useGymStore();
  const { routes, childLocations, breadcrumb, loading, refetch } = useRoutesData(gymData.gymName ? gymData.gymName : null, gymData.locationId);

  useFocusEffect(() => {
    if (shouldReload) {
      refetch();
      router.setParams({ shouldReload: 0 });
    }
  });

  if (!gymData.gymName) {
    return (
      <View style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
        <Text style={{ color: colors.textPrimary }}>No gym selected. Please select a gym.</Text>
      </View>
    );
  }

  const handleRoutePress = (route: any) => {
    router.push('/routes/routeDetail');
    router.setParams({ route: encodeURIComponent(JSON.stringify(route)) });
  };

  const handleAddRoute = () => {
    router.push('/routes/createRoute');
    router.setParams({ gymData.locationId });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.backgroundPrimary }]}>
      {/* Breadcrumb */}
      <ScrollView horizontal style={styles.breadcrumbContainer}>
        <TouchableOpacity onPress={() => gymData.setField('locationId', '')}>
          <Text style={[styles.breadcrumbItem, { color: colors.textPrimary }]}>Home</Text>
        </TouchableOpacity>
        {breadcrumb.map((loc, idx) => (
          <View key={loc.id} style={styles.breadcrumbGroup}>
            <Text style={[styles.breadcrumbSeparator, { color: colors.textSecondary }]}>{'>'}</Text>
            <TouchableOpacity onPress={() => gymData.setField('locationId', loc.id)}>
              <Text style={[styles.breadcrumbItem, { color: colors.textPrimary }]}>{loc.name}</Text>
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
              style={[styles.childLocationCard, { backgroundColor: colors.primary }]}
              onPress={() => gymData.setField('locationId', item.id)}
            >
              <Text style={[styles.childLocationName, { color: colors.textPrimary }]}>{item.name}</Text>
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
              style={[
                styles.routeCard,
                {
                  backgroundColor: colors.backgroundSecondary,
                  borderColor: colors.border,
                  shadowColor: shadows.medium.shadowColor,
                  elevation: shadows.medium.elevation,
                },
              ]}
              onPress={() => handleRoutePress(item)}
            >
              <RouteImage imageURI={item.imageUrl} dataURL={item.annotationsUrl} style={styles.routeImage} />
              <View style={styles.routeInfo}>
                <Text style={[styles.routeName, { color: colors.textPrimary }]}>{item.name || 'No Name'}</Text>
                <Text style={[styles.routeDescription, { color: colors.textSecondary }]}>
                  {item.description || 'No Description'}
                </Text>
              </View>
            </TouchableOpacity>
          )}
        />
      ) : (
        <Text style={{ color: colors.textSecondary, marginTop: 16 }}>No routes found</Text>
      )}

      <TouchableOpacity
        style={[
          styles.addButton,
          {
            backgroundColor: colors.primary,
            shadowColor: shadows.medium.shadowColor,
            elevation: shadows.medium.elevation,
          },
        ]}
        onPress={handleAddRoute}
      >
        <AntDesign name="plus" size={32} color={colors.textPrimary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  breadcrumbContainer: { flexDirection: 'row', marginVertical: 10 },
  breadcrumbGroup: { flexDirection: 'row', alignItems: 'center' },
  breadcrumbItem: { fontSize: 16, marginHorizontal: 5 },
  breadcrumbSeparator: { fontSize: 16, marginHorizontal: 2 },
  childLocationCard: { padding: 10, marginRight: 10, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  childLocationName: { fontSize: 16 },
  routeCard: { flexDirection: 'row', marginBottom: 12, padding: 12, borderRadius: 15, borderWidth: 1 },
  routeImage: { width: 80, height: 80, borderRadius: 8, marginRight: 12 },
  routeInfo: { flex: 1 },
  routeName: { fontSize: 17, fontWeight: '500' },
  routeDescription: { fontSize: 14, marginTop: 4 },
  addButton: { position: 'absolute', right: 20, bottom: 30, width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center' },
});

export default HomeScreen;
