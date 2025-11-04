// @ts-ignore
import { ThemedText } from '../../components/ThemedText';
// @ts-ignore
import React from 'react';
// @ts-ignore
import { View, ScrollView, TouchableOpacity, Image, StyleSheet } from 'react-native';
// @ts-ignore
import { Colors } from '../../groza/app/constants/Colors';
// @ts-ignore
import { useColorScheme } from '../../groza/hooks/useColorScheme';
// @ts-ignore
import { BrandHeader } from '../../components/BrandHeader';

const mockVendor = {
  name: 'Fresh Veggie Stand',
  produce: 'Organic Vegetables',
  rating: 4.9,
  deliveryTime: '15-25 min',
  deliveryFee: 'R1.99',
  image: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?w=400',
  minOrder: 'R10',
  isOpen: true,
  description: 'Locally sourced, organic vegetables delivered fresh to your door.',
  items: [
    { id: '1', name: 'Tomatoes', description: 'Juicy organic tomatoes', price: 3.99 },
    { id: '2', name: 'Carrots', description: 'Crunchy sweet carrots', price: 2.49 },
    { id: '3', name: 'Spinach', description: 'Fresh leafy spinach', price: 2.99 },
  ],
};

export default function VendorDetailScreen() {
  const colorScheme = useColorScheme() === 'dark' ? 'dark' : 'light';

  return (
    <ScrollView style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}
      contentContainerStyle={{ paddingBottom: 32 }}>
      <BrandHeader />
      <Image source={{ uri: mockVendor.image }} style={styles.vendorImage} />
      <TouchableOpacity style={styles.backButton} activeOpacity={0.7}>
        <ThemedText style={styles.backArrow}>{'< Back'}</ThemedText>
      </TouchableOpacity>
      <ThemedText type="subtitle" style={styles.vendorName}>{mockVendor.name}</ThemedText>
      <ThemedText style={styles.vendorProduce}>{mockVendor.produce}</ThemedText>
      <ThemedText style={styles.vendorDescription}>{mockVendor.description}</ThemedText>
      <View style={styles.vendorDetailsRow}>
        <ThemedText style={styles.vendorDetail}>{mockVendor.rating} ★</ThemedText>
        <ThemedText style={styles.vendorDetail}>{mockVendor.deliveryTime}</ThemedText>
        <ThemedText style={styles.vendorDetail}>{mockVendor.deliveryFee} delivery</ThemedText>
        <ThemedText style={styles.vendorDetail}>Min {mockVendor.minOrder}</ThemedText>
      </View>
      <ThemedText type="subtitle" style={styles.sectionTitle}>Available Items</ThemedText>
      <View style={styles.itemsList}>
        {mockVendor.items.map((item) => (
          <View key={item.id} style={styles.itemCard}>
            <ThemedText style={styles.itemName}>{item.name}</ThemedText>
            <ThemedText style={styles.itemDescription}>{item.description}</ThemedText>
            <ThemedText style={styles.itemPrice}>R{item.price.toFixed(2)}</ThemedText>
            <TouchableOpacity style={styles.addButton} activeOpacity={0.85}>
              <ThemedText style={styles.addButtonText}>Add to Cart</ThemedText>
            </TouchableOpacity>
          </View>
        ))}
      </View>
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
  vendorImage: {
    width: '100%',
    height: 320, // was 240, now even taller
    borderRadius: 20,
    marginBottom: 16,
  },
  backButton: {
    marginTop: 12, // move the back arrow lower below the image
    marginBottom: 8,
    alignSelf: 'flex-start',
  },
  backArrow: {
    fontSize: 18,
    color: '#11181C',
    fontWeight: 'bold',
  },
  vendorName: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  vendorProduce: {
    fontSize: 15,
    color: '#888',
    marginBottom: 2,
  },
  vendorDescription: {
    fontSize: 15,
    color: '#444',
    marginBottom: 8,
  },
  vendorDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  vendorDetail: {
    fontSize: 13,
    color: '#444',
    marginRight: 8,
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
    fontSize: 20,
    fontWeight: 'bold',
  },
  itemsList: {
    marginTop: 8,
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  itemDescription: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  addButton: {
    backgroundColor: '#11181C',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
}); 