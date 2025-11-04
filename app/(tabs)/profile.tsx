// @ts-ignore
import { ThemedText } from '../../components/ThemedText';
// @ts-ignore
import React from 'react';
// @ts-ignore
import { View, ScrollView, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
// @ts-ignore
import { Colors } from '../../groza/app/constants/Colors';
// @ts-ignore
import { useColorScheme } from '../../groza/hooks/useColorScheme';
// @ts-ignore
import { BrandHeader } from '../../components/BrandHeader';

const { width } = Dimensions.get('window');

const mockUser = {
  name: 'Demo User',
  email: 'demo@groza.com',
  role: 'customer',
  orders: 12,
  favorites: 5,
  rating: 4.8,
};

export default function ProfileScreen() {
  const colorScheme = useColorScheme() === 'dark' ? 'dark' : 'light';

  return (
    <ScrollView style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}
      contentContainerStyle={{ paddingBottom: 32 }}>
      <BrandHeader />
      <View style={styles.profileBox}>
        <ThemedText type="subtitle" style={styles.profileName}>{mockUser.name}</ThemedText>
        <ThemedText style={styles.profileEmail}>{mockUser.email}</ThemedText>
        <ThemedText style={styles.profileRole}>{mockUser.role.toUpperCase()}</ThemedText>
      </View>
      <View style={styles.statsRow}>
        <View style={styles.statBox}>
          <ThemedText style={styles.statNumber}>{mockUser.orders}</ThemedText>
          <ThemedText style={styles.statLabel}>Orders</ThemedText>
        </View>
        <View style={styles.statBox}>
          <ThemedText style={styles.statNumber}>{mockUser.favorites}</ThemedText>
          <ThemedText style={styles.statLabel}>Favorites</ThemedText>
        </View>
        <View style={styles.statBox}>
          <ThemedText style={styles.statNumber}>{mockUser.rating}</ThemedText>
          <ThemedText style={styles.statLabel}>Rating</ThemedText>
        </View>
      </View>
      <TouchableOpacity style={styles.signOutButton} activeOpacity={0.85}>
        <ThemedText style={styles.signOutText}>Sign Out</ThemedText>
      </TouchableOpacity>
      <ThemedText style={styles.versionText}>Groza v1.0.0</ThemedText>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 32,
    paddingHorizontal: 20,
  },
  brand: {
    textAlign: 'center',
    marginBottom: 24,
    fontSize: 40,
    letterSpacing: 4,
  },
  profileBox: {
    alignItems: 'center',
    marginBottom: 24,
  },
  profileName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  profileEmail: {
    fontSize: 15,
    color: '#888',
    marginBottom: 2,
  },
  profileRole: {
    fontSize: 14,
    color: '#444',
    marginBottom: 8,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 14,
    color: '#888',
  },
  signOutButton: {
    backgroundColor: '#11181C',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  signOutText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  versionText: {
    textAlign: 'center',
    color: '#888',
    marginTop: 32,
    fontSize: 14,
  },
}); 