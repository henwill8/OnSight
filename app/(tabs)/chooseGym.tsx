import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TextInput, Alert, TouchableOpacity, StyleSheet } from 'react-native';
import { useGymStore } from '@/storage/gymStore';
import { useTheme } from '@/constants/theme';
import { useChooseGymLogic } from '@/hooks/gyms/useChooseGymLogic';
import { Gym } from '@/types';
import LoadingModal from '@/components/ui/LoadingModal';

const getStyles = (colors: any, sizes: any, spacing: any, font: any) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      padding: spacing.md,
      backgroundColor: colors.backgroundPrimary,
    },
    textInput: {
      borderWidth: 1,
      marginBottom: spacing.md,
      padding: spacing.sm,
      backgroundColor: colors.backgroundSecondary,
      color: colors.textPrimary,
      borderRadius: sizes.borderRadius,
      fontSize: font.body,
    },
    button: {
      padding: spacing.sm,
      alignItems: 'center',
      backgroundColor: colors.primary,
      borderRadius: sizes.borderRadius,
    },
    buttonText: {
      fontSize: font.body,
      fontWeight: '600',
      color: colors.textPrimary,
    },
    currentGymText: {
      fontSize: font.h3,
      fontWeight: '500',
      textAlign: 'center',
      marginVertical: spacing.xl,
      color: colors.textPrimary,
    },
    availableGymsTitle: {
      fontSize: font.h4,
      marginBottom: spacing.sm,
      color: colors.textPrimary,
    },
    gymItem: {
      padding: spacing.xs,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    gymText: {
      fontSize: font.body,
      color: colors.textPrimary,
    },
  });
};

const ChooseGym: React.FC = () => {
  const { colors, sizes, spacing, font } = useTheme();
  const { data: gymData } = useGymStore();

  const {
    gyms,
    newGymName,
    setNewGymName,
    newGymLocation,
    setNewGymLocation,
    loading,
    handleCreateGym,
    handleSelectGym,
  } = useChooseGymLogic();

  const styles = getStyles(colors, sizes, spacing, font);

  const renderGymItem = ({ item }: { item: Gym }) => {
    return (
      <TouchableOpacity onPress={() => handleSelectGym(item)}>
        <View style={styles.gymItem}>
          <Text style={styles.gymText}>{item.name || 'No name'}</Text>
          <Text style={{ color: colors.textSecondary, fontSize: font.caption }}>{item.location || 'No location'}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* New Gym Form */}
      <TextInput
        value={newGymName}
        onChangeText={setNewGymName}
        placeholder="Gym Name"
        placeholderTextColor={colors.textSecondary}
        style={styles.textInput}
      />
      <TextInput
        value={newGymLocation}
        onChangeText={setNewGymLocation}
        placeholder="Gym Location"
        placeholderTextColor={colors.textSecondary}
        style={styles.textInput}
      />
      <TouchableOpacity style={styles.button} onPress={handleCreateGym}>
        <Text style={styles.buttonText}>Create Gym</Text>
      </TouchableOpacity>

      {/* Current Gym */}
      <Text style={styles.currentGymText}>
        {gymData.name ? `Current Gym: ${gymData.name}` : 'No gym selected.'}
      </Text>

      {/* Available Gyms */}
      <Text style={styles.availableGymsTitle}>Available Gyms</Text>
      <FlatList
        data={gyms}
        renderItem={renderGymItem}
        keyExtractor={(item) => item.id}
      />

      {/* Loading */}
      <LoadingModal visible={loading} message="" />
    </View>
  );
};

export default ChooseGym;
