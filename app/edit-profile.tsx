import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';
import { COLORS, globalStyles } from '@/constants/theme';

export default function EditProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const scrollViewRef = useRef<ScrollView>(null);
  const firstNameRef = useRef<TextInput>(null);
  const lastNameRef = useRef<TextInput>(null);
  const usernameRef = useRef<TextInput>(null);
  const bioRef = useRef<TextInput>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [profileImage, setProfileImage] = useState(require('../assets/images/logo-no-text.jpeg'));

  useEffect(() => {
    // Load saved data only once when component mounts
    loadSavedData();
  }, []);

  useEffect(() => {
    // Pre-populate form fields with current data from profile page (only if no saved data)
    if (params.currentUsername && !username) {
      setUsername(Array.isArray(params.currentUsername) ? params.currentUsername[0] : params.currentUsername);
    }
    if (params.currentBio && !bio) {
      setBio(Array.isArray(params.currentBio) ? params.currentBio[0] : params.currentBio);
    }
  }, []); // Only run once on mount

  const loadSavedData = async () => {
    try {
      const savedFirstName = await SecureStore.getItemAsync('firstName');
      const savedLastName = await SecureStore.getItemAsync('lastName');
      const savedUsername = await SecureStore.getItemAsync('username');
      const savedBio = await SecureStore.getItemAsync('bio');
      const savedProfileImageUri = await SecureStore.getItemAsync('profileImageUri');
      
      if (savedFirstName) {
        setFirstName(savedFirstName);
      }
      if (savedLastName) {
        setLastName(savedLastName);
      }
      if (savedUsername) {
        setUsername(savedUsername);
      }
      if (savedBio) {
        setBio(savedBio);
      }
      if (savedProfileImageUri) {
        setProfileImage({ uri: savedProfileImageUri });
      }
    } catch (error) {
      console.log('Error loading saved data:', error);
    }
  };

  const saveDataToStorage = async (firstName: string, lastName: string, username: string, bio: string, profileImageUri: string) => {
    try {
      if (firstName.trim()) {
        await SecureStore.setItemAsync('firstName', firstName.trim());
      }
      if (lastName.trim()) {
        await SecureStore.setItemAsync('lastName', lastName.trim());
      }
      if (username.trim()) {
        await SecureStore.setItemAsync('username', username.trim());
      }
      if (bio.trim()) {
        await SecureStore.setItemAsync('bio', bio.trim());
      }
      if (profileImageUri) {
        await SecureStore.setItemAsync('profileImageUri', profileImageUri);
      }
    } catch (error) {
      console.log('Error saving data:', error);
    }
  };

  const scrollToInput = (inputY: number) => {
    setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        y: inputY, // Scroll to the input position
        animated: true,
      });
    }, 100);
  };

  const pickImage = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant camera roll permissions to upload images.');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        
        // Check file size (5MB = 5 * 1024 * 1024 bytes)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        if (asset.fileSize && asset.fileSize > maxSize) {
          Alert.alert('File Too Large', 'Please select an image smaller than 5MB.');
          return;
        }


        // Update profile image
        setProfileImage({ uri: asset.uri });
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  const saveChanges = async () => {
    try {
      // Prepare data to save
      const profileData = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        username: username.trim(),
        bio: bio.trim(),
        profileImage: profileImage,
        timestamp: new Date().toISOString(),
      };

      // Validate required fields
      if (!profileData.firstName || !profileData.lastName || !profileData.username) {
        Alert.alert('Missing Information', 'Please fill in all required fields (First Name, Last Name, Username).');
        return;
      }

      // Validate username format
      const usernameRegex = /^[a-zA-Z0-9_]+$/;
      if (!usernameRegex.test(profileData.username)) {
        Alert.alert('Invalid Username', 'Username can only contain letters, numbers, and underscores.');
        return;
      }

      // Validate bio length
      if (profileData.bio.length > 500) {
        Alert.alert('Bio Too Long', 'Bio must be 500 characters or less.');
        return;
      }

      // Save all form data to persistent storage
      const imageUri = typeof profileData.profileImage === 'object' && profileData.profileImage.uri 
        ? profileData.profileImage.uri 
        : '';
      await saveDataToStorage(profileData.firstName, profileData.lastName, profileData.username, profileData.bio, imageUri);
      
      // Here you would typically send the data to your backend
      console.log('Saving profile data:', profileData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      Alert.alert('Success', 'Profile updated successfully!', [
        {
          text: 'OK',
          onPress: () => {
            // Navigate back with swipe right animation
            router.back();
          },
        },
      ]);
      
    } catch (error) {
      Alert.alert('Error', 'Failed to save changes. Please try again.');
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.keyboardAvoidingView}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
    >
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Text style={styles.chevron}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity style={styles.saveButton} onPress={saveChanges}>
          <Text style={styles.saveIcon}>💾</Text>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </View>
      
      {/* Profile Picture Section */}
      <View style={styles.profilePictureCard}>
        <Text style={styles.profilePictureText}>Profile picture</Text>
        <Text style={styles.profilePictureDescription}>Upload a new profile picture or keep your current one</Text>
        <TouchableOpacity style={styles.profileImage} onPress={pickImage}>
          <Image source={profileImage} 
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            position: 'absolute',
            top: 15,
            }}
          />
          <View style={styles.editButtonOverlay}>
            <Image 
              source={require('../assets/images/edit button.png')} 
              style={styles.editButtonIcon}
            />
          </View>
        </TouchableOpacity>
        <Text style={styles.fileTypeText}>Max size 5MB.</Text>
      </View>

      {/* Climber Information Section */}
      <View style={styles.climberInfoCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Climber Information</Text>
          <Text style={styles.cardSubtitle}>Your climbing profile details</Text>
        </View>
        
        <View style={styles.formContainer}>
          <View style={styles.inputRow}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>First Name</Text>
              <TextInput
                ref={firstNameRef}
                style={styles.textInput}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="first name"
                placeholderTextColor="rgba(0, 0, 0, 0.4)"
              />
            </View>
            
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Last Name</Text>
              <TextInput
                ref={lastNameRef}
                style={styles.textInput}
                value={lastName}
                onChangeText={setLastName}
                placeholder="last name"
                placeholderTextColor="rgba(0, 0, 0, 0.4)"
              />
            </View>
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Username</Text>
            <TextInput
              ref={usernameRef}
              style={styles.textInput}
              value={username}
              onChangeText={setUsername}
              placeholder="username"
              placeholderTextColor="rgba(0, 0, 0, 0.4)"
            />
          </View>
          
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Bio</Text>
            <TextInput
              ref={bioRef}
              style={styles.bioInput}
              value={bio}
              onChangeText={setBio}
              placeholder="about me"
              placeholderTextColor="rgba(0, 0, 0, 0.4)"
              multiline
              numberOfLines={4}
            />
            <Text style={styles.characterCount}>{bio.length}/500 characters</Text>
          </View>
        </View>
      </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    backgroundColor: COLORS.backgroundPrimary,
  },
  scrollContent: {
    flexGrow: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 20,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
  },
  backButton: {
    width: 40,
    height: 40,
    position: 'absolute',
    left: 20,
  },
  chevron: {
    fontSize: 30,
    color: COLORS.textPrimary,
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 40, // Match the button height for vertical centering
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'center',
    flex: 1,
    top: -13,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderRadius: 8,
    position: 'absolute',
    right: 27,
    top: 402,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 1000,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  saveIcon: {
    fontSize: 10,
    marginRight: 6,
  },
  saveButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  profilePictureText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'black',
    textAlign: 'center',
    marginBottom: 8,
  },
  profilePictureDescription: {
    fontSize: 14,
    color: '#636e72',
    textAlign: 'center',
    marginBottom: 20,
  },
  fileTypeText: {
    fontSize: 12,
    color: '#636e72',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 0,
  },
  profilePictureCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 90,
    padding: 20,
    paddingBottom: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  profileImage: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    borderRadius: 60,
    position: 'relative',
  },
  editButtonOverlay: {
    position: 'absolute',
    bottom: -10,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  editButtonIcon: {
    width: 28,
    height: 28,
    borderRadius: 14,
    resizeMode: 'contain',
  },

  climberInfoCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginHorizontal: 20,
    marginTop: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },
  cardHeader: {
    marginBottom: 20,
    position: 'relative',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: "black",
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#636e72',
    marginBottom: 8,
  },
  formContainer: {
    gap: 16,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 12,
  },
  inputContainer: {
    flex: 1,
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: "black",
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#f1ede8',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "black",
    borderWidth: 1,
    borderColor: 'transparent',
  },
  bioInput: {
    backgroundColor: '#f1ede8',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    color: "black",
    borderWidth: 1,
    borderColor: 'transparent',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  characterCount: {
    fontSize: 12,
    color: 'black',
    marginTop: 4,
    textAlign: 'right',
  },
});
