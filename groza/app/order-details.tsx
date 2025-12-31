import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  Animated,
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
  
  // Animation values for order steps
  const stepAnimations = useRef<{ [key: string]: Animated.Value }>({}).current;

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

  // Initialize and animate order steps
  useEffect(() => {
    if (!order) return;
    
    const statusOrder = ['pending', 'confirmed', 'preparing', 'ready', 'picked', 'delivering', 'delivered'];
    const currentIndex = statusOrder.indexOf(order.status);
    
    statusOrder.forEach((status, index) => {
      if (!stepAnimations[status]) {
        stepAnimations[status] = new Animated.Value(0);
      }
      
      const shouldAnimate = index <= currentIndex;
      
      Animated.spring(stepAnimations[status], {
        toValue: shouldAnimate ? 1 : 0,
        delay: index * 100, // Stagger animation
        useNativeDriver: true,
        tension: 50,
        friction: 7,
      }).start();
    });
  }, [order?.status]);

  // Pulse animation for current step
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  useEffect(() => {
    if (!order) return;
    const statusOrder = ['pending', 'confirmed', 'preparing', 'ready', 'picked', 'delivering', 'delivered'];
    const currentIndex = statusOrder.indexOf(order.status);
    
    // Only pulse if not completed (delivered)
    if (currentIndex >= 0 && currentIndex < statusOrder.length - 1) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();
      
      return () => pulseAnimation.stop();
    } else {
      pulseAnim.setValue(1);
    }
  }, [order?.status]);

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

        {/* Order Steps (Uber-style) */}
        <View style={[styles.card, { backgroundColor: Colors[colorScheme].background }]}>
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme].text, marginBottom: 20 }]}>Order Status</Text>
          {[
            { status: 'pending', label: 'Order Placed', icon: 'receipt-outline' },
            { status: 'confirmed', label: 'Order Confirmed', icon: 'checkmark-circle-outline' },
            { status: 'preparing', label: 'Preparing Your Order', icon: 'restaurant-outline' },
            { status: 'ready', label: 'Order Ready', icon: 'checkmark-done-outline' },
            { status: 'picked', label: 'Courier Picked Up', icon: 'bicycle-outline' },
            { status: 'delivering', label: 'On The Way', icon: 'car-outline' },
            { status: 'delivered', label: 'Delivered', icon: 'checkmark-circle' },
          ].map((step, index) => {
            const statusOrder = ['pending', 'confirmed', 'preparing', 'ready', 'picked', 'delivering', 'delivered'];
            const currentIndex = statusOrder.indexOf(order.status);
            const stepIndex = statusOrder.indexOf(step.status);
            const isCompleted = stepIndex <= currentIndex;
            const isCurrent = stepIndex === currentIndex;
            
            const animValue = stepAnimations[step.status] || new Animated.Value(0);
            const scale = animValue.interpolate({
              inputRange: [0, 1],
              outputRange: [0.8, 1],
            });
            const opacity = animValue.interpolate({
              inputRange: [0, 1],
              outputRange: [0.5, 1],
            });
            
            return (
              <Animated.View 
                key={step.status} 
                style={[
                  styles.orderStep,
                  {
                    opacity,
                    transform: [{ scale }],
                  }
                ]}
              >
                <Animated.View style={[
                  styles.stepIconContainer,
                  {
                    backgroundColor: isCompleted ? '#000' : '#e5e7eb',
                    borderColor: isCurrent ? '#000' : 'transparent',
                    borderWidth: isCurrent ? 2.5 : 0,
                    transform: [{
                      scale: isCurrent 
                        ? pulseAnim
                        : animValue.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0.8, 1],
                          }),
                    }],
                  }
                ]}>
                  <Ionicons 
                    name={step.icon as any} 
                    size={20} 
                    color={isCompleted ? '#fff' : '#999'} 
                  />
                  {isCurrent && (
                    <Animated.View 
                      style={[
                        styles.pulseIndicator,
                        {
                          opacity: animValue.interpolate({
                            inputRange: [0, 1],
                            outputRange: [0, 0.3],
                          }),
                          transform: [{
                            scale: animValue.interpolate({
                              inputRange: [0, 1],
                              outputRange: [1, 1.5],
                            }),
                          }],
                        }
                      ]}
                    />
                  )}
                </Animated.View>
                <View style={styles.stepContent}>
                  <Text style={[
                    styles.stepLabel,
                    { 
                      color: isCompleted ? Colors[colorScheme].text : (colorScheme === 'dark' ? '#666' : '#999'),
                      fontWeight: isCurrent ? '700' : isCompleted ? '500' : '400',
                    }
                  ]}>
                    {step.label}
                  </Text>
                  {isCurrent && order.estimatedDelivery && (
                    <Text style={[styles.stepTime, { color: colorScheme === 'dark' ? '#aaa' : '#666' }]}>
                      Est. {new Date(order.estimatedDelivery).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  )}
                  {isCompleted && !isCurrent && (
                    <Text style={[styles.stepTime, { color: colorScheme === 'dark' ? '#888' : '#bbb', fontSize: 12 }]}>
                      ✓ Completed
                    </Text>
                  )}
                </View>
                {index < 6 && (
                  <View style={[
                    styles.stepLineContainer,
                  ]}>
                    <Animated.View style={[
                      styles.stepLine,
                      { 
                        backgroundColor: isCompleted ? '#000' : '#e5e7eb',
                        height: isCompleted ? 40 : 0,
                      }
                    ]} />
                  </View>
                )}
              </Animated.View>
            );
          })}
        </View>

        {/* Complete Order Button - Show when courier has arrived */}
        {order.status === 'delivering' && (
          <View style={[styles.card, { backgroundColor: Colors[colorScheme].background }]}>
            <TouchableOpacity
              style={styles.completeOrderButton}
              onPress={() => {
                // Update order status to delivered
                const { updateOrder } = useStore.getState();
                updateOrder(order.id, { status: 'delivered' });
                Alert.alert('Order Completed', 'Thank you for your order!');
              }}
            >
              <Ionicons name="checkmark-circle" size={24} color="#fff" />
              <Text style={styles.completeOrderButtonText}>Complete Order</Text>
            </TouchableOpacity>
          </View>
        )}

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
              R{(order.total - 30 - (order.deliveryFee || 0)).toFixed(2)}
            </Text>
          </View>
          {order.deliveryType === 'delivery' && (
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { color: colorScheme === 'dark' ? '#aaa' : '#666' }]}>Delivery Fee</Text>
              <Text style={[styles.summaryValue, { color: Colors[colorScheme].text }]}>
                R{(order.deliveryFee || 0).toFixed(2)}
              </Text>
            </View>
          )}
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
  orderStep: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    position: 'relative',
  },
  stepIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
    position: 'relative',
    zIndex: 2,
  },
  pulseIndicator: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#000',
    zIndex: -1,
  },
  stepContent: {
    flex: 1,
    paddingTop: 8,
  },
  stepLabel: {
    fontSize: 16,
    marginBottom: 4,
  },
  stepTime: {
    fontSize: 13,
    marginTop: 2,
  },
  stepLineContainer: {
    position: 'absolute',
    left: 19,
    top: 40,
    width: 2,
    height: 40,
    zIndex: 1,
    overflow: 'hidden',
  },
  stepLine: {
    width: 2,
    height: 40,
  },
});


