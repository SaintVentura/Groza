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
import { useScrollPreservation } from '../../../hooks/useScrollPreservation';
import { useFocusEffect } from '@react-navigation/native';

const categories = ['All', 'Vegetables', 'Fruits'];
const { width } = Dimensions.get('window');

export default function VendorScreen() {
  const { id, from } = useLocalSearchParams();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const { addToCart, removeFromCart, updateCartItemQuantity, cart, favourites = [], addFavourite, removeFavourite } = useStore();
  const colorSchemeRaw = useColorScheme();
  const colorScheme = colorSchemeRaw === 'dark' ? 'dark' : 'light';
  const [removedProductIds, setRemovedProductIds] = useState<string[]>([]);
  // Add localQuantities state for items not in cart
  const [localQuantities, setLocalQuantities] = useState<{ [productId: string]: number }>({});
  const { scrollViewRef, handleScroll } = useScrollPreservation(`restaurant-${id}`);

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
        onScroll={handleScroll}
        scrollEventThrottle={16}
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
          <Text style={[styles.vendorTagline, { color: colorScheme === 'dark' ? '#aaa' : '#666' }]}>{vendorData.tagline}</Text>
          <View style={styles.vendorStats}>
            <View style={styles.statItem}>
              <Ionicons name="star" size={16} color="#fbbf24" />
              <Text style={[styles.statText, { color: Colors[colorScheme].text }]}>{vendorData.rating}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="time-outline" size={16} color={colorScheme === 'dark' ? '#aaa' : '#666'} />
              <Text style={[styles.statText, { color: colorScheme === 'dark' ? '#aaa' : '#666' }]}>{vendorData.deliveryEstimate}</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="location-outline" size={16} color={colorScheme === 'dark' ? '#aaa' : '#666'} />
              <Text style={[styles.statText, { color: colorScheme === 'dark' ? '#aaa' : '#666' }]}>{vendorData.distance}</Text>
            </View>
          </View>
          <View style={styles.deliveryInfo}>
            <Ionicons name="car-outline" size={16} color={colorScheme === 'dark' ? '#aaa' : '#666'} />
            <Text style={[styles.deliveryText, { color: colorScheme === 'dark' ? '#aaa' : '#666' }]}>{vendorData.deliveryFee} delivery</Text>
          </View>
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
                        <Text style={{ fontWeight: 'bold', color: Colors[colorScheme].text, fontSize: 18 }}>{item.name}</Text>
                        {item.description && (
                          <Text style={{ color: colorScheme === 'dark' ? '#aaa' : '#666', fontSize: 14, marginTop: 4 }}>{item.description}</Text>
                        )}
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
  vendorTagline: {
    fontSize: 16,
    marginBottom: 16,
    lineHeight: 22,
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