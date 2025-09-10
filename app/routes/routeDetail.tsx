import React, { useEffect, useState, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { useTheme } from '@/constants/theme';
import RouteImage from "@/components/RouteImage/RouteImage";
import { useRouteDetailLogic } from '@/hooks/routes/useRouteDetailLogic';

const getStyles = (colors: any, sizes: any, shadows: any, global: any, font: any) => {
  return StyleSheet.create({
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.backgroundPrimary
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colors.backgroundPrimary
    },
    emptyText: {
      fontSize: font.h5,
    },
    container: {
      flex: 1,
      position: 'relative',
      backgroundColor: colors.backgroundPrimary
    },
    imageContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 20,
    },
    textOverlay: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: 20,
      backgroundColor: colors.backgroundPrimary,
      borderRadius: sizes.borderRadius,
      marginHorizontal: 10,
    },
    name: {
      fontSize: font.h3,
      fontWeight: '600',
      marginBottom: 5,
    },
    description: {
      fontSize: font.body,
      marginBottom: 5,
    },
    difficulty: {
      fontSize: font.h5,
    },
    routeCard: {
      marginBottom: 12,
      padding: 12,
      borderRadius: sizes.borderRadius,
      borderWidth: 1,
    },
  });
};

const RouteDetail = () => {
  const { colors, sizes, shadows, global, font } = useTheme();
  const {
    navigation,
    routeDetails,
    loading,
    scaledImageDimensions,
  } = useRouteDetailLogic();

  useLayoutEffect(() => {
    navigation.setOptions({
      title: "View Route",
      headerStyle: { backgroundColor: colors.backgroundSecondary },
      headerTintColor: "white"
    });
  }, [navigation, colors.backgroundSecondary]);

  const styles = getStyles(colors, sizes, shadows, global, font);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!routeDetails) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>Route details not found</Text>
      </View>
    );
  }

  return (
    <View style={global.container}>
      <View style={styles.imageContainer}>
        {/* Image */}
        {scaledImageDimensions && (
          <RouteImage
            style={{
              width: scaledImageDimensions.width,
              height: scaledImageDimensions.height,
              borderRadius: sizes.borderRadius,
            }}
          />
        )}
      </View>

      {/* Text overlay fixed at the bottom */}
      <View style={[styles.routeCard, { backgroundColor: colors.backgroundSecondary, borderColor: colors.border, shadowColor: shadows.medium.shadowColor, elevation: shadows.medium.elevation }]}>
        <Text style={[styles.name, { color: colors.textPrimary }]}>{routeDetails.name || 'No Name'}</Text>
        <Text style={[styles.description, { color: colors.textPrimary }]}>{routeDetails.description || 'No Description'}</Text>
        <Text style={[styles.difficulty, { color: colors.primary }]}>Difficulty: {routeDetails.difficulty}</Text>
      </View>
    </View>
  );
};

export default RouteDetail;
