// @ts-ignore
import { ThemedText } from '../../components/ThemedText';
// @ts-ignore
import React from 'react';
// @ts-ignore
import { View, ScrollView, TouchableOpacity, Image, StyleSheet, Dimensions } from 'react-native';
// @ts-ignore
import { Colors } from '../../groza/app/constants/Colors';
// @ts-ignore
import { useColorScheme } from '../../groza/hooks/useColorScheme';
// @ts-ignore
import { BrandHeader } from '../../components/BrandHeader';

const { width } = Dimensions.get('window');

const featuredVendors = [
  {
    id: '1',
    name: 'Fresh Veggie Stand',
    produce: 'Organic Vegetables',
    rating: 4.9,
    deliveryTime: '15-25 min',
    deliveryFee: 'R1.99',
    image: 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?w=400',
    minOrder: 'R10',
    isOpen: true,
  },
  {
    id: '2',
    name: 'Fruit Cart',
    produce: 'Seasonal Fruits',
    rating: 4.8,
    deliveryTime: '20-30 min',
    deliveryFee: 'R2.49',
    image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?w=400',
    minOrder: 'R8',
    isOpen: true,
  },
  {
    id: '3',
    name: 'Local Greens',
    produce: 'Leafy Greens',
    rating: 4.7,
    deliveryTime: '10-20 min',
    deliveryFee: 'R1.49',
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
    minOrder: 'R12',
    isOpen: true,
  },
];

const categories = [
  { id: 'veg', name: 'Vegetables', icon: '🥦', color: '#e0f7fa' },
  { id: 'fruit', name: 'Fruits', icon: '🍎', color: '#ffe0b2' },
  { id: 'greens', name: 'Greens', icon: '🥬', color: '#e8f5e9' },
  { id: 'mixed', name: 'Mixed', icon: '🛒', color: '#f3e5f5' },
];

export default function HomeScreen() {
  const colorScheme = useColorScheme() === 'dark' ? 'dark' : 'light';

  return (
    <ScrollView style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}
      contentContainerStyle={{ paddingBottom: 32 }}>
      <BrandHeader />
      <ThemedText type="subtitle" style={styles.sectionTitle}>Categories</ThemedText>
      <View style={styles.categoriesRow}>
        {categories.map((cat) => (
          <TouchableOpacity key={cat.id} style={[styles.categoryCard, { backgroundColor: cat.color }]}
            activeOpacity={0.8}>
            <ThemedText style={styles.categoryIcon}>{cat.icon}</ThemedText>
            <ThemedText style={styles.categoryName}>{cat.name}</ThemedText>
          </TouchableOpacity>
        ))}
      </View>
      <ThemedText type="subtitle" style={styles.sectionTitle}>Featured Street Vendors</ThemedText>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.vendorScroll}>
        {featuredVendors.map((vendor) => (
          <TouchableOpacity key={vendor.id} style={styles.vendorCard} activeOpacity={0.85}>
            <Image source={{ uri: vendor.image }} style={styles.vendorImage} />
            <View style={styles.vendorInfo}>
              <ThemedText style={styles.vendorName}>{vendor.name}</ThemedText>
              <ThemedText style={styles.vendorProduce}>{vendor.produce}</ThemedText>
              <View style={styles.vendorDetailsRow}>
                <ThemedText style={styles.vendorDetail}>{vendor.deliveryTime}</ThemedText>
                <ThemedText style={styles.vendorDetail}>{vendor.deliveryFee} delivery</ThemedText>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
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
    marginBottom: 12, // was 24, reduced to decrease bottom padding of search bar
    fontSize: 40,
    letterSpacing: 4,
  },
  sectionTitle: {
    marginTop: 8, // was 16, reduced to decrease whitespace
    marginBottom: 8,
    fontSize: 22,
    fontWeight: 'bold',
  },
  categoriesRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12, // was 24, reduced to decrease whitespace
  },
  categoryCard: {
    width: width * 0.2,
    aspectRatio: 1,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4,
    elevation: 2,
  },
  categoryIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
  },
  vendorScroll: {
    marginTop: 8,
  },
  vendorCard: {
    width: width * 0.6,
    marginRight: 16,
    borderRadius: 20,
    backgroundColor: '#fff',
    overflow: 'hidden',
    elevation: 3,
  },
  vendorImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  vendorInfo: {
    padding: 12,
  },
  vendorName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  vendorProduce: {
    fontSize: 14,
    color: '#888',
    marginBottom: 6,
  },
  vendorDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  vendorDetail: {
    fontSize: 13,
    color: '#444',
  },
}); 