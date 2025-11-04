// @ts-ignore
import { ThemedText } from '../../components/ThemedText';
// @ts-ignore
import React, { useState } from 'react';
// @ts-ignore
import { View, ScrollView, TouchableOpacity, Image, StyleSheet, Dimensions } from 'react-native';
// @ts-ignore
import { useStore } from '../../store/useStore';
import { BrandHeader } from '../../components/BrandHeader';
import { Colors } from '../../groza/app/constants/Colors';
// @ts-ignore
import { useColorScheme } from '../../groza/hooks/useColorScheme';
// @ts-ignore
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

const mockCart = [
  {
    id: '1',
    name: 'Organic Tomatoes',
    vendor: 'Fresh Veggie Stand',
    price: 3.99,
    quantity: 2,
    image: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400',
  },
  {
    id: '2',
    name: 'Seasonal Apples',
    vendor: 'Fruit Cart',
    price: 2.49,
    quantity: 3,
    image: 'https://images.unsplash.com/photo-1464983953574-0892a716854b?w=400',
  },
];

export default function CartScreen() {
  const colorScheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const [cart, setCart] = useState(mockCart);

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <ScrollView style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}
      contentContainerStyle={{ paddingBottom: 32 }}>
      <BrandHeader />
      {cart.length === 0 ? (
        <View style={styles.emptyContainer}>
          <ThemedText type="subtitle" style={styles.emptyTitle}>Your cart is empty</ThemedText>
          <ThemedText style={styles.emptySubtitle}>Add some fresh groceries to get started!</ThemedText>
        </View>
      ) : (
        <View style={styles.cartList}>
          {cart.map((item) => (
            <View key={item.id} style={styles.cartItem}>
              <Image source={{ uri: item.image }} style={styles.itemImage} />
              <View style={styles.itemInfo}>
                <ThemedText style={styles.itemName}>{item.name}</ThemedText>
                <ThemedText style={styles.itemVendor}>{item.vendor}</ThemedText>
                <ThemedText style={styles.itemPrice}>R{(item.price * item.quantity).toFixed(2)}</ThemedText>
              </View>
              <View style={styles.itemQuantityBox}>
                <ThemedText style={styles.itemQuantity}>{item.quantity}</ThemedText>
              </View>
            </View>
          ))}
          <View style={styles.totalRow}>
            <ThemedText style={styles.totalLabel}>Total</ThemedText>
            <ThemedText style={styles.totalValue}>R{cartTotal.toFixed(2)}</ThemedText>
          </View>
          <TouchableOpacity style={styles.checkoutButton} activeOpacity={0.85} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); }}>
            <ThemedText style={styles.checkoutButtonText}>Proceed to Checkout</ThemedText>
          </TouchableOpacity>
        </View>
      )}
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
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
    fontSize: 22,
    fontWeight: 'bold',
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 48,
  },
  emptyTitle: {
    fontSize: 20,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#888',
  },
  cartList: {
    marginTop: 8,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    padding: 12,
    elevation: 2,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 12,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  itemVendor: {
    fontSize: 14,
    color: '#888',
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 15,
    color: '#444',
  },
  itemQuantityBox: {
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemQuantity: {
    fontSize: 16,
    fontWeight: '600',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    marginBottom: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  checkoutButton: {
    backgroundColor: '#11181C',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
}); 