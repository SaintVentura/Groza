// @ts-ignore
import { ThemedText } from '../components/ThemedText';
// @ts-ignore
import React from 'react';
// @ts-ignore
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
// @ts-ignore
import { Colors } from '../groza/app/constants/Colors';
// @ts-ignore
import { useColorScheme } from '../groza/hooks/useColorScheme';
// @ts-ignore
import { BrandHeader } from '../components/BrandHeader';

const mockOrders = [
  {
    id: '1001',
    vendor: 'Fresh Veggie Stand',
    total: 12.97,
    status: 'Delivered',
    date: '2024-06-01',
  },
  {
    id: '1002',
    vendor: 'Fruit Cart',
    total: 7.47,
    status: 'In Progress',
    date: '2024-06-03',
  },
];

export default function OrdersScreen() {
  const colorScheme = useColorScheme() === 'dark' ? 'dark' : 'light';

  return (
    <ScrollView style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}
      contentContainerStyle={{ paddingBottom: 32 }}>
      <BrandHeader />
      <ThemedText type="subtitle" style={styles.sectionTitle}>My Orders</ThemedText>
      {mockOrders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <ThemedText type="subtitle" style={styles.emptyTitle}>No orders yet</ThemedText>
          <ThemedText style={styles.emptySubtitle}>Start shopping to place your first order!</ThemedText>
        </View>
      ) : (
        <View style={styles.orderList}>
          {mockOrders.map((order) => (
            <TouchableOpacity key={order.id} style={styles.orderCard} activeOpacity={0.85}>
              <View style={styles.orderInfo}>
                <ThemedText style={styles.orderVendor}>{order.vendor}</ThemedText>
                <ThemedText style={styles.orderDate}>{order.date}</ThemedText>
              </View>
              <View style={styles.orderDetails}>
                <ThemedText style={styles.orderStatus}>{order.status}</ThemedText>
                <ThemedText style={styles.orderTotal}>R{order.total.toFixed(2)}</ThemedText>
              </View>
            </TouchableOpacity>
          ))}
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
  orderList: {
    marginTop: 8,
  },
  orderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    padding: 16,
    elevation: 2,
    justifyContent: 'space-between',
  },
  orderInfo: {
    flex: 1,
  },
  orderVendor: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  orderDate: {
    fontSize: 14,
    color: '#888',
  },
  orderDetails: {
    alignItems: 'flex-end',
  },
  orderStatus: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
    color: '#2563eb',
  },
  orderTotal: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#444',
  },
}); 