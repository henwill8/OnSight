import { View, Text, StyleSheet, Touchable, TouchableOpacity, Image } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { COLORS, SHADOWS, SIZES, globalStyles } from '@/constants/theme';



export default function ProfileScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [profileName, setProfileName] = useState('Kameron Springer');
  const [bioText, setBioText] = useState('');
  const [profileImage, setProfileImage] = useState(require('../../assets/images/logo-no-text.jpeg'));
  
  useEffect(() => {
    // Load bio data from storage
    loadBioFromStorage();
    
    // Update profile name if params are passed from edit profile (only once on mount)
    if (params.username) {
      setProfileName(Array.isArray(params.username) ? params.username[0] : params.username);
    }
    if (params.bio) {
      setBioText(Array.isArray(params.bio) ? params.bio[0] : params.bio);
    }
  }, []); // Only run once on mount

  const loadBioFromStorage = async () => {
    try {
      const savedBio = await SecureStore.getItemAsync('bio');
      const savedProfileImageUri = await SecureStore.getItemAsync('profileImageUri');
      
      if (savedBio) {
        setBioText(savedBio);
      }
      if (savedProfileImageUri) {
        setProfileImage({ uri: savedProfileImageUri });
      }
    } catch (error) {
      console.log('Error loading bio from storage:', error);
    }
  };

  // Refresh bio data whenever the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      loadBioFromStorage();
    }, [])
  );
  
  return (
    <View style={globalStyles.container}>
      <Image source={profileImage} 
      style={styles.profileImage} />
      <Text style={[styles.profileName]}>{profileName}</Text>
      <Text style={styles.gymText}>{bioText}</Text>
      <Text style={styles.friendText}>100 friends</Text>
        <TouchableOpacity style={styles.editButton} onPress={() => router.push({
          pathname: '/edit-profile',
          params: {
            currentUsername: profileName,
            currentBio: bioText
          }
        })}>
          <Text style={styles.editButtonText}>✏️ Edit Profile</Text>
        </TouchableOpacity>
      <TouchableOpacity style={styles.sortByButton}>
        <Text style={styles.sortByButtonText}>↑↓ Alphabetical</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.findClimbersButton}>
        <Text style={styles.findClimbersButtonText}>Find Climbers</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.createListButton}>
        <Text style={styles.createListButtonText}>Create New List</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.squareButton}>
        <Text style={styles.squareButtonText}>Climbs Sent</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.squareButton2}>
        <Text style={styles.squareButtonText}>Favorites</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.squareButton3}>
        <Text style={styles.squareButtonText}>Routes Created</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.squareButton4}>
        <Text style={styles.squareButtonText}>Routes Saved</Text>
      </TouchableOpacity>
      
      
    </View>
  );
}

const styles = StyleSheet.create({
 
  profileImage: {
    width: 120,
    height: 120,
    position: 'absolute',
    top: 5,
    left: '50%',
    marginLeft: -170,
    borderRadius: 60,
  },

  profileName: {
    position: 'absolute',
    top: 40,
    left: '50%',
    marginLeft: -50,
    width: 250,
    textAlign: 'center',
    color: "white",
    fontWeight: 'bold',
    fontSize: 24
  },

  gymText: {
    position: 'absolute',
    top: 70,
    left: '50%',
    marginLeft: -45,
    width: 240,
    fontSize: 19,
    color: COLORS.textPrimary,
    textAlign: 'center'
  },

  friendText: {
    position: 'absolute',
    top: 150,
    left: '50%',
    marginLeft: -145,
    color: COLORS.textPrimary
  },

  editButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 24,
    width: 130,
    height: 35,
    position: 'absolute',
    top: 100,
    left: '55%',
    justifyContent: 'center',
  },

  editButtonText: {
    fontSize: 15,
    textAlign: 'center',
    fontWeight: 'bold',
    color: COLORS.textPrimary
  },

  sortByButton: {
    position: 'absolute',
    top: 240,
    left: '50%',
    marginLeft: -132,
    justifyContent: 'center',
    alignSelf: 'center',
  },

  sortByButtonText: {
    fontSize: 17,
    color: COLORS.textPrimary,
    textAlign: 'left'
  },

  findClimbersButton: {
    backgroundColor: 'black',
    borderRadius: 24,
    width: 110,
    height: 35,
    position: 'absolute',
    top: 230,
    left: '50%',
    marginLeft: 70,
    justifyContent: 'center',
  },

  findClimbersButtonText: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: 'bold',
    color: 'red'
  },

  createListButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 24,
    width: 345,
    height: 47,
    position: 'absolute',
    top: 270,
    left: '50%',
    marginLeft: -150,
    justifyContent: 'center',
  },

  createListButtonText: {
    fontSize: 19,
    textAlign: 'center',
    fontWeight: 'bold',
    color: COLORS.textPrimary
  },

  squareButton: {
    backgroundColor: 'forestgreen',
    borderRadius: 10,
    width: 150,
    height: 150,
    position: 'absolute',
    top: 330,
    left: '50%',
    marginLeft: -150,
    justifyContent: 'center',
  },

  squareButtonText: {
    fontSize: 19,
    textAlign: 'center',
    fontWeight: 'bold',
    color: 'black'
  },

  squareButton2: {
    backgroundColor: 'gold',
    borderRadius: 10,
    width: 150,
    height: 150,
    position: 'absolute',
    top: 330,
    left: '50%',
    marginLeft: 40,
    justifyContent: 'center',
  },

  squareButton3: {
    backgroundColor: 'hotpink',
    borderRadius: 10,
    width: 150,
    height: 150,
    position: 'absolute',
    top: 500,
    left: '50%',
    marginLeft: -150,
    justifyContent: 'center',
  },

  squareButton4: {
    backgroundColor: 'magenta',
    borderRadius: 10,
    width: 150,
    height: 150,
    position: 'absolute',
    top: 500,
    left: '50%',
    marginLeft: 40,
    justifyContent: 'center',
  }
})
