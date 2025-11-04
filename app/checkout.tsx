// @ts-ignore
import { ThemedText } from '../components/ThemedText';
// @ts-ignore
import React, { useState } from 'react';
// @ts-ignore
import { View, ScrollView, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
// @ts-ignore
import { Colors } from '../groza/app/constants/Colors';
// @ts-ignore
import { useColorScheme } from '../groza/hooks/useColorScheme';
// @ts-ignore
import * as Haptics from 'expo-haptics';
// @ts-ignore
import { BrandHeader } from '../components/BrandHeader';

const mockCart = [
  {
    id: '1',
    name: 'Organic Tomatoes',
    price: 3.99,
    quantity: 2,
  },
  {
    id: '2',
    name: 'Seasonal Apples',
    price: 2.49,
    quantity: 3,
  },
];

export default function CheckoutScreen() {
  const colorScheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const [cart] = useState(mockCart);
  const [address, setAddress] = useState('123 Main St');
  const [phone, setPhone] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <ScrollView style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}
      contentContainerStyle={{ paddingBottom: 32 }}>
      <BrandHeader />
      <View style={styles.sectionBox}>
        <ThemedText type="subtitle" style={styles.sectionHeader}>Order Summary</ThemedText>
        {cart.map((item) => (
          <View key={item.id} style={styles.summaryRow}>
            <ThemedText style={styles.summaryName}>{item.name}</ThemedText>
            <ThemedText style={styles.summaryQty}>x{item.quantity}</ThemedText>
            <ThemedText style={styles.summaryPrice}>R{(item.price * item.quantity).toFixed(2)}</ThemedText>
          </View>
        ))}
        <View style={styles.summaryRow}>
          <ThemedText style={styles.summaryName}>Subtotal</ThemedText>
          <ThemedText style={styles.summaryPrice}>R{cartTotal.toFixed(2)}</ThemedText>
        </View>
        <View style={styles.summaryRow}>
          <ThemedText style={styles.summaryName}>Delivery Fee</ThemedText>
          <ThemedText style={styles.summaryPrice}>R2.99</ThemedText>
        </View>
        <View style={styles.summaryRow}>
          <ThemedText style={styles.summaryName}>Total</ThemedText>
          <ThemedText style={styles.summaryPrice}>R{(cartTotal + 2.99).toFixed(2)}</ThemedText>
        </View>
      </View>
      <View style={styles.sectionBox}>
        <ThemedText type="subtitle" style={styles.sectionHeader}>Delivery Address</ThemedText>
        <TextInput
          style={[styles.input, { color: Colors[colorScheme].text, backgroundColor: colorScheme === 'dark' ? '#222' : '#f3f4f6' }]}
          value={address}
          onChangeText={setAddress}
          placeholder="Enter your address"
          placeholderTextColor={colorScheme === 'dark' ? '#888' : '#aaa'}
        />
        <ThemedText type="subtitle" style={styles.sectionHeader}>Phone Number</ThemedText>
        <TextInput
          style={[styles.input, { color: Colors[colorScheme].text, backgroundColor: colorScheme === 'dark' ? '#222' : '#f3f4f6' }]}
          value={phone}
          onChangeText={setPhone}
          placeholder="Enter your phone number"
          placeholderTextColor={colorScheme === 'dark' ? '#888' : '#aaa'}
          keyboardType="phone-pad"
        />
      </View>
      <TouchableOpacity style={styles.placeOrderButton} activeOpacity={0.85} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setIsLoading(true); }}>
        <ThemedText style={styles.placeOrderText}>{isLoading ? 'Placing Order...' : 'Place Order'}</ThemedText>
      </TouchableOpacity>
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
  sectionBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  summaryName: {
    fontSize: 15,
    fontWeight: '500',
  },
  summaryQty: {
    fontSize: 15,
    color: '#888',
    marginHorizontal: 8,
  },
  summaryPrice: {
    fontSize: 15,
    fontWeight: 'bold',
  },
  input: {
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  placeOrderButton: {
    backgroundColor: '#11181C',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  placeOrderText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
}); 