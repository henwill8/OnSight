import React, { useEffect, useState, useLayoutEffect } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, useNavigation, useRouter } from 'expo-router';
import { COLORS, SIZES, SHADOWS, globalStyles } from '@/constants/theme';
import { calculateOptimalImageDimensions } from '@/utils/imageUtils';
import RouteImage from "@/components/RouteImage/RouteImage";
import { Route } from '@/app/(tabs)/home';

const RouteDetail = () => {
  const navigation = useNavigation();

  const [routeDetails, setRouteDetails] = useState<Route | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const { route: routeString } = useLocalSearchParams();
    
  useLayoutEffect(() => {
    navigation.setOptions({
      title: "View Route",
      headerStyle: { backgroundColor: COLORS.backgroundSecondary },
      headerTintColor: "white"
    });
  }, [navigation]);

  useEffect(() => {
    if (routeString) {
      // Decode the route string and parse it as a JSON object
      const route = JSON.parse(decodeURIComponent(routeString as string)) as Route;
      setRouteDetails(route);
      setLoading(false);
    }
  }, [routeString]);

  // Get image size
  const imageUriString = routeDetails?.imageUrl;

  useEffect(() => {
    if (imageUriString) {
      Image.getSize(imageUriString, (width, height) => {
        setImageDimensions({ width, height });
      });
    }
  }, [imageUriString]);

  // Scale image while keeping aspect ratio using utility
  const scaledImageDimensions = imageDimensions
    ? (() => {
        const { scaleX, scaleY } = calculateOptimalImageDimensions({
          imageWidth: imageDimensions.width,
          imageHeight: imageDimensions.height,
          insets: { top: 0, bottom: 0, left: 0, right: 0 },
          extraHeight: -0.2 * imageDimensions.height // mimic 80% screen height
        });
        return {
          width: imageDimensions.width * scaleX,
          height: imageDimensions.height * scaleY,
        };
      })()
    : null;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#06d6a0" />
      </View>
    );
  }

  if (!routeDetails) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>Route details not found</Text>
      </View>
    );
  }

  return (
    <View style={globalStyles.container}>
      <View style={styles.imageContainer}>
        {/* Image */}
        {scaledImageDimensions && (
          <RouteImage
            imageURI={routeDetails.imageUrl}
            dataURL={routeDetails.annotationsUrl}
            style={{
              width: scaledImageDimensions.width,
              height: scaledImageDimensions.height,
              borderRadius: SIZES.borderRadius,
            }}
          />
        )}
      </View>

      {/* Text overlay fixed at the bottom */}
      <View style={styles.routeCard}>
        <Text style={styles.name}>{routeDetails.name || 'No Name'}</Text>
        <Text style={styles.description}>{routeDetails.description || 'No Description'}</Text>
        <Text style={styles.difficulty}>Difficulty: {routeDetails.difficulty}</Text>
      </View>
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
  container: {
    flex: 1,
    position: 'relative', // Allow absolute positioning of text overlay
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  textOverlay: {
    position: 'absolute', // Fix the text overlay at the bottom
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: 'rgb(255, 255, 255)', // White background for text section
    borderRadius: 10,
    marginHorizontal: 10, // Ensure it takes up full width with margins
  },
  name: {
    fontSize: 24,
    fontWeight: '600',
    color: COLORS.textPrimary, // Text color
    marginBottom: 5,
  },
  description: {
    fontSize: 16,
    color: COLORS.textPrimary, // Text color
    marginBottom: 5,
  },
  difficulty: {
    fontSize: 18,
    color: '#06d6a0', // Green color for difficulty
  },
  routeCard: {
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
});

export default RouteDetail;
