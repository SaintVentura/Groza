import React, { useState, useRef, useEffect, useMemo } from 'react';
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
import { useScrollPreservation } from '../../../hooks/useScrollPreservation';
import { useFocusEffect } from '@react-navigation/native';

const categories = ['All', 'Vegetables', 'Fruits'];
const { width } = Dimensions.get('window');

export default function VendorScreen() {
  const { id, from, productId } = useLocalSearchParams();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [highlightedProductId, setHighlightedProductId] = useState<string | null>(null);
  const { addToCart, removeFromCart, updateCartItemQuantity, cart, favourites = [], addFavourite, removeFavourite, isAuthenticated, getProductRating, getVendorRating, addProductRating, productRatings } = useStore();
  
  // Find the vendor by id from the vendors list
  const vendorData = vendors.find(v => v.id === id);
  const productIds = vendorData?.products.map(p => p.id) || [];
  
  // Load ratings for this vendor's products
  useEffect(() => {
    if (productIds.length > 0) {
      const loadRatings = async () => {
        try {
          const { getVendorProductRatings } = await import('@/services/ratings');
          const currentRatings = useStore.getState().productRatings;
          const ratings = await getVendorProductRatings(productIds);
          ratings.forEach((rating) => {
            const exists = currentRatings.some(
              (r) => r.productId === rating.productId && r.customerId === rating.customerId
            );
            if (!exists) {
              useStore.getState().addProductRating(rating);
            }
          });
        } catch (error) {
          console.error('Failed to load ratings:', error);
        }
      };
      loadRatings();
    }
  }, [productIds.join(',')]);
  const colorSchemeRaw = useColorScheme();
  const colorScheme = colorSchemeRaw === 'dark' ? 'dark' : 'light';
  const [removedProductIds, setRemovedProductIds] = useState<string[]>([]);
  // Add localQuantities state for items not in cart
  const [localQuantities, setLocalQuantities] = useState<{ [productId: string]: number }>({});
  const { scrollViewRef, handleScroll } = useScrollPreservation(`restaurant-${id}`);
  const productRefs = useRef<{ [key: string]: View | null }>({});

  // Animation values
  const slideAnim = useRef(new Animated.Value(100)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Handle product highlighting when coming from explore
  useEffect(() => {
    if (productId && vendorData && scrollViewRef.current) {
      // First, reset scroll and category
      scrollViewRef.current?.scrollTo({ y: 0, animated: false });
      setSelectedCategory('All');
      setHighlightedProductId(null);
      
      // Wait a bit for reset to complete, then apply highlighting
      setTimeout(() => {
        const product = vendorData.products.find(p => p.id === productId);
        if (product) {
          // Set category to match product
          setSelectedCategory(product.category);
          setHighlightedProductId(productId);
          
          // Scroll to product after a delay to ensure layout is ready
          setTimeout(() => {
            const productRef = productRefs.current[productId];
            if (productRef && scrollViewRef.current) {
              productRef.measureLayout(
                scrollViewRef.current as any,
                (x, y) => {
                  scrollViewRef.current?.scrollTo({ y: Math.max(0, y - 100), animated: true });
                },
                () => {}
              );
            }
          }, 500);
          
          // Remove highlight after 3 seconds
          setTimeout(() => {
            setHighlightedProductId(null);
          }, 3000);
        }
      }, 100);
    }
  }, [productId, vendorData]);

  // Animation effects
  useFocusEffect(
    React.useCallback(() => {
      // Reset scroll position and filters when page opens
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 0, animated: false });
      }
      setSelectedCategory('All');
      setHighlightedProductId(null);
      
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

      // No product animations - products stay in place

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

  const filteredProducts = useMemo(() => {
    const products = vendorData.products || [];
    if (selectedCategory === 'All') {
      return products;
    }
    return products.filter(item => item.category === selectedCategory);
  }, [selectedCategory, vendorData.products]);

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

  const isFavourite = favourites.some((v) => v.id === vendorData.id);

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
      if (from === 'explore') {
        router.push('/(tabs)/explore');
      } else if (from === 'favourites') {
        router.push('/(tabs)/favourites');
      } else if (from === 'orders') {
        router.push('/(tabs)/orders');
      } else {
        router.push('/(tabs)');
      }
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
        {/* Header with back button and store name */}
        <View style={[styles.headerContainer, { backgroundColor: Colors[colorScheme].background }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBackPress}
        >
          <Ionicons name="arrow-back" size={24} color={Colors[colorScheme].text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: Colors[colorScheme].text }]}>{vendorData.name}</Text>
        <TouchableOpacity
          style={styles.heartButton}
          onPress={() => isFavourite ? removeFavourite(vendorData.id) : addFavourite(vendorData)}
        >
          <Ionicons
            name={isFavourite ? 'heart' : 'heart-outline'}
            size={24}
            color={isFavourite ? '#e11d48' : Colors[colorScheme].text}
          />
        </TouchableOpacity>
      </View>

      <ScrollView 
        ref={scrollViewRef}
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 80 }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        removeClippedSubviews={false}
      >
        <View style={{ position: 'relative', marginTop: 0, paddingTop: 0 }}>
          <Image
            source={{ uri: vendorData.image }}
            style={{ width: '100%', height: 240 }}
            resizeMode="cover"
          />
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
        <View style={{ paddingVertical: 16 }}>
          {/* Show message and icon if no items in selected category */}
          {selectedCategory === 'Vegetables' && filteredProducts.length === 0 && (
            <View style={{ alignItems: 'center', marginVertical: 60 }}>
              <Ionicons name="leaf-outline" size={48} color="#aaa" style={{ marginBottom: 8 }} />
              <Text style={{ color: '#aaa', fontSize: 18, fontWeight: '600' }}>No vegetables here</Text>
            </View>
          )}
          {selectedCategory === 'Fruits' && filteredProducts.length === 0 && (
            <View style={{ alignItems: 'center', marginVertical: 60 }}>
              <Ionicons name="nutrition-outline" size={48} color="#aaa" style={{ marginBottom: 8 }} />
              <Text style={{ color: '#aaa', fontSize: 18, fontWeight: '600' }}>No fruits here</Text>
            </View>
          )}
          {filteredProducts.map((item, index) => {
            const cartItem = cart.find(ci => ci.id === item.id);
            const isAdded = !!cartItem;
            const quantity = isAdded ? cartItem.quantity : (localQuantities[item.id] || 1);
            const isHighlighted = highlightedProductId === item.id;
            
            return (
              <View 
                ref={(ref) => {
                  if (ref) {
                    productRefs.current[item.id] = ref;
                  }
                }}
                key={item.id}
                style={[
                  styles.menuItemCard,
                  { 
                    backgroundColor: isHighlighted ? '#fff8e1' : Colors[colorScheme].background,
                  }
                ]}
                collapsable={false}
                removeClippedSubviews={false}
              >
                <View style={{ flexDirection: 'row' }} collapsable={false}>
                  <Image
                    source={{ uri: item.image }}
                    style={{ width: 96, height: 120, borderRadius: 12 }}
                    resizeMode="cover"
                  />
                  <View style={{ flex: 1, marginLeft: 12 }} collapsable={false}>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontWeight: 'bold', color: Colors[colorScheme].text, fontSize: 18, marginBottom: 4 }}>{item.name}</Text>
                        {item.description && (
                          <Text style={{ color: colorScheme === 'dark' ? '#aaa' : '#666', fontSize: 14, marginBottom: 8 }}>{item.description}</Text>
                        )}
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
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 16, justifyContent: 'space-between' }} collapsable={false}>
                      <View style={{ width: 110, height: 36, alignItems: 'center', justifyContent: 'center' }} collapsable={false}>
                        {removedProductIds.includes(item.id) ? (
                          <View
                            style={{
                              backgroundColor: '#e53935',
                              borderWidth: 0,
                              paddingHorizontal: 12,
                              paddingVertical: 10,
                              borderRadius: 8,
                              width: 110,
                              height: 36,
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexDirection: 'row',
                            }}
                          >
                            <Ionicons name="trash" size={18} color="#fff" style={{ marginRight: 4, marginLeft: 0 }} />
                            <Text style={{ color: '#fff', fontWeight: '800', fontSize: 14 }} numberOfLines={1}>Removed</Text>
                          </View>
                        ) : (
                          <TouchableOpacity
                            style={{
                              backgroundColor: isAdded ? '#22c55e' : '#000',
                              borderWidth: 0,
                              paddingHorizontal: 12,
                              paddingVertical: 10,
                              borderRadius: 8,
                              width: 110,
                              height: 36,
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
                            <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }} numberOfLines={1}>
                              {isAdded ? 'Added!' : 'Add to Cart'}
                            </Text>
                          </TouchableOpacity>
                        )}
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', opacity: removedProductIds.includes(item.id) ? 0.4 : 1, width: 104 }} collapsable={false}>
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
                        <Text style={{ fontSize: 18, width: 24, textAlign: 'center', color: '#000' }}>{quantity}</Text>
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
              </View>
            );
          })}
        </View>
      </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 80,
    paddingBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    marginRight: 16,
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '800',
    letterSpacing: -1,
    flex: 1,
  },
  heartButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
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
    minHeight: 152, // Increased to accommodate all content consistently
  },
}); 