import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
  Animated,
  TextInput,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useStore } from '@/store/useStore';
import { useColorScheme } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useScrollPreservation } from '../../hooks/useScrollPreservation';

const { width } = Dimensions.get('window');

const Colors = {
  light: {
    text: '#000',
    background: '#fff',
    // Add other color keys as needed
  },
  dark: {
    text: '#fff',
    background: '#000',
    // Add other color keys as needed
  },
};

export default function CartScreen() {
  const { cart, cartTotal, removeFromCart, updateCartItemQuantity, clearCart } = useStore();
  const colorSchemeRaw = useColorScheme();
  const colorScheme = colorSchemeRaw === 'dark' ? 'dark' : 'light';
  const [orderNote, setOrderNote] = useState('');
  const [removingId, setRemovingId] = useState<string | null>(null);
  const animatedValues = useRef<{ [id: string]: Animated.Value }>({}).current;

  // Animations for header, line, and order note
  const headerFade = useRef(new Animated.Value(cart.length > 0 ? 1 : 0)).current;
  const orderNoteFade = useRef(new Animated.Value(cart.length > 0 ? 1 : 0)).current;
  const emptyPop = useRef(new Animated.Value(cart.length === 0 ? 1 : 0)).current;

  useEffect(() => {
    if (cart.length === 0) {
      Animated.parallel([
        Animated.timing(headerFade, { toValue: 0, duration: 250, useNativeDriver: true }),
        Animated.timing(orderNoteFade, { toValue: 0, duration: 250, useNativeDriver: true }),
        Animated.spring(emptyPop, { toValue: 1, useNativeDriver: true, friction: 6 }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(headerFade, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.timing(orderNoteFade, { toValue: 1, duration: 250, useNativeDriver: true }),
        Animated.timing(emptyPop, { toValue: 0, duration: 100, useNativeDriver: true }),
      ]).start();
    }
  }, [cart.length]);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(24)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;
  const isFirstLoad = useRef(true);
  const [animTrigger, setAnimTrigger] = useState(0);
  const { scrollViewRef, handleScroll } = useScrollPreservation('cart');

  useFocusEffect(
    React.useCallback(() => {
      setAnimTrigger((t) => t + 1);
      // Slide up animation
      slideAnim.setValue(100);
      fadeAnim.setValue(0);
      if (isFirstLoad.current) {
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
        ]).start(() => {
          isFirstLoad.current = false;
        });
      } else {
        translateY.setValue(0);
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      }

      return () => {
        // Cleanup animation on unmount
        slideAnim.setValue(100);
        fadeAnim.setValue(0);
      };
    }, [slideAnim, fadeAnim, translateY])
  );

  const handleCheckout = () => {
    if (cart.length === 0) {
      Alert.alert('Empty Cart', 'Please add items to your cart before checkout');
      return;
    }
    Alert.alert('Coming Soon', 'Checkout feature will be available soon!');
  };

  const handleRemoveItem = (itemId: string) => {
    setRemovingId(itemId);
    if (!animatedValues[itemId]) {
      animatedValues[itemId] = new Animated.Value(1);
    }
    Animated.timing(animatedValues[itemId], {
      toValue: 0,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      removeFromCart(itemId);
      setRemovingId(null);
      delete animatedValues[itemId];
    });
  };

  const handleClearCart = () => {
    clearCart();
  };

  if (cart.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <Animated.View 
          style={[
            { flex: 1, justifyContent: 'flex-start' },
            {
              transform: [
                { translateY: slideAnim }
              ],
              opacity: fadeAnim,
            }
          ]}
        >
          <View style={styles.cartHeadingContainer}>
            <Text style={[styles.cartHeading, { color: Colors[colorScheme].text, marginBottom: 12 }]}>Cart</Text>
          </View>
          <Animated.View style={{ flex: 0, justifyContent: 'flex-start', alignItems: 'center', backgroundColor: '#fff', opacity: emptyPop, transform: [{ scale: emptyPop.interpolate({ inputRange: [0, 1], outputRange: [0.95, 1] }) }] }}>
            <View style={[styles.emptyContent, { marginTop: 180 }]}>
              <Ionicons name="bag-outline" size={80} color={colorScheme === 'dark' ? '#fff' : '#ccc'} style={{ marginTop: 0, marginBottom: 16 }} />
              <Text style={[styles.emptyTitle, { color: Colors[colorScheme].text, marginTop: 0, marginBottom: 8 }]} >Your cart is empty</Text>
              <Text style={[styles.emptySubtitle, { color: colorScheme === 'dark' ? '#aaa' : '#666', marginBottom: 16 }]} >Add some fresh groceries to get started!</Text>
              <TouchableOpacity
                style={[styles.browseButton, { backgroundColor: colorScheme === 'dark' ? '#fff' : '#000', marginTop: 2 }]}
                onPress={() => router.push('/(tabs)/explore')}
              >
                <Text style={[styles.browseButtonText, { color: colorScheme === 'dark' ? '#000' : '#fff' }]}>Explore Street Vendors</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
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
        {/* Cart Heading */}
        <View style={styles.cartHeadingContainer}>
          <Text style={[styles.cartHeading, { color: Colors[colorScheme].text }]}>Cart</Text>
        </View>
      {/* Header */}
      <Animated.View style={[styles.header, { backgroundColor: Colors[colorScheme].background, opacity: headerFade }]}>
        <Text style={[styles.headerTitle, { color: Colors[colorScheme].text }]}>Ready for Delivery</Text>
        <TouchableOpacity onPress={handleClearCart}>
          <Text style={[styles.clearAllText, { color: colorScheme === 'dark' ? '#fff' : '#000' }]}>Clear All</Text>
        </TouchableOpacity>
      </Animated.View>
      {/* White line under header */}
      <Animated.View style={{ height: 1, backgroundColor: '#f0f0f0', opacity: headerFade }} />
      <ScrollView 
        ref={scrollViewRef}
        style={styles.scrollView} 
        showsVerticalScrollIndicator={true}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Scroll indicator cue */}
        <View style={{ alignItems: 'center', marginBottom: 18 }}>
          <View style={{ width: 40, height: 5, borderRadius: 3, backgroundColor: '#e0e0e0', opacity: 0.7 }} />
        </View>
        {/* Cart Items */}
        {cart.map((item) => {
          if (!animatedValues[item.id]) {
            animatedValues[item.id] = new Animated.Value(1);
          }
          return (
            <Animated.View
              key={item.id}
              style={[
                styles.cartItem,
                { backgroundColor: Colors[colorScheme].background },
                {
                  opacity: animatedValues[item.id],
                  height: animatedValues[item.id].interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 128],
                    extrapolate: 'clamp',
                  }),
                  marginBottom: animatedValues[item.id].interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 24],
                    extrapolate: 'clamp',
                  }),
                },
              ]}
            >
              <Image
                source={{ uri: item.image || 'https://via.placeholder.com/80' }}
                style={styles.itemImage}
                resizeMode="cover"
              />
              <View style={styles.itemInfo}>
                <View style={styles.itemHeader}>
                  <View style={styles.itemDetails}>
                    <Text style={[styles.itemName, { color: Colors[colorScheme].text }]}>{item.name}</Text>
                    <Text style={[styles.itemRestaurant, { color: Colors[colorScheme].text }]}>{item.restaurantName}</Text>
                    {item.customizations && item.customizations.length > 0 && (
                      <Text style={[styles.itemCustomizations, { color: Colors[colorScheme].text }]}>
                        {item.customizations.join(', ')}
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity
                    onPress={() => handleRemoveItem(item.id)}
                    style={styles.removeButton}
                    disabled={removingId === item.id}
                  >
                    <Ionicons name="close" size={20} color="#FF3B30" />
                  </TouchableOpacity>
                </View>

                <View style={styles.itemFooter}>
                  <View style={styles.priceContainer}>
                    <Text style={[styles.itemPrice, { color: Colors[colorScheme].text }]}>R{(item.price * item.quantity).toFixed(2)}</Text>
                    <Text style={[styles.pricePerItem, { color: Colors[colorScheme].text }]}>R{item.price.toFixed(2)} each</Text>
                  </View>
                  <View style={styles.quantityContainer}>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => {
                        if (item.quantity === 1) {
                          handleRemoveItem(item.id);
                        } else {
                          updateCartItemQuantity(item.id, item.quantity - 1);
                        }
                      }}
                      disabled={removingId === item.id}
                    >
                      <Ionicons name="remove" size={16} color={colorScheme === 'dark' ? '#fff' : '#000'} />
                    </TouchableOpacity>
                    <Text style={[styles.quantityText, { color: Colors[colorScheme].text }]}>{item.quantity}</Text>
                    <TouchableOpacity
                      style={styles.quantityButton}
                      onPress={() => updateCartItemQuantity(item.id, item.quantity + 1)}
                    >
                      <Ionicons name="add" size={16} color={colorScheme === 'dark' ? '#fff' : '#000'} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Animated.View>
          );
        })}
      </ScrollView>

      {/* Order Note Section */}
      <Animated.View style={[styles.orderNoteSection, { backgroundColor: Colors[colorScheme].background, opacity: orderNoteFade }]}>
        <Text style={[styles.orderNoteLabel, { color: Colors[colorScheme].text }]}>Order Note</Text>
        <TextInput
          style={[styles.orderNoteInput, {
            color: Colors[colorScheme].text,
            borderColor: colorScheme === 'dark' ? '#444' : '#e9ecef',
            backgroundColor: colorScheme === 'dark' ? '#222' : '#f8f9fa'
          }]}
          placeholder="Add special instructions, delivery notes, or any other requests..."
          placeholderTextColor={colorScheme === 'dark' ? '#888' : '#999'}
          value={orderNote}
          onChangeText={setOrderNote}
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />
      </Animated.View>
      {/* Sticky shadow below order note if more than 2 items */}
      {cart.length > 2 && (
        <LinearGradient
          colors={[colorScheme === 'dark' ? 'rgba(0,0,0,0.18)' : 'rgba(0,0,0,0.10)', 'transparent']}
          style={{ position: 'absolute', left: 0, right: 0, top: undefined, bottom: 0, height: 32, zIndex: 10 }}
          pointerEvents="none"
        />
      )}

      {/* Checkout Section: Only Subtotal */}
      <View style={[styles.checkoutSection, { backgroundColor: Colors[colorScheme].background }]}>
        <View style={styles.priceRow}>
          <Text style={[styles.priceLabel, { color: Colors[colorScheme].text }]}>Subtotal</Text>
          <Text style={[styles.priceValue, { color: Colors[colorScheme].text }]}>R{cartTotal.toFixed(2)}</Text>
        </View>
        <TouchableOpacity
          style={[styles.checkoutButton, { backgroundColor: colorScheme === 'dark' ? '#fff' : '#000' }]}
          onPress={handleCheckout}
        >
          <Text style={[styles.checkoutButtonText, { color: colorScheme === 'dark' ? '#000' : '#fff' }]}>Proceed to Checkout</Text>
        </TouchableOpacity>
      </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  emptyContent: {
    alignItems: 'center',
    justifyContent: 'center',
    // Remove flex: 1 and backgroundColor here to avoid double stretching and color issues
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
    marginBottom: 32,
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
  cartHeadingContainer: {
    paddingHorizontal: 20,
    paddingTop: 80,
    paddingBottom: -32, // More negative value to drastically reduce space below cart heading
    alignItems: 'flex-start',
    backgroundColor: '#fff',
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
  clearAllText: {
    fontSize: 16,
    color: '#FF3B30',
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    backgroundColor: '#fff',
  },
  cartItem: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 24, // Increased space between cart items
    padding: 16,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    minHeight: 128,
  },
  itemImage: {
    width: 80,
    height: 80,
    borderRadius: 12,
  },
  itemInfo: {
    flex: 1,
    marginLeft: 16,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  itemRestaurant: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  itemCustomizations: {
    fontSize: 12,
    color: '#999',
  },
  removeButton: {
    padding: 4,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  pricePerItem: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  quantityButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    paddingHorizontal: 12,
  },
  orderNoteSection: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  orderNoteLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  orderNoteInput: {
    borderWidth: 1,
    borderColor: '#e9ecef',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
    minHeight: 56,
  },
  checkoutSection: {
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  priceLabel: {
    fontSize: 16,
    color: '#666',
  },
  priceValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 16,
    marginBottom: 20,
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
  },
  checkoutButton: {
    backgroundColor: '#000',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
}); 