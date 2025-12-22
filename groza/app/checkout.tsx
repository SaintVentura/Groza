import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  StyleSheet,
  Image,
  Platform,
  Modal,
  Animated,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useStore } from '@/store/useStore';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from 'react-native';
import { vendors } from '@/constants/Vendors';
import { calculateDeliveryCost, getBikeCourierLocations } from '@/services/uber';

export default function CheckoutScreen() {
  const { cart, cartTotal, clearCart, addOrder, user, addresses, paymentMethods } = useStore();
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [deliveryFee, setDeliveryFee] = useState(0);
  const [estimatedDeliveryTime, setEstimatedDeliveryTime] = useState(25);
  const [courierLocations, setCourierLocations] = useState<Array<{ latitude: number; longitude: number; id: string }>>([]);
  const [courierAnimations, setCourierAnimations] = useState<{ [key: string]: { latitude: number; longitude: number; angle: number } }>({});
  const colorSchemeRaw = useColorScheme();
  const colorScheme = colorSchemeRaw === 'dark' ? 'dark' : 'light';

  const SERVICE_FEE = 30; // R30 service fee
  const total = cartTotal + deliveryFee + SERVICE_FEE;

  // Get default address
  const defaultAddress = addresses.find(addr => addr.isDefault) || addresses[0];
  const deliveryAddress = defaultAddress 
    ? `${defaultAddress.street}, ${defaultAddress.city}, ${defaultAddress.postalCode}`
    : '';
  const phoneNumber = user?.phone || '';

  // Get saved cards
  const savedCards = paymentMethods.filter(pm => pm.type === 'card');
  const [showAddCardModal, setShowAddCardModal] = useState(false);
  const [showCardSelectionModal, setShowCardSelectionModal] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string>('');

  // Initialize payment method to cash on delivery by default
  useEffect(() => {
    if (!selectedPaymentMethod) {
      setSelectedPaymentMethod('cash');
    }
  }, []);

  // Get selected payment method
  const selectedPaymentType = selectedPaymentMethod === 'cash' ? 'cash' : 'card';
  const selectedPayment = selectedPaymentMethod === 'cash' 
    ? { id: 'cash', type: 'cash' as const, label: 'Cash on Delivery', isDefault: false }
    : savedCards.find(pm => pm.id === selectedCardId) || savedCards.find(pm => pm.isDefault) || savedCards[0];

  // Get vendor location
  const vendor = cart.length > 0 ? vendors.find(v => v.id === cart[0].restaurantId) : null;
  const vendorLocation = vendor?.location || { latitude: -26.2041, longitude: 28.0473 };

  // Calculate delivery cost when address is available
  useEffect(() => {
    const calculateFee = async () => {
      if (defaultAddress && vendorLocation) {
        try {
          // For now, use vendor location as customer location (placeholder)
          // In production, geocode the address to get coordinates
          const customerLocation = { latitude: -26.2041, longitude: 28.0473 }; // Placeholder
          const result = await calculateDeliveryCost(vendorLocation, customerLocation);
          setDeliveryFee(result.cost);
          setEstimatedDeliveryTime(result.estimatedTime);
        } catch (error) {
          console.error('Error calculating delivery cost:', error);
        }
      }
    };

    calculateFee();
  }, [defaultAddress, vendorLocation]);

  // Get courier locations and animate them
  useEffect(() => {
    if (vendorLocation) {
      const couriers = getBikeCourierLocations(vendorLocation, 5);
      setCourierLocations(couriers);
      
      // Initialize animation positions
      const initialAnimations: { [key: string]: { latitude: number; longitude: number; angle: number } } = {};
      couriers.forEach((courier) => {
        initialAnimations[courier.id] = {
          latitude: courier.latitude,
          longitude: courier.longitude,
          angle: Math.random() * Math.PI * 2,
        };
      });
      setCourierAnimations(initialAnimations);
    }
  }, [vendorLocation]);

  // Animate courier movement
  useEffect(() => {
    const animationKeys = Object.keys(courierAnimations);
    if (animationKeys.length === 0) return;
    
    const interval = setInterval(() => {
      setCourierAnimations((prev) => {
        const updated: typeof prev = {};
        Object.keys(prev).forEach((id) => {
          const current = prev[id];
          // Move courier in a random direction
          const speed = 0.0001; // Small movement amount
          const angleChange = (Math.random() - 0.5) * 0.3; // Slight angle changes
          const newAngle = current.angle + angleChange;
          updated[id] = {
            latitude: current.latitude + Math.cos(newAngle) * speed,
            longitude: current.longitude + Math.sin(newAngle) * speed,
            angle: newAngle,
          };
        });
        return updated;
      });
    }, 1000); // Update every second

    return () => clearInterval(interval);
  }, [courierLocations.length]);

  const handlePlaceOrder = async () => {
    if (cart.length === 0) {
      Alert.alert('Error', 'Your cart is empty');
      return;
    }

    if (!deliveryAddress) {
      Alert.alert('Error', 'Please add a delivery address in your profile');
      return;
    }

    if (!phoneNumber) {
      Alert.alert('Error', 'Please add your phone number in your profile');
      return;
    }

    if (selectedPaymentMethod !== 'cash' && (!selectedCardId || !savedCards.find(c => c.id === selectedCardId))) {
      Alert.alert('Error', 'Please select a payment method');
      return;
    }

    setIsLoading(true);
    try {
      // Create order object
      const order = {
        id: Date.now().toString(),
        customerId: user?.id || '',
        restaurantId: cart[0]?.restaurantId || '',
        items: cart,
        total,
        status: 'pending' as const,
        createdAt: new Date(),
        estimatedDelivery: new Date(Date.now() + estimatedDeliveryTime * 60 * 1000),
        deliveryAddress,
        paymentStatus: 'pending' as const,
      };

      addOrder(order);
      clearCart();
      
      Alert.alert(
        'Order Placed!',
        'Your order has been placed successfully. You will receive updates on your order status.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(tabs)'),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', 'Failed to place order. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: Colors[colorScheme].background }}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors[colorScheme].text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: Colors[colorScheme].text }]}>Checkout</Text>
      </View>
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={true}
      >
        {/* Map showing bike couriers */}
        <View style={styles.mapContainer}>
          <MapView
            provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
            style={styles.map}
            initialRegion={{
              latitude: vendorLocation.latitude,
              longitude: vendorLocation.longitude,
              latitudeDelta: 0.05,
              longitudeDelta: 0.05,
            }}
            showsUserLocation={false}
            toolbarEnabled={false}
          >
            {/* Vendor location marker */}
            {vendor && (
              <Marker coordinate={vendorLocation}>
                <View style={styles.vendorMarker}>
                  <Ionicons name="storefront" size={20} color="#fff" />
                </View>
              </Marker>
            )}
            {/* Bike courier markers with animation */}
            {courierLocations.map((courier) => {
              const animPosition = courierAnimations[courier.id] || { latitude: courier.latitude, longitude: courier.longitude, angle: 0 };
              return (
                <Marker 
                  key={courier.id} 
                  coordinate={{ latitude: animPosition.latitude, longitude: animPosition.longitude }}
                  anchor={{ x: 0.5, y: 0.5 }}
                >
                  <Animated.View style={[styles.courierMarker]}>
                    <Ionicons name="bicycle" size={16} color="#fff" />
                  </Animated.View>
                </Marker>
              );
            })}
          </MapView>
          <View style={styles.mapLabel}>
            <Text style={styles.mapLabelText}>Available Bike Couriers</Text>
          </View>
        </View>

        {/* Order Summary */}
        <View style={[styles.card, { backgroundColor: Colors[colorScheme].background }]}>
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme].text }]}>Order Summary</Text>
          {cart.map((item) => (
            <View key={item.id} style={styles.orderItem}>
              {item.image && (
                <Image
                  source={{ uri: item.image }}
                  style={styles.itemImage}
                  resizeMode="cover"
                />
              )}
              <View style={{ flex: 1, marginLeft: item.image ? 12 : 0 }}>
                <Text style={[styles.itemName, { color: Colors[colorScheme].text }]}>{item.name}</Text>
                <Text style={[styles.itemQuantity, { color: colorScheme === 'dark' ? '#aaa' : '#666' }]}>
                  Qty: {item.quantity}
                </Text>
                <Text style={[styles.itemPrice, { color: Colors[colorScheme].text }]}>
                  R{(item.price * item.quantity).toFixed(2)}
                </Text>
              </View>
            </View>
          ))}
          <View style={[styles.divider, { backgroundColor: colorScheme === 'dark' ? '#333' : '#e5e7eb' }]} />
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colorScheme === 'dark' ? '#aaa' : '#666' }]}>Subtotal</Text>
            <Text style={[styles.summaryValue, { color: Colors[colorScheme].text }]}>R{cartTotal.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colorScheme === 'dark' ? '#aaa' : '#666' }]}>Delivery Fee</Text>
            <Text style={[styles.summaryValue, { color: Colors[colorScheme].text }]}>R{deliveryFee.toFixed(2)}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, { color: colorScheme === 'dark' ? '#aaa' : '#666' }]}>Service Fee</Text>
            <Text style={[styles.summaryValue, { color: Colors[colorScheme].text }]}>R{SERVICE_FEE.toFixed(2)}</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: colorScheme === 'dark' ? '#333' : '#e5e7eb', marginTop: 8 }]} />
          <View style={styles.summaryRow}>
            <Text style={[styles.totalLabel, { color: Colors[colorScheme].text }]}>Total</Text>
            <Text style={[styles.totalValue, { color: Colors[colorScheme].text }]}>R{total.toFixed(2)}</Text>
          </View>
        </View>

        {/* Delivery Address */}
        <View style={[styles.card, { backgroundColor: Colors[colorScheme].background }]}>
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme].text }]}>Delivery Address</Text>
          {deliveryAddress ? (
            <View style={styles.addressDisplay}>
              <Ionicons name="location" size={20} color={Colors[colorScheme].icon} />
              <Text style={[styles.addressText, { color: Colors[colorScheme].text }]}>{deliveryAddress}</Text>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.addAddressButton}
              onPress={() => router.push('/(tabs)/addresses')}
            >
              <Ionicons name="add-circle-outline" size={20} color={Colors[colorScheme].text} />
              <Text style={[styles.addAddressText, { color: Colors[colorScheme].text }]}>Add Delivery Address</Text>
            </TouchableOpacity>
          )}
          {phoneNumber ? (
            <View style={[styles.phoneDisplay, { marginTop: 12 }]}>
              <Ionicons name="call" size={20} color={Colors[colorScheme].icon} />
              <Text style={[styles.phoneText, { color: Colors[colorScheme].text }]}>{phoneNumber}</Text>
            </View>
          ) : null}
        </View>

        {/* Payment Method */}
        <View style={[styles.card, { backgroundColor: Colors[colorScheme].background }]}>
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme].text }]}>Payment Method</Text>
          
          {/* Cash on Delivery Option */}
          <TouchableOpacity
            style={[
              styles.paymentMethodOption,
              {
                borderColor: selectedPaymentMethod === 'cash' ? '#000' : colorScheme === 'dark' ? '#333' : '#d1d5db',
                backgroundColor: selectedPaymentMethod === 'cash' ? (colorScheme === 'dark' ? '#1a1a1a' : '#f5f5f5') : Colors[colorScheme].background,
                marginBottom: 12,
              }
            ]}
            onPress={() => {
              setSelectedPaymentMethod('cash');
              setSelectedCardId('');
            }}
          >
            <Ionicons
              name="cash"
              size={20}
              color={selectedPaymentMethod === 'cash' ? '#000' : Colors[colorScheme].text}
            />
            <Text 
              style={[
                styles.paymentMethodLabel,
                { 
                  color: selectedPaymentMethod === 'cash' ? '#000' : Colors[colorScheme].text,
                  fontWeight: selectedPaymentMethod === 'cash' ? '600' : '500',
                  flex: 1,
                  marginLeft: 12,
                }
              ]}
            >
              Cash on Delivery
            </Text>
            <View 
              style={[
                styles.radioButton,
                {
                  borderColor: selectedPaymentMethod === 'cash' ? '#000' : colorScheme === 'dark' ? '#333' : '#d1d5db',
                  backgroundColor: selectedPaymentMethod === 'cash' ? '#000' : Colors[colorScheme].background,
                }
              ]}
            >
              {selectedPaymentMethod === 'cash' && (
                <View style={styles.radioButtonInner} />
              )}
            </View>
          </TouchableOpacity>

          {/* Credit/Debit Card Option */}
          <TouchableOpacity
            style={[
              styles.paymentMethodOption,
              {
                borderColor: selectedPaymentMethod !== 'cash' ? '#000' : colorScheme === 'dark' ? '#333' : '#d1d5db',
                backgroundColor: selectedPaymentMethod !== 'cash' ? (colorScheme === 'dark' ? '#1a1a1a' : '#f5f5f5') : Colors[colorScheme].background,
              }
            ]}
            onPress={() => {
              if (savedCards.length === 0) {
                // Show add card modal if no cards saved
                setShowAddCardModal(true);
              } else if (savedCards.length === 1) {
                // Auto-select if only one card
                setSelectedPaymentMethod(savedCards[0].id);
                setSelectedCardId(savedCards[0].id);
              } else {
                // Show card selection modal if multiple cards
                setShowCardSelectionModal(true);
              }
            }}
          >
            <Ionicons
              name="card"
              size={20}
              color={selectedPaymentMethod !== 'cash' ? '#000' : Colors[colorScheme].text}
            />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text 
                style={[
                  styles.paymentMethodLabel,
                  { 
                    color: selectedPaymentMethod !== 'cash' ? '#000' : Colors[colorScheme].text,
                    fontWeight: selectedPaymentMethod !== 'cash' ? '600' : '500',
                  }
                ]}
              >
                Credit/Debit Card
              </Text>
              {selectedPaymentMethod !== 'cash' && selectedPayment && selectedPayment.last4 && (
                <Text style={[styles.paymentMethodDetails, { color: colorScheme === 'dark' ? '#aaa' : '#666' }]}>
                  •••• •••• •••• {selectedPayment.last4}
                </Text>
              )}
            </View>
            <View 
              style={[
                styles.radioButton,
                {
                  borderColor: selectedPaymentMethod !== 'cash' ? '#000' : colorScheme === 'dark' ? '#333' : '#d1d5db',
                  backgroundColor: selectedPaymentMethod !== 'cash' ? '#000' : Colors[colorScheme].background,
                }
              ]}
            >
              {selectedPaymentMethod !== 'cash' && (
                <View style={styles.radioButtonInner} />
              )}
            </View>
          </TouchableOpacity>
        </View>

        {/* Delivery Info */}
        <View style={[styles.card, { backgroundColor: Colors[colorScheme].background }]}>
          <Text style={[styles.sectionTitle, { color: Colors[colorScheme].text }]}>Delivery Info</Text>
          <View style={styles.deliveryInfoRow}>
            <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
              <Ionicons name="time-outline" size={20} color={Colors[colorScheme].icon} />
              <Text style={[styles.deliveryInfoText, { color: Colors[colorScheme].text, marginLeft: 8 }]}>
                Estimated Delivery
              </Text>
            </View>
            <Text style={[styles.deliveryTime, { color: Colors[colorScheme].text }]}>
              {estimatedDeliveryTime}-{estimatedDeliveryTime + 10} minutes
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Card Selection Modal */}
      <Modal
        visible={showCardSelectionModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowCardSelectionModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowCardSelectionModal(false)}
        >
          <View 
            style={[
              styles.modalContent,
              { backgroundColor: Colors[colorScheme].background }
            ]}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: Colors[colorScheme].text }]}>Select Card</Text>
              <TouchableOpacity onPress={() => setShowCardSelectionModal(false)}>
                <Ionicons name="close" size={24} color={Colors[colorScheme].text} />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {savedCards.map((card) => (
                <TouchableOpacity
                  key={card.id}
                  style={[
                    styles.paymentMethodOption,
                    {
                      borderColor: selectedCardId === card.id
                        ? '#000'
                        : colorScheme === 'dark' ? '#333' : '#d1d5db',
                      backgroundColor: selectedCardId === card.id
                        ? (colorScheme === 'dark' ? '#1a1a1a' : '#f5f5f5')
                        : Colors[colorScheme].background,
                    }
                  ]}
                  onPress={() => {
                    setSelectedCardId(card.id);
                    setSelectedPaymentMethod(card.id);
                    setShowCardSelectionModal(false);
                  }}
                >
                  <Ionicons
                    name="card"
                    size={20}
                    color={selectedCardId === card.id ? '#000' : Colors[colorScheme].text}
                  />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text 
                      style={[
                        styles.paymentMethodLabel,
                        { 
                          color: selectedCardId === card.id ? '#000' : Colors[colorScheme].text,
                          fontWeight: selectedCardId === card.id ? '600' : '500',
                        }
                      ]}
                    >
                      {card.label}
                    </Text>
                    {card.last4 && (
                      <Text style={[styles.paymentMethodDetails, { color: colorScheme === 'dark' ? '#aaa' : '#666' }]}>
                        •••• •••• •••• {card.last4}
                      </Text>
                    )}
                  </View>
                  <View 
                    style={[
                      styles.radioButton,
                      {
                        borderColor: selectedCardId === card.id
                          ? '#000'
                          : colorScheme === 'dark' ? '#333' : '#d1d5db',
                        backgroundColor: selectedCardId === card.id
                          ? '#000'
                          : Colors[colorScheme].background,
                      }
                    ]}
                  >
                    {selectedCardId === card.id && (
                      <View style={styles.radioButtonInner} />
                    )}
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>

      {/* Add Card Modal */}
      <Modal
        visible={showAddCardModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowAddCardModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: Colors[colorScheme].background }]}>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setShowAddCardModal(false)}
            >
              <Ionicons name="close" size={24} color={Colors[colorScheme].text} />
            </TouchableOpacity>
            <Text style={[styles.modalTitle, { color: Colors[colorScheme].text }]}>Add Payment Method</Text>
            <Text style={[styles.modalText, { color: colorScheme === 'dark' ? '#aaa' : '#666' }]}>
              To use a credit or debit card, please add it in your payment methods.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonSecondary]}
                onPress={() => setShowAddCardModal(false)}
              >
                <Text style={styles.modalButtonTextSecondary}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonPrimary]}
                onPress={() => {
                  setShowAddCardModal(false);
                  router.push('/(tabs)/payments');
                }}
              >
                <Text style={styles.modalButtonTextPrimary}>Add Card</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Place Order Button */}
      <View style={[styles.footer, { backgroundColor: Colors[colorScheme].background, borderTopColor: colorScheme === 'dark' ? '#333' : '#f0f0f0' }]}>
        <TouchableOpacity
          style={[
            styles.placeOrderButton,
            { backgroundColor: isLoading ? '#9ca3af' : '#000' }
          ]}
          onPress={handlePlaceOrder}
          disabled={isLoading}
        >
          <Text style={styles.placeOrderButtonText}>
            {isLoading ? 'Placing Order...' : 'Place Order'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 80,
    paddingBottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  backButton: {
    marginRight: 16,
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: -1,
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#fff',
  },
  mapContainer: {
    height: 350,
    marginHorizontal: 20,
    marginTop: 16,
    marginBottom: 24,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  map: {
    flex: 1,
  },
  mapLabel: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  mapLabelText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  vendorMarker: {
    backgroundColor: '#2563eb',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  courierMarker: {
    backgroundColor: '#22c55e',
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 24,
    marginHorizontal: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  orderItem: {
    flexDirection: 'row',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
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
  divider: {
    height: 1,
    marginVertical: 12,
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
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  addressDisplay: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  addressText: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    lineHeight: 22,
  },
  phoneDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  phoneText: {
    marginLeft: 12,
    fontSize: 16,
  },
  addAddressButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    borderStyle: 'dashed',
  },
  addAddressText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '500',
  },
  paymentSelector: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paymentSelectorContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentMethodOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
  },
  paymentMethodLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  paymentMethodDetails: {
    fontSize: 14,
    marginTop: 4,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonInner: {
    width: 8,
    height: 8,
    backgroundColor: '#fff',
    borderRadius: 4,
  },
  deliveryInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  deliveryInfoText: {
    fontSize: 16,
  },
  deliveryTime: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  footer: {
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: 32,
  },
  placeOrderButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeOrderButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingBottom: 40,
    maxHeight: '70%',
    backgroundColor: '#fff',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    padding: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 12,
  },
  modalText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 20,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonPrimary: {
    backgroundColor: '#000',
  },
  modalButtonSecondary: {
    backgroundColor: '#f0f0f0',
  },
  modalButtonTextPrimary: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonTextSecondary: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
});
