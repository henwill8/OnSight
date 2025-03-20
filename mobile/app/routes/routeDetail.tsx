import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, ActivityIndicator, ScrollView, TouchableOpacity, Dimensions } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import PanRotateZoomView from '@/components/ui/PanRotateZoomView'; // Custom zoom/pan component

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
  const { route: routeString } = useLocalSearchParams(); // Access query parameter using useSearchParams

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
    <ScrollView style={styles.container}>
      <View style={styles.imageContainer}>
        {/* Image */}
        {scaledImageDimensions && (
          <PanRotateZoomView>
            <Image
              source={{ uri: routeDetails.image_url }}
              style={{
                width: scaledImageDimensions.width,
                height: scaledImageDimensions.height,
                borderRadius: 10,
              }}
            />
          </PanRotateZoomView>
        )}
      </View>

      {/* Text overlay */}
      <View style={styles.textOverlay}>
        <Text style={styles.name}>{routeDetails.name || 'No Name'}</Text>
        <Text style={styles.description}>{routeDetails.description || 'No Description'}</Text>
        <Text style={styles.difficulty}>Difficulty: {routeDetails.difficulty}</Text>
      </View>
    </ScrollView>
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
    padding: 20,
  },
  closeButtonContainer: {
    position: 'absolute',
    top: 20,
    right: 20,
    zIndex: 10,
    backgroundColor: 'white', // White background for the close button
    borderRadius: 10, // Optional: rounded corners for a cleaner look
    padding: 5, // Padding to make the button clickable
  },
  closeButton: {
    zIndex: 10,
  },
  closeIcon: {
    width: 24,
    height: 24,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  textOverlay: {
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
