import React, { useCallback } from "react";
import { Text, View, Button, StyleSheet, Image } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";

const Home = () => {
  const router = useRouter();

  const handleImagePick = useCallback(async (useCamera: boolean) => {
		const permission = useCamera
			? await ImagePicker.requestCameraPermissionsAsync()
			: await ImagePicker.requestMediaLibraryPermissionsAsync();

		if (permission.status !== "granted") {
			alert("Permission is required!");
			return;
		}

		const pickerResult = useCamera
			? await ImagePicker.launchCameraAsync({ quality: 1 })
			: await ImagePicker.launchImageLibraryAsync({ quality: 1 });

		if (pickerResult.assets && pickerResult.assets.length > 0) {
			const uri = pickerResult.assets[0].uri;

			router.push({
				pathname: '/routeCreation',
				params: { imageUri: encodeURIComponent(uri) }, // I hate this but express encodes and decodes the uri and messes with it and it fails if I dont encode it an extra time myself
			});
		}
  }, [router]);

  return (
	<View style={styles.container}>
    <Text>Running as {__DEV__ ? 'Development' : 'Production'}</Text>
	  <View style={styles.buttonContainer}>
			<Button title="Pick an Image" onPress={() => handleImagePick(false)} />
			<View style={{ marginTop: 10 }} />
			<Button title="Take a Picture" onPress={() => handleImagePick(true)} />
	  </View>
	</View>
  );
};

const styles = StyleSheet.create({
  container: {
		flex: 1,
		alignItems: "center",
		justifyContent: "center",
  },
  buttonContainer: {
		position: "absolute",
		bottom: 20,
		width: "90%",
  }
});

export default Home;
