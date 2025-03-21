import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ReactNativeZoomableView } from '@openspacelabs/react-native-zoomable-view';

interface Route {
  id: string;
  name: string;
  description: string;
  difficulty: number;
  image_url: string;
}

const RouteDetail = () => {
  const [routeDetails, setRouteDetails] = useState<Route | null>(null);
  const [loading, setLoading] = useState(true);
  const [imageDimensions, setImageDimensions] = useState<{ width: number; height: number } | null>(null);
  const { route: routeString } = useLocalSearchParams();

  useEffect(() => {
    if (routeString) {
      // Decode the route string and parse it as a JSON object
      const route = JSON.parse(decodeURIComponent(routeString as string)) as Route;
      setRouteDetails(route);
      setLoading(false);
    }
  }, [routeString]);

  // Get image size
  const imageUriString = routeDetails?.image_url;
  const screenWidth = Dimensions.get('window').width;
  const screenHeight = Dimensions.get('window').height;

  useEffect(() => {
    if (imageUriString) {
      Image.getSize(imageUriString, (width, height) => {
        setImageDimensions({ width, height });
      });
    }
  }, [imageUriString]);

  // Scale image while keeping aspect ratio
  const scaledImageDimensions = imageDimensions
    ? (() => {
        const aspectRatio = imageDimensions.width / imageDimensions.height;
        let width = screenWidth;
        let height = screenWidth / aspectRatio;

        if (height > screenHeight * 0.8) {
          height = screenHeight * 0.8;
          width = height * aspectRatio;
        }

        return { width, height };
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
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        {/* Image */}
        {scaledImageDimensions && (
          <ReactNativeZoomableView
            maxZoom={10.0}
            minZoom={0.5}
            zoomStep={0.5}
            initialZoom={1.0}
            bindToBorders={true}
            style={{ width: scaledImageDimensions.width, height: scaledImageDimensions.height }}
          >
            <Image
              source={{ uri: routeDetails.image_url }}
              style={{
                width: scaledImageDimensions.width,
                height: scaledImageDimensions.height,
                borderRadius: 10,
              }}
            />
          </ReactNativeZoomableView>
        )}
      </View>

      {/* Text overlay fixed at the bottom */}
      <View style={styles.textOverlay}>
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
    color: 'black', // Text color
    marginBottom: 5,
  },
  description: {
    fontSize: 16,
    color: 'black', // Text color
    marginBottom: 5,
  },
  difficulty: {
    fontSize: 18,
    color: '#06d6a0', // Green color for difficulty
  },
});

export default RouteDetail;
