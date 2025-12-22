import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '@/store/useStore';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from 'react-native';
import ProductRating from '@/components/ProductRating';

export default function OrderDetailsScreen() {
  const params = useLocalSearchParams();
  const orderId = params.orderId as string;
  const { orders, user, isAuthenticated } = useStore();
  const colorSchemeRaw = useColorScheme();
  const colorScheme = colorSchemeRaw === 'dark' ? 'dark' : 'light';

  const order = orders.find((o) => o.id === orderId);

  if (!order) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors[colorScheme].background }}>
        <Text style={{ color: Colors[colorScheme].text }}>Order not found</Text>
        <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16, padding: 12, backgroundColor: '#000', borderRadius: 8 }}>
          <Text style={{ color: '#fff' }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'confirmed': return '#3b82f6';
      case 'preparing': return '#8b5cf6';
      case 'ready': return '#10b981';
      case 'picked': return '#06b6d4';
      case 'delivering': return '#6366f1';
      case 'delivered': return '#22c55e';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'confirmed': return 'Confirmed';
      case 'preparing': return 'Preparing';
      case 'ready': return 'Ready';
      case 'picked': return 'Picked Up';
      case 'delivering': return 'Delivering';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const canRateProducts = order.status === 'delivered' && isAuthenticated;

  return (
    <View style={{ flex: 1, backgroundColor: Colors[colorScheme].background }}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: Colors[colorScheme].background }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={Colors[colorScheme].text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: Colors[colorScheme].text }]}>Order Details</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Order Info */}
        <View style={[styles.card, { backgroundColor: Colors[colorScheme].background }]}>
          <View style={styles.orderHeader}>
            <View>
              <Text style={[styles.orderId, { color: Colors[colorScheme].text }]}>Order #{order.id.slice(-6)}</Text>
              <Text style={[styles.orderDate, { color: colorScheme === 'dark' ? '#aaa' : '#666' }]}>
                {new Date(order.createdAt).toLocaleDateString()} at{' '}
                {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(order.status)}20` }]}>
              <Text style={[styles.statusText, { color: getStatusColor(order.status) }]}>
                {getStatusText(order.status)}
              </Text>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: colorScheme === 'dark' ? '#333' : '#e5e7eb' }]} />

          <View style={styles.deliveryInfo}>
            <Ionicons name="location-outline" size={20} color={Colors[colorScheme].text} />
            <Text style={[styles.deliveryAddress, { color: Colors[colorScheme].text }]}>{order.deliveryAddress}</Text>
          </View>
        </View>

        {/* Order Items */}
        <View style={[styles.card, { backgroundColor: Colors[colorScheme].background }]}>
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme].text }]}>Order Items</Text>
          {order.items.map((item) => (
            <View key={item.id} style={styles.orderItem}>
              <Image
                source={{ uri: item.image || 'https://via.placeholder.com/60' }}
                style={styles.itemImage}
                resizeMode="cover"
              />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.itemName, { color: Colors[colorScheme].text }]}>{item.name}</Text>
                <Text style={[styles.itemQuantity, { color: colorScheme === 'dark' ? '#aaa' : '#666' }]}>
                  Quantity: {item.quantity}
                </Text>
                <Text style={[styles.itemPrice, { color: Colors[colorScheme].text }]}>
                  R{(item.price * item.quantity).toFixed(2)}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Rating Section - Only show for delivered orders */}
        {canRateProducts && (
          <View style={[styles.card, { backgroundColor: Colors[colorScheme].background }]}>
            <Text style={[styles.sectionTitle, { color: Colors[colorScheme].text }]}>Rate Your Products</Text>
            <Text style={[styles.ratingSubtitle, { color: colorScheme === 'dark' ? '#aaa' : '#666' }]}>
              Share your experience by rating the products you received
            </Text>
            {order.items.map((item) => (
              <View key={item.id} style={[styles.ratingItem, { borderBottomColor: colorScheme === 'dark' ? '#333' : '#e5e7eb' }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.itemName, { color: Colors[colorScheme].text, marginBottom: 8 }]}>
                    {item.name}
                  </Text>
                  <ProductRating
                    productId={item.id}
                    productName={item.name}
                    orderId={order.id}
                    showLabel={false}
                    size="medium"
                  />
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Order Summary */}
        <View style={[styles.card, { backgroundColor: Colors[colorScheme].background }]}>
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme].text }]}>Order Summary</Text>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colorScheme === 'dark' ? '#aaa' : '#666' }]}>Subtotal</Text>
            <Text style={[styles.summaryValue, { color: Colors[colorScheme].text }]}>
              R{(order.total - 30).toFixed(2)}
            </Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colorScheme === 'dark' ? '#aaa' : '#666' }]}>Service Fee</Text>
            <Text style={[styles.summaryValue, { color: Colors[colorScheme].text }]}>R30.00</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colorScheme === 'dark' ? '#333' : '#e5e7eb', marginVertical: 12 }]} />
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: Colors[colorScheme].text, fontWeight: 'bold', fontSize: 18 }]}>Total</Text>
            <Text style={[styles.summaryValue, { color: Colors[colorScheme].text, fontWeight: 'bold', fontSize: 18 }]}>
              R{order.total.toFixed(2)}
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  card: {
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderId: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    marginVertical: 16,
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryAddress: {
    marginLeft: 8,
    fontSize: 14,
    flex: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  ratingSubtitle: {
    fontSize: 14,
    marginBottom: 16,
    lineHeight: 20,
  },
  orderItem: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingBottom: 16,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 14,
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  ratingItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 14,
  },
  summaryValue: {
    fontSize: 14,
    fontWeight: '600',
  },
});

