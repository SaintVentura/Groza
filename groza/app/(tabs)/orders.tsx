import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  FlatList,
  Animated,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '@/store/useStore';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from 'react-native';
import { navigateBack } from '../../utils/navigation';
import { useScrollPreservation } from '../../hooks/useScrollPreservation';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export default function OrdersScreen() {
  const { orders } = useStore();
  const [selectedTab, setSelectedTab] = useState<'current' | 'past'>('current');
  const colorSchemeRaw = useColorScheme();
  const colorScheme = colorSchemeRaw === 'dark' ? 'dark' : 'light';
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(24)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;
  const flatListRef = useRef<FlatList | null>(null);
  const { scrollViewRef, handleScroll } = useScrollPreservation('orders');

  // Handle back navigation with slide-down animation
  const handleBackPress = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 100,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Navigate after animation completes
      router.back();
    });
  };

  useFocusEffect(
    React.useCallback(() => {
      // Slide up animation
      slideAnim.setValue(100);
      fadeAnim.setValue(0);
      translateY.setValue(24);
      
      Animated.parallel([
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      return () => {
        // Cleanup animation on unmount
        slideAnim.setValue(100);
        fadeAnim.setValue(0);
      };
    }, [slideAnim, fadeAnim, translateY])
  );

  const currentOrders = orders.filter(order => 
    ['pending', 'confirmed', 'preparing', 'ready', 'picked', 'delivering'].includes(order.status)
  );
  const pastOrders = orders.filter(order => 
    ['delivered', 'cancelled'].includes(order.status)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return '#f59e0b';
      case 'confirmed': return '#3b82f6';
      case 'preparing': return '#8b5cf6';
      case 'ready': return '#10b981';
      case 'picked': return '#06b6d4';
      case 'delivering': return '#f97316';
      case 'delivered': return '#059669';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Order Placed';
      case 'confirmed': return 'Order Confirmed';
      case 'preparing': return 'Preparing';
      case 'ready': return 'Ready for Pickup';
      case 'picked': return 'Picked Up';
      case 'delivering': return 'On the Way';
      case 'delivered': return 'Delivered';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  };

  const renderOrderCard = ({ item }: { item: any }) => (
    <View style={[styles.card, { backgroundColor: Colors[colorScheme].background }]}> 
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardTitle}>Order #{item.id.slice(-6)}</Text>
          <Text style={styles.cardSubtitle}>
            {new Date(item.createdAt).toLocaleDateString()} at{' '}
            {new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}20` }]}> 
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>{getStatusText(item.status)}</Text>
        </View>
      </View>
      <View style={styles.cardRow}>
        <Image
          source={{ uri: item.items[0]?.image || 'https://via.placeholder.com/40' }}
          style={styles.cardImage}
          resizeMode="cover"
        />
        <View style={{ flex: 1, marginLeft: 12 }}>
          <Text style={styles.cardProduct}>{item.items[0]?.name}{item.items.length > 1 && ` +${item.items.length - 1} more`}</Text>
          <Text style={styles.cardVendor}>{item.items[0]?.vendorName}</Text>
        </View>
        <Text style={styles.cardAmount}>R{item.total.toFixed(2)}</Text>
      </View>
      <View style={styles.cardFooter}>
        <View style={styles.cardFooterLeft}>
          <Ionicons name="location-outline" size={16} color="#6b7280" />
          <Text style={styles.cardFooterAddress}>{item.deliveryAddress.substring(0, 30)}...</Text>
        </View>
        <TouchableOpacity style={styles.cardFooterButton} onPress={() => router.push(`/order-details?orderId=${item.id}`)}>
          <Text style={styles.cardFooterButtonText}>View Details</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (orders.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: Colors[colorScheme].background }}>
        <Animated.View 
          style={[
            { flex: 1 },
            {
              transform: [
                { translateY: slideAnim }
              ],
              opacity: fadeAnim,
            }
          ]}
        >
          <View style={styles.cartHeadingContainer}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={handleBackPress}
            >
              <Ionicons name="arrow-back" size={24} color={Colors[colorScheme].text} />
            </TouchableOpacity>
            <Text style={[styles.cartHeading, { color: Colors[colorScheme].text }]}>My Orders</Text>
          </View>
        <View style={styles.emptyContent}>
          <Ionicons name="receipt-outline" size={80} color={colorScheme === 'dark' ? '#fff' : '#9ca3af'} style={{ marginBottom: 0 }} />
          <Text style={[styles.emptyTitle, { color: Colors[colorScheme].text }]}>No orders yet</Text>
          <Text style={[styles.emptySubtitle, { color: colorScheme === 'dark' ? '#aaa' : '#666' }]}>Start ordering to see your order history here!</Text>
          <TouchableOpacity style={[styles.browseButton, { backgroundColor: colorScheme === 'dark' ? '#fff' : '#000', marginTop: 0 }]} onPress={() => router.push('/(tabs)')}>
            <Text style={[styles.browseButtonText, { color: colorScheme === 'dark' ? '#000' : '#fff' }]}>Browse Street Vendors</Text>
          </TouchableOpacity>
        </View>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: Colors[colorScheme].background }}>
      <Animated.View 
        style={[
          { flex: 1 },
          {
            transform: [
              { translateY: slideAnim }
            ],
            opacity: fadeAnim,
          }
        ]}
      >
        <View style={styles.cartHeadingContainer}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleBackPress}
          >
            <Ionicons name="arrow-back" size={24} color={Colors[colorScheme].text} />
          </TouchableOpacity>
          <Text style={[styles.cartHeading, { color: Colors[colorScheme].text }]}>My Orders</Text>
        </View>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: Colors[colorScheme].text }]}>Order History</Text>
      </View>
      <View style={styles.tabsRow}>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'current' && styles.tabButtonActive]}
          onPress={() => setSelectedTab('current')}
        >
          <Text style={[styles.tabButtonText, selectedTab === 'current' && styles.tabButtonTextActive]}>
            Current ({currentOrders.length})
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, selectedTab === 'past' && styles.tabButtonActive]}
          onPress={() => setSelectedTab('past')}
        >
          <Text style={[styles.tabButtonText, selectedTab === 'past' && styles.tabButtonTextActive]}>
            Past ({pastOrders.length})
          </Text>
        </TouchableOpacity>
      </View>
      <FlatList
        ref={(node) => {
          // Keep existing ref usage while also wiring preservation ref
          // @ts-ignore
          flatListRef.current = node;
          // @ts-ignore
          scrollViewRef.current = node;
        }}
        data={selectedTab === 'current' ? currentOrders : pastOrders}
        renderItem={renderOrderCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 16 }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  cartHeadingContainer: {
    paddingHorizontal: 20,
    paddingTop: 80, // Reduced to match favourites page
    paddingBottom: 0,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  cartHeading: {
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: -1,
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  tabsRow: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    flexDirection: 'row',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabButtonActive: {
    borderBottomColor: '#2563eb',
  },
  tabButtonText: {
    textAlign: 'center',
    fontWeight: '500',
    color: '#aaa',
    fontSize: 16,
  },
  tabButtonTextActive: {
    color: '#2563eb',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 24, // Match cart page spacing
    padding: 16, // Match cart page padding
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    minHeight: 128, // Match cart page minHeight
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
  },
  cardProduct: {
    fontWeight: 'bold',
    color: '#000',
    fontSize: 16,
  },
  cardVendor: {
    color: '#888',
    fontSize: 14,
  },
  cardAmount: {
    fontWeight: 'bold',
    color: '#000',
    fontSize: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  cardFooterLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardFooterAddress: {
    color: '#888',
    fontSize: 13,
    marginLeft: 4,
  },
  cardFooterButton: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  cardFooterButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  emptyContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginTop: -50, // Move content higher
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 17, // Set spacing to 17px between text and button
  },
  browseButton: {
    backgroundColor: '#000',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 