import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '@/store/useStore';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from 'react-native';

export default function CheckoutScreen() {
  const { cart, cartTotal, clearCart, addOrder, user } = useStore();
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [isLoading, setIsLoading] = useState(false);
  const colorSchemeRaw = useColorScheme();
  const colorScheme = colorSchemeRaw === 'dark' ? 'dark' : 'light';

  const deliveryFee = 2.99;
  const total = cartTotal + deliveryFee;

  const handlePlaceOrder = async () => {
    if (!deliveryAddress.trim()) {
      Alert.alert('Error', 'Please enter your delivery address');
      return;
    }

    if (!phoneNumber.trim()) {
      Alert.alert('Error', 'Please enter your phone number');
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
        estimatedDelivery: new Date(Date.now() + 45 * 60 * 1000), // 45 minutes from now
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

  const paymentMethods = [
    { id: 'card', label: 'Credit/Debit Card', icon: 'card-outline' },
    { id: 'cash', label: 'Cash on Delivery', icon: 'cash-outline' },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: Colors[colorScheme].background }}>
      {/* Brand Header */}
      <View style={{ alignItems: 'center', paddingTop: 40, paddingBottom: 16 }}>
        <Text style={{ fontSize: 36, fontWeight: 'bold', letterSpacing: 2, color: colorScheme === 'dark' ? '#fff' : '#000', textAlign: 'center' }}>GROZA</Text>
      </View>
      {/* Header */}
      <View style={{ backgroundColor: Colors[colorScheme].background, paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colorScheme === 'dark' ? '#222' : '#f0f0f0' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colorScheme === 'dark' ? '#fff' : '#374151'} />
          </TouchableOpacity>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: Colors[colorScheme].text, marginLeft: 12 }}>Checkout</Text>
        </View>
      </View>
      <ScrollView style={{ flex: 1, paddingHorizontal: 16, paddingVertical: 16 }}>
        {/* Order Summary */}
        <View style={{ backgroundColor: Colors[colorScheme].background, borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: Colors[colorScheme].text, marginBottom: 12 }}>Order Summary</Text>
          {cart.map((item) => (
            <View key={item.id} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <View style={{ flex: 1 }}>
                <Text style={{ fontWeight: '500', color: Colors[colorScheme].text }}>{item.name}</Text>
                <Text style={{ color: colorScheme === 'dark' ? '#aaa' : '#666', fontSize: 14 }}>Qty: {item.quantity}</Text>
              </View>
              <Text style={{ fontWeight: 'bold', color: Colors[colorScheme].text }}>R{(item.price * item.quantity).toFixed(2)}</Text>
            </View>
          ))}
          <View style={{ borderTopWidth: 1, borderTopColor: colorScheme === 'dark' ? '#222' : '#e5e7eb', paddingTop: 12, marginTop: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ color: colorScheme === 'dark' ? '#aaa' : '#666' }}>Subtotal</Text>
              <Text style={{ fontWeight: 'bold', color: Colors[colorScheme].text }}>R{cartTotal.toFixed(2)}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
              <Text style={{ color: colorScheme === 'dark' ? '#aaa' : '#666' }}>Delivery Fee</Text>
              <Text style={{ fontWeight: 'bold', color: Colors[colorScheme].text }}>R2.99</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTopWidth: 1, borderTopColor: colorScheme === 'dark' ? '#222' : '#e5e7eb' }}>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: Colors[colorScheme].text }}>Total</Text>
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: Colors[colorScheme].text }}>R{(cartTotal + 2.99).toFixed(2)}</Text>
            </View>
          </View>
        </View>
        {/* Delivery Address */}
        <View style={{ backgroundColor: Colors[colorScheme].background, borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: Colors[colorScheme].text, marginBottom: 12 }}>Delivery Address</Text>
          <TextInput
            style={{ width: '100%', paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: colorScheme === 'dark' ? '#333' : '#d1d5db', borderRadius: 8, color: Colors[colorScheme].text, marginBottom: 12 }}
            placeholder="Enter your delivery address"
            placeholderTextColor={colorScheme === 'dark' ? '#888' : '#999'}
            value={deliveryAddress}
            onChangeText={setDeliveryAddress}
            multiline
            numberOfLines={3}
          />
          <TextInput
            style={{ width: '100%', paddingHorizontal: 16, paddingVertical: 12, borderWidth: 1, borderColor: colorScheme === 'dark' ? '#333' : '#d1d5db', borderRadius: 8, color: Colors[colorScheme].text }}
            placeholder="Phone number"
            placeholderTextColor={colorScheme === 'dark' ? '#888' : '#999'}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            keyboardType="phone-pad"
          />
        </View>
        {/* Payment Method */}
        <View style={{ backgroundColor: Colors[colorScheme].background, borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: Colors[colorScheme].text, marginBottom: 12 }}>Payment Method</Text>
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={{ flexDirection: 'row', alignItems: 'center', padding: 12, borderWidth: 1, borderColor: paymentMethod === method.id ? '#2563eb' : colorScheme === 'dark' ? '#333' : '#d1d5db', borderRadius: 8, marginBottom: 8, backgroundColor: paymentMethod === method.id ? (colorScheme === 'dark' ? '#1e293b' : '#e0f2fe') : Colors[colorScheme].background }}
              onPress={() => setPaymentMethod(method.id)}
            >
              <Ionicons
                name={method.icon as any}
                size={20}
                color={paymentMethod === method.id ? '#2563eb' : Colors[colorScheme].icon}
              />
              <Text style={{ marginLeft: 12, fontWeight: '500', color: paymentMethod === method.id ? '#2563eb' : Colors[colorScheme].text }}>
                {method.label}
              </Text>
              <View style={{ marginLeft: 'auto', width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: paymentMethod === method.id ? '#2563eb' : colorScheme === 'dark' ? '#333' : '#d1d5db', backgroundColor: paymentMethod === method.id ? '#2563eb' : Colors[colorScheme].background, alignItems: 'center', justifyContent: 'center' }}>
                {paymentMethod === method.id && (
                  <View style={{ width: 8, height: 8, backgroundColor: '#fff', borderRadius: 4 }} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>
        {/* Estimated Delivery */}
        <View style={{ backgroundColor: Colors[colorScheme].background, borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: Colors[colorScheme].text, marginBottom: 12 }}>Delivery Info</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Ionicons name="time-outline" size={20} color={Colors[colorScheme].icon} />
              <Text style={{ color: Colors[colorScheme].text, marginLeft: 8 }}>Estimated Delivery</Text>
            </View>
            <Text style={{ fontWeight: 'bold', color: Colors[colorScheme].text }}>25-35 minutes</Text>
          </View>
        </View>
      </ScrollView>
      {/* Place Order Button */}
      <View style={{ backgroundColor: Colors[colorScheme].background, borderTopWidth: 1, borderTopColor: colorScheme === 'dark' ? '#222' : '#f0f0f0', paddingHorizontal: 16, paddingVertical: 16 }}>
        <TouchableOpacity
          style={{ paddingVertical: 16, borderRadius: 8, backgroundColor: isLoading ? '#9ca3af' : '#2563eb' }}
          onPress={handlePlaceOrder}
          disabled={isLoading}
        >
          <Text style={{ color: '#fff', textAlign: 'center', fontWeight: '600', fontSize: 18 }}>{isLoading ? 'Placing Order...' : 'Place Order'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
} 