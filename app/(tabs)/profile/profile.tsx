import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from 'react-native';
import { useRouter, useLocalSearchParams, useFocusEffect } from 'expo-router';
import { useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { useTheme } from '@/constants/theme';
import { useUserInfoStore } from '@/storage/userInfoStore';

const getStyles = (colors: any, sizes: any, spacing: any, font: any) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.backgroundPrimary,
    },
    
    scrollContainer: {
      flexGrow: 1,
      paddingHorizontal: spacing.lg,
      paddingBottom: spacing.xl,
    },

    profileSection: {
      alignItems: 'center',
      paddingTop: spacing.xl,
      paddingBottom: spacing.lg,
    },

    profileImageContainer: {
      shadowColor: colors.shadow || '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 8,
      marginBottom: spacing.lg,
    },

    profileImage: {
      width: 120,
      height: 120,
      borderRadius: 60,
      borderWidth: 3,
      borderColor: colors.border || colors.backgroundSecondary,
    },

    profileName: {
      fontSize: font.h1 || 28,
      fontWeight: '700',
      color: colors.textPrimary,
      marginBottom: spacing.xs,
      letterSpacing: 0.5,
    },

    bioText: {
      fontSize: font.body || 16,
      color: colors.textSecondary,
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: spacing.sm,
      paddingHorizontal: spacing.md,
    },

    statsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: spacing.sm,
    },

    friendsCount: {
      fontSize: font.h4 || 16,
      fontWeight: '600',
      color: colors.primary,
    },

    friendsLabel: {
      fontSize: font.caption || 14,
      color: colors.textSecondary,
      marginLeft: spacing.xs,
    },

    editButton: {
      backgroundColor: colors.primary,
      borderRadius: sizes.borderRadius || 12,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      marginTop: spacing.lg,
      shadowColor: colors.primary,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },

    editButtonText: {
      fontSize: font.body || 16,
      fontWeight: '600',
      color: colors.textPrimary,
      textAlign: 'center',
    },

    sectionContainer: {
      marginTop: spacing.xl,
      marginBottom: spacing.lg,
    },

    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.md,
    },

    sectionTitle: {
      fontSize: font.h3 || 20,
      fontWeight: '700',
      color: colors.textPrimary,
    },

    controlsContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.lg,
    },

    sortButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.backgroundSecondary,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: sizes.borderRadius || 12,
      flex: 0.45,
    },

    sortButtonText: {
      fontSize: font.body || 16,
      color: colors.textPrimary,
      marginLeft: spacing.xs,
      fontWeight: '500',
    },

    findClimbersButton: {
      backgroundColor: colors.accent || colors.primary,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      borderRadius: sizes.borderRadius || 12,
      flex: 0.45,
      shadowColor: colors.accent || colors.primary,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },

    findClimbersButtonText: {
      fontSize: font.body || 16,
      textAlign: 'center',
      fontWeight: '600',
      color: colors.textOnAccent || colors.textPrimary,
    },

    createListButton: {
      backgroundColor: colors.primary,
      borderRadius: sizes.borderRadius || 12,
      paddingVertical: spacing.md,
      marginBottom: spacing.xl,
      shadowColor: colors.primary,
      shadowOffset: {
        width: 0,
        height: 3,
      },
      shadowOpacity: 0.25,
      shadowRadius: 6,
      elevation: 5,
    },

    createListButtonText: {
      fontSize: font.h4 || 18,
      textAlign: 'center',
      fontWeight: '600',
      color: colors.textPrimary,
    },

    gridContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      gap: spacing.md,
    },

    gridItem: {
      width: '48%',
      aspectRatio: 1,
      borderRadius: sizes.borderRadius || 16,
      padding: spacing.md,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },

    climbsSentButton: {
      backgroundColor: colors.success || '#10B981',
    },

    favoritesButton: {
      backgroundColor: colors.warning || '#F59E0B',
    },

    routesCreatedButton: {
      backgroundColor: colors.info || '#3B82F6',
    },

    routesSavedButton: {
      backgroundColor: colors.secondary || '#8B5CF6',
    },

    gridItemText: {
      fontSize: font.body || 16,
      textAlign: 'center',
      fontWeight: '600',
      color: '#FFFFFF',
      marginTop: spacing.xs,
    },

    gridItemNumber: {
      fontSize: font.h2 || 24,
      fontWeight: '700',
      color: '#FFFFFF',
      marginBottom: spacing.xs,
    },

    divider: {
      height: 1,
      backgroundColor: colors.border || colors.backgroundSecondary,
      marginVertical: spacing.lg,
      opacity: 0.5,
    },
  });
};

export default function ProfileScreen() {
  const { colors, sizes, spacing, font } = useTheme();
  const router = useRouter();
  const { data: userInfo } = useUserInfoStore();
  
  const styles = getStyles(colors, sizes, spacing, font);
  
  return (
    <View style={styles.container}>
      <ScrollView 
        style={styles.container}
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Header Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <Image 
              source={
                userInfo.profilePictureKey 
                  ? { uri: userInfo.profilePictureKey }
                  : require('@/assets/images/logo-no-text.jpeg')
              } 
              style={styles.profileImage} 
            />
          </View>
          
          <Text style={styles.profileName}>{userInfo.firstName} {userInfo.lastName}</Text>
          
          {userInfo.bio ? (
            <Text style={styles.bioText}>{userInfo.bio}</Text>
          ) : null}
          
          <View style={styles.statsRow}>
            <Text style={styles.friendsCount}>100</Text>
            <Text style={styles.friendsLabel}>friends</Text>
          </View>
          
          <TouchableOpacity 
            style={styles.editButton} 
            // onPress={handleEditProfile}
          >
            <Text style={styles.editButtonText}>✏️ Edit Profile</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.divider} />

        {/* Actions Section */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
          </View>
          
          <View style={styles.controlsContainer}>
            <TouchableOpacity style={styles.sortButton}>
              <Text>📊</Text>
              <Text style={styles.sortButtonText}>Sort Lists</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.findClimbersButton}>
              <Text style={styles.findClimbersButtonText}>🔍 Find Climbers</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.createListButton}>
            <Text style={styles.createListButtonText}>➕ Create New List</Text>
          </TouchableOpacity>
        </View>

        {/* Statistics Grid */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>My Climbing Stats</Text>
          </View>
          
          <View style={styles.gridContainer}>
            <TouchableOpacity style={[styles.gridItem, styles.climbsSentButton]}>
              <Text style={styles.gridItemNumber}>42</Text>
              <Text style={styles.gridItemText}>Climbs Sent</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.gridItem, styles.favoritesButton]}>
              <Text style={styles.gridItemNumber}>18</Text>
              <Text style={styles.gridItemText}>Favorites</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.gridItem, styles.routesCreatedButton]}>
              <Text style={styles.gridItemNumber}>7</Text>
              <Text style={styles.gridItemText}>Routes Created</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.gridItem, styles.routesSavedButton]}>
              <Text style={styles.gridItemNumber}>23</Text>
              <Text style={styles.gridItemText}>Routes Saved</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}