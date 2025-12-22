import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
  Animated,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useStore } from '@/store/useStore';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from 'react-native';
import { vendors } from '@/constants/Vendors';
import { useFocusEffect } from '@react-navigation/native';

const categories = ['All', 'Vegetables', 'Fruits'];
const { width } = Dimensions.get('window');

export default function VendorScreen() {
  const { id } = useLocalSearchParams();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { addToCart, removeFromCart, updateCartItemQuantity, cart, isAuthenticated, getProductRating, getVendorRating } = useStore();
  const colorSchemeRaw = useColorScheme();
  const colorScheme = colorSchemeRaw === 'dark' ? 'dark' : 'light';
  const [removedProductIds, setRemovedProductIds] = useState<string[]>([]);
  // Add localQuantities state for items not in cart
  const [localQuantities, setLocalQuantities] = useState<{ [productId: string]: number }>({});

  // Find the vendor by id from the vendors list
  const vendorData = vendors.find(v => v.id === id);

  // Animation values
  const slideAnim = useRef(new Animated.Value(100)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const menuItemAnims = useRef<{ [key: string]: Animated.Value }>({}).current;

  // Animation effects
  useFocusEffect(
    React.useCallback(() => {
      // Slide up animation
      slideAnim.setValue(100);
      fadeAnim.setValue(0);
      
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
      ]).start();

      // Staggered menu item animations
      const products = vendorData?.products || [];
      products.forEach((item, index) => {
        if (!menuItemAnims[item.id]) {
          menuItemAnims[item.id] = new Animated.Value(0);
        }
        menuItemAnims[item.id].setValue(0);
        
        setTimeout(() => {
          Animated.timing(menuItemAnims[item.id], {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }).start();
        }, 400 + (index * 100));
      });

      return () => {
        // Cleanup animation on unmount
        slideAnim.setValue(100);
        fadeAnim.setValue(0);
      };
    }, [slideAnim, fadeAnim, vendorData])
  );

  if (!vendorData) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Vendor not found.</Text>
      </View>
    );
  }

  const filteredProducts = selectedCategory === 'All'
    ? vendorData.products || []
    : (vendorData.products || []).filter(item => item.category === selectedCategory);

  const handleAddToCart = (item: any, quantity: number) => {
    const cartItem = {
      id: item.id,
      name: item.name,
      price: item.price,
      quantity,
      restaurantId: vendorData.id,
      restaurantName: vendorData.name,
      image: item.image,
    };
    addToCart(cartItem);
  };

  const handleRemoveFromCart = (item: any) => {
    removeFromCart(item.id);
    setRemovedProductIds((prev) => [...prev, item.id]);
    setTimeout(() => {
      setRemovedProductIds((prev) => prev.filter(id => id !== item.id));
    }, 2000);
  };

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

  return (
    <View style={{ flex: 1, backgroundColor: Colors[colorScheme].background }}>
      <Animated.View 
        style={[
          { flex: 1 },
          {
            transform: [{ translateY: slideAnim }],
            opacity: fadeAnim,
          }
        ]}
      >
        <ScrollView style={{ flex: 1 }} removeClippedSubviews={false}>
        <View style={{ position: 'relative', marginTop: 0, paddingTop: 0 }}>
          <Image
            source={{ uri: vendorData.image }}
            style={{ width: '100%', height: 192 }}
            resizeMode="cover"
          />
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: 16,
              left: 12,
              width: 36,
              height: 36,
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onPress={handleBackPress}
          >
            <Ionicons
              name="arrow-back"
              size={24}
              color="#fff"
              style={{
                textShadowColor: '#000',
                textShadowOffset: { width: 0, height: 2 },
                textShadowRadius: 6,
                elevation: 4,
              }}
            />
          </TouchableOpacity>
        </View>
        {/* Vendor Info Card */}
        <View style={[styles.vendorInfoCard, { backgroundColor: Colors[colorScheme].background }]}>
          <View style={styles.vendorHeader}>
            <Image
              source={{ uri: vendorData.image }}
              style={styles.vendorLogo}
              resizeMode="cover"
            />
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={[styles.vendorName, { color: Colors[colorScheme].text }]}>{vendorData.name}</Text>
              <Text style={[styles.vendorTagline, { color: colorScheme === 'dark' ? '#aaa' : '#666' }]}>{vendorData.tagline}</Text>
            </View>
          </View>
          <View style={styles.vendorStats}>
            <View style={styles.statItem}>
              <Ionicons name="star" size={16} color="#fbbf24" />
              <Text style={[styles.statText, { color: Colors[colorScheme].text }]}>
                {(() => {
                  const productIds = vendorData.products.map(p => p.id);
                  const calculatedRating = getVendorRating(vendorData.id, productIds);
                  return calculatedRating > 0 ? calculatedRating.toFixed(1) : vendorData.rating.toFixed(1);
                })()}
              </Text>
            </View>
            {isAuthenticated && (
              <>
                <View style={styles.statItem}>
                  <Ionicons name="time-outline" size={16} color={colorScheme === 'dark' ? '#aaa' : '#666'} />
                  <Text style={[styles.statText, { color: colorScheme === 'dark' ? '#aaa' : '#666' }]}>{vendorData.deliveryEstimate}</Text>
                </View>
                <View style={styles.statItem}>
                  <Ionicons name="location-outline" size={16} color={colorScheme === 'dark' ? '#aaa' : '#666'} />
                  <Text style={[styles.statText, { color: colorScheme === 'dark' ? '#aaa' : '#666' }]}>{vendorData.distance}</Text>
                </View>
              </>
            )}
          </View>
          {isAuthenticated ? (
            <View style={styles.deliveryInfo}>
              <Ionicons name="car-outline" size={16} color={colorScheme === 'dark' ? '#aaa' : '#666'} />
              <Text style={[styles.deliveryText, { color: colorScheme === 'dark' ? '#aaa' : '#666' }]}>{vendorData.deliveryFee} delivery</Text>
            </View>
          ) : (
            <View style={[styles.deliveryInfo, { paddingVertical: 12, paddingHorizontal: 12, backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : '#f5f5f5', borderRadius: 8, marginTop: 8 }]}>
              <Ionicons name="information-circle-outline" size={18} color={colorScheme === 'dark' ? '#aaa' : '#666'} />
              <Text style={[styles.deliveryText, { color: colorScheme === 'dark' ? '#aaa' : '#666', marginLeft: 8, flex: 1, fontSize: 13, lineHeight: 18 }]}>
                Sign Up to see Delivery Price, Order Time and Distance.
              </Text>
            </View>
          )}
        </View>
        {/* Categories Card */}
        <View style={[styles.categoriesCard, { backgroundColor: Colors[colorScheme].background }]}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryButton,
                  {
                    backgroundColor: selectedCategory === category ? '#000' : 'transparent',
                    borderColor: selectedCategory === category ? 'transparent' : '#000',
                  }
                ]}
                onPress={() => setSelectedCategory(category)}
              >
                <Text style={[
                  styles.categoryText,
                  { color: selectedCategory === category ? '#fff' : Colors[colorScheme].text }
                ]}>
                  {category}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        {/* Menu Items */}
        <View style={{ paddingHorizontal: 16, paddingVertical: 16 }}>
          {filteredProducts.map((item, index) => {
            const cartItem = cart.find(ci => ci.id === item.id);
            const isAdded = !!cartItem;
            const quantity = isAdded ? cartItem.quantity : (localQuantities[item.id] || 1);
            const itemAnim = menuItemAnims[item.id] || new Animated.Value(1);
            
            return (
              <Animated.View 
                key={item.id} 
                style={[
                  styles.menuItemCard,
                  { 
                    backgroundColor: Colors[colorScheme].background,
                    transform: [
                      {
                        translateY: itemAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [50, 0],
                        }),
                      },
                      {
                        scale: itemAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0.9, 1],
                        }),
                      },
                    ],
                    opacity: itemAnim,
                  }
                ]}
              >
                <View style={{ flexDirection: 'row' }}>
                  <Image
                    source={{ uri: item.image }}
                    style={{ width: 80, height: 80, borderRadius: 12 }}
                    resizeMode="cover"
                  />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontWeight: 'bold', color: Colors[colorScheme].text, fontSize: 18, marginBottom: 4 }}>{item.name}</Text>
                        {/* No description or popular field in Product type, so omit */}
                        {(() => {
                          const avgRating = getProductRating(item.id);
                          return (
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                              <Ionicons name={avgRating > 0 ? "star" : "star-outline"} size={14} color={avgRating > 0 ? "#fbbf24" : (colorScheme === 'dark' ? '#666' : '#aaa')} />
                              <Text style={{ color: avgRating > 0 ? Colors[colorScheme].text : (colorScheme === 'dark' ? '#666' : '#aaa'), fontSize: 14, marginLeft: 4, fontWeight: '500' }}>
                                {avgRating > 0 ? avgRating.toFixed(1) : 'No ratings'}
                              </Text>
                            </View>
                          );
                        })()}
                      </View>
                      <View style={{ alignItems: 'flex-end' }}>
                        <Text style={{ fontWeight: 'bold', color: Colors[colorScheme].text, fontSize: 18 }}>R{item.price.toFixed(2)}</Text>
                      </View>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16, justifyContent: 'space-between' }}>
                      {removedProductIds.includes(item.id) ? (
                        <View
                          style={{
                            backgroundColor: '#e53935',
                            borderWidth: 0,
                            paddingHorizontal: 16,
                            paddingLeft: 12, // left padding set to 12
                            height: 33, // increased by 0.5
                            borderRadius: 8,
                            minWidth: 96, // thinner
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'row',
                          }}
                        >
                          <Ionicons name="trash" size={18} color="#fff" style={{ marginRight: 4, marginLeft: 0 }} />
                          <Text style={{ color: '#fff', fontWeight: '800' }}>Removed</Text>
                        </View>
                      ) : null}
                      {!removedProductIds.includes(item.id) && (
                        <TouchableOpacity
                          style={{
                            backgroundColor: isAdded ? '#22c55e' : '#000',
                            borderWidth: 0,
                            paddingHorizontal: 16,
                            paddingVertical: 8,
                            borderRadius: 8,
                            minHeight: 32, // shorter
                            minWidth: 96, // thinner
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: 1,
                          }}
                          onPress={() => {
                            if (!isAdded) {
                              handleAddToCart(item, quantity);
                            } else {
                              handleRemoveFromCart(item);
                            }
                          }}
                        >
                          <Text style={{ color: '#fff', fontWeight: '600' }}>
                            {isAdded ? 'Added!' : 'Add to Cart'}
                          </Text>
                        </TouchableOpacity>
                      )}
                      <View style={{ flexDirection: 'row', alignItems: 'center', opacity: removedProductIds.includes(item.id) ? 0.4 : 1 }}>
                        <TouchableOpacity
                          onPress={() => {
                            if (isAdded) {
                              const newQty = Math.max(0, quantity - 1);
                              updateCartItemQuantity(item.id, newQty);
                              if (newQty === 0) handleRemoveFromCart(item);
                            } else {
                              const newQty = Math.max(1, quantity - 1);
                              setLocalQuantities(q => ({ ...q, [item.id]: newQty }));
                            }
                          }}
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 16,
                            backgroundColor: '#e5e7eb', // match pill grey
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginRight: 4, // less spacing
                            opacity: 1,
                          }}
                        >
                          <Text style={{ fontSize: 18, color: '#000', textAlign: 'center', textAlignVertical: 'center', lineHeight: 32 }}>-</Text>
                        </TouchableOpacity>
                        <Text style={{ fontSize: 18, minWidth: 24, textAlign: 'center', color: '#000' }}>{quantity}</Text>
                        <TouchableOpacity
                          onPress={() => {
                            if (isAdded) {
                              const newQty = quantity + 1;
                              updateCartItemQuantity(item.id, newQty);
                            } else {
                              const newQty = quantity + 1;
                              setLocalQuantities(q => ({ ...q, [item.id]: newQty }));
                            }
                          }}
                          style={{
                            width: 32,
                            height: 32,
                            borderRadius: 16,
                            backgroundColor: '#e5e7eb', // match pill grey
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginLeft: 4, // less spacing
                            opacity: 1,
                          }}
                        >
                          <Text style={{ fontSize: 18, color: '#000', textAlign: 'center', textAlignVertical: 'center', lineHeight: 32 }}>+</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              </Animated.View>
            );
          })}
        </View>
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  vendorInfoCard: {
    marginHorizontal: 16,
    marginTop: -20,
    marginBottom: 16,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  vendorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  vendorLogo: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: '#f0f0f0',
  },
  vendorName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  vendorTagline: {
    fontSize: 14,
    lineHeight: 20,
  },
  vendorStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  statText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  deliveryInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: '500',
  },
  categoriesCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    marginRight: 8,
    borderWidth: 2,
  },
  categoryText: {
    fontWeight: '600',
    fontSize: 14,
  },
  menuItemCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    padding: 16,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 1,
    borderColor: '#f0f0f0',
  },
}); 