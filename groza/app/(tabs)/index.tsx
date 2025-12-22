import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  FlatList,
  Alert,
  StyleSheet,
  Dimensions,
  Platform,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useStore } from '@/store/useStore';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from 'react-native';
import { vendors } from '@/constants/Vendors';
import MapView, { Marker } from 'react-native-maps';
import type { Vendor } from '@/constants/Vendors';
import { useFocusEffect } from '@react-navigation/native';
import { useScrollPreservation } from '../../hooks/useScrollPreservation';

const { width } = Dimensions.get('window');

const getVendorImage = () =>
  Platform.OS === 'web'
    ? { uri: '/assets/images/home-logo.png' }
    : require('../../assets/images/home-logo.png');

// Mock data for street vendors
const featuredVendors = [
  {
    id: '1',
    name: 'Fresh Veggie Stand',
    produce: 'Organic Vegetables',
    rating: 4.9,
    deliveryTime: '15-25 min',
    deliveryFee: 'R19.99',
    image: getVendorImage(),
    minOrder: 'R100',
    isOpen: true,
  },
  {
    id: '2',
    name: 'Fruit Cart',
    produce: 'Seasonal Fruits',
    rating: 4.8,
    deliveryTime: '20-30 min',
    deliveryFee: 'R24.99',
    image: getVendorImage(),
    minOrder: 'R80',
    isOpen: true,
  },
  {
    id: '3',
    name: 'Local Greens',
    produce: 'Leafy Greens',
    rating: 4.7,
    deliveryTime: '10-20 min',
    deliveryFee: 'R14.99',
    image: getVendorImage(),
    minOrder: 'R120',
    isOpen: true,
  },
  {
    id: '4',
    name: 'Farm Fresh',
    produce: 'Mixed Groceries',
    rating: 4.9,
    deliveryTime: '25-35 min',
    deliveryFee: 'R29.99',
    image: getVendorImage(),
    minOrder: 'R150',
    isOpen: true,
  },
];

const CARD_VARIANTS = ['imageDominant', 'infoDominant', 'offer', 'minimal', 'review', 'banner'];

type DemoPillPosition = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'centerTop' | 'centerBottom';
function DemoPill({ position = 'topLeft' }: { position?: DemoPillPosition }) {
  let style: any = { position: 'absolute', zIndex: 10, backgroundColor: 'red', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 };
  if (position === 'topLeft') style = { ...style, top: 12, left: 12 };
  if (position === 'topRight') style = { ...style, top: 12, right: 12 };
  if (position === 'bottomLeft') style = { ...style, bottom: 12, left: 12 };
  if (position === 'bottomRight') style = { ...style, bottom: 12, right: 12 };
  if (position === 'centerTop') style = { ...style, top: 12, left: '50%', transform: [{ translateX: -32 }] };
  if (position === 'centerBottom') style = { ...style, bottom: 12, left: '50%', transform: [{ translateX: -32 }] };
  return (
    <View style={style}>
      <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>DEMO</Text>
    </View>
  );
}

function getCardVariant(index: number) {
  return CARD_VARIANTS[index % CARD_VARIANTS.length];
}

type VendorCardProps = { item: Vendor, index: number, getVendorRating: (vendorId: string, productIds: string[]) => number, isAuthenticated: boolean };
function VendorCard({ item, index, getVendorRating, isAuthenticated }: VendorCardProps) {
  const variant = getCardVariant(index);
  const productIds = item.products.map(p => p.id);
  const calculatedRating = getVendorRating(item.id, productIds);
  const displayRating = calculatedRating > 0 ? calculatedRating.toFixed(1) : item.rating.toFixed(1);
  // Image-dominant
  if (variant === 'imageDominant') {
    return (
      <TouchableOpacity style={[styles.vendorCard, { height: 260, width: '100%', maxWidth: 800, alignSelf: 'center' }]}
        onPress={() => router.push(`/restaurant/${item.id}?from=home`)}>
        <DemoPill position="topRight" />
        <Image source={{ uri: item.image }} style={{ width: '100%', height: 160, borderRadius: 16 }} resizeMode="cover" />
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12 }}>
          <Text style={styles.vendorName}>{item.name}</Text>
          <View style={styles.ratingBadge}><Ionicons name="star" size={12} color="#FFD700" /><Text style={styles.ratingText}>{displayRating}</Text></View>
        </View>
        <Text style={styles.vendorTagline}>{item.tagline}</Text>
        {isAuthenticated && (
          <Text style={styles.vendorDelivery}>{item.deliveryEstimate} • {item.deliveryFee}</Text>
        )}
      </TouchableOpacity>
    );
  }
  // Info-dominant
  if (variant === 'infoDominant') {
    return (
      <TouchableOpacity style={[styles.vendorCard, { flexDirection: 'row', height: 120, width: '100%', maxWidth: 800, alignSelf: 'center' }]}
        onPress={() => router.push(`/restaurant/${item.id}?from=home`)}>
        <DemoPill position="topRight" />
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text style={styles.vendorName}>{item.name}</Text>
          <Text style={styles.vendorTagline}>{item.tagline}</Text>
          {isAuthenticated && (
            <Text style={styles.vendorDelivery}>{item.deliveryEstimate} • {item.deliveryFee}</Text>
          )}
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
            <View style={styles.ratingBadge}><Ionicons name="star" size={12} color="#FFD700" /><Text style={styles.ratingText}>{displayRating}</Text></View>
          </View>
        </View>
        <Image source={{ uri: item.image }} style={{ width: 100, height: 100, borderRadius: 16, marginLeft: 12 }} resizeMode="cover" />
      </TouchableOpacity>
    );
  }
  // Offer
  if (variant === 'offer') {
    return (
      <TouchableOpacity style={[styles.vendorCard, { borderWidth: 2, borderColor: '#FF3B30', backgroundColor: '#fff0f0', width: '100%', maxWidth: 800, alignSelf: 'center' }]}
        onPress={() => router.push(`/restaurant/${item.id}?from=home`)}>
        <DemoPill position="topRight" />
        <Text style={[styles.vendorName, { color: '#FF3B30' }]}>{item.name}</Text>
        <Text style={styles.vendorTagline}>{item.tagline}</Text>
        <Text style={{ color: '#FF3B30', fontWeight: 'bold', marginTop: 8 }}>Special Offer: Free delivery today!</Text>
        <Image source={{ uri: item.image }} style={{ width: '100%', height: 100, borderRadius: 16, marginTop: 8 }} resizeMode="cover" />
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
          <View style={styles.ratingBadge}><Ionicons name="star" size={12} color="#FFD700" /><Text style={styles.ratingText}>{displayRating}</Text></View>
          {isAuthenticated && (
            <Text style={styles.vendorDelivery}> • {item.deliveryEstimate} • {item.deliveryFee}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  }
  // Minimal
  if (variant === 'minimal') {
    return (
      <TouchableOpacity style={[styles.vendorCard, { backgroundColor: '#f8f9fa', height: 100, flexDirection: 'row', alignItems: 'center', width: '100%', maxWidth: 800, alignSelf: 'center' }]}
        onPress={() => router.push(`/restaurant/${item.id}?from=home`)}>
        <DemoPill position="topRight" />
        <Image source={{ uri: item.image }} style={{ width: 80, height: 80, borderRadius: 16, marginRight: 16 }} resizeMode="cover" />
        <View>
          <Text style={styles.vendorName}>{item.name}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
            <View style={styles.ratingBadge}><Ionicons name="star" size={12} color="#FFD700" /><Text style={styles.ratingText}>{displayRating}</Text></View>
            {isAuthenticated && (
              <Text style={styles.vendorDelivery}> • {item.deliveryEstimate}</Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }
  // Review
  if (variant === 'review') {
    return (
      <TouchableOpacity style={[styles.vendorCard, { backgroundColor: '#fff', borderWidth: 1, borderColor: '#eee', height: 160, width: '100%', maxWidth: 800, alignSelf: 'center' }]}
        onPress={() => router.push(`/restaurant/${item.id}?from=home`)}>
        <DemoPill position="topRight" />
        <Text style={styles.vendorName}>{item.name}</Text>
        <Text style={styles.vendorTagline}>{item.tagline}</Text>
        <Text style={{ color: '#888', fontStyle: 'italic', marginTop: 8 }}>
          "Best produce in town! Always fresh and affordable."
        </Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 8 }}>
          <View style={styles.ratingBadge}><Ionicons name="star" size={12} color="#FFD700" /><Text style={styles.ratingText}>{displayRating}</Text></View>
          {isAuthenticated && (
            <Text style={styles.vendorDelivery}> • {item.deliveryEstimate} • {item.deliveryFee}</Text>
          )}
        </View>
      </TouchableOpacity>
    );
  }
  // Banner
  return (
    <TouchableOpacity style={[styles.vendorCard, { backgroundColor: '#e0f7fa', height: 180, flexDirection: 'row', alignItems: 'center', width: '100%', maxWidth: 800, alignSelf: 'center' }]}
      onPress={() => router.push(`/restaurant/${item.id}`)}>
      <DemoPill position="topRight" />
      <Image source={{ uri: item.banner }} style={{ width: 120, height: 120, borderRadius: 16, marginRight: 16 }} resizeMode="cover" />
      <View style={{ flex: 1 }}>
        <Text style={[styles.vendorName, { color: '#00796b' }]}>{item.name}</Text>
        <Text style={styles.vendorTagline}>{item.tagline}</Text>
        {isAuthenticated && (
          <Text style={styles.vendorDelivery}>{item.deliveryEstimate} • {item.deliveryFee}</Text>
        )}
        <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
          <View style={styles.ratingBadge}><Ionicons name="star" size={12} color="#FFD700" /><Text style={styles.ratingText}>{displayRating}</Text></View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function HomeScreen() {
  const [region, setRegion] = React.useState({
    latitude: -26.2041,
    longitude: 28.0473,
    latitudeDelta: 0.04,
    longitudeDelta: 0.04,
  });
  const [deliveryLocation, setDeliveryLocation] = React.useState<{ latitude: number; longitude: number } | null>(null);
  const [pickupSelected, setPickupSelected] = React.useState(false);
  const [selectedDeliveryType, setSelectedDeliveryType] = useState<'pickup' | 'delivery' | null>(null);
  const [selectedGroceryTypes, setSelectedGroceryTypes] = useState<Array<'fruits' | 'vegetables'>>([]);
  const [selectedSorts, setSelectedSorts] = useState<Array<{type: string, direction: 'asc' | 'desc'}>>([]);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const { user, isAuthenticated, getVendorRating } = useStore();
  const colorSchemeRaw = useColorScheme();
  const colorScheme = colorSchemeRaw === 'dark' ? 'dark' : 'light';
  
  // Add scroll preservation for home screen
  const { scrollViewRef, handleScroll } = useScrollPreservation('home');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(24)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;
  const dropdownAnim = useRef(new Animated.Value(0)).current;
  const isFirstLoad = useRef(true);

  useFocusEffect(
    React.useCallback(() => {
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
        slideAnim.setValue(100);
        fadeAnim.setValue(0);
      };
    }, [slideAnim, fadeAnim, translateY])
  );

  // Animate dropdown
  useEffect(() => {
    Animated.timing(dropdownAnim, {
      toValue: showFilterDropdown ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [showFilterDropdown]);

  // Filter and sort vendors
  const filteredAndSortedVendors = React.useMemo(() => {
    let filtered = [...vendors];

    // Delivery type filter
    if (selectedDeliveryType === 'pickup') {
      filtered = filtered.filter(v => v.offersPickup);
    } else if (selectedDeliveryType === 'delivery') {
      filtered = filtered.filter(v => v.offersDelivery);
    }

    // Grocery type filter
    if (selectedGroceryTypes.length > 0) {
      filtered = filtered.filter(vendor => {
        const productCategories = vendor.products.map(p => p.category.toLowerCase());
        return selectedGroceryTypes.some(type => 
          productCategories.includes(type)
        );
      });
    }

    // Sort - apply multiple sorts in sequence
    // Filter out time and distance sorts if not authenticated
    const activeSorts = isAuthenticated 
      ? selectedSorts 
      : selectedSorts.filter(s => s.type !== 'time' && s.type !== 'distance');
    
    if (activeSorts.length > 0) {
      filtered = [...filtered].sort((a, b) => {
        for (const sort of activeSorts) {
          let comparison = 0;
          
          if (sort.type === 'rating') {
            comparison = sort.direction === 'asc'
              ? a.rating - b.rating
              : b.rating - a.rating;
          } else if (sort.type === 'distance') {
            const distA = parseFloat(a.distance.replace(' km', ''));
            const distB = parseFloat(b.distance.replace(' km', ''));
            comparison = sort.direction === 'asc' ? distA - distB : distB - distA;
          } else if (sort.type === 'time') {
            const timeA = parseInt(a.deliveryEstimate.split('–')[0]);
            const timeB = parseInt(b.deliveryEstimate.split('–')[0]);
            comparison = sort.direction === 'asc' ? timeA - timeB : timeB - timeA;
          }
          
          // If this sort criteria shows a difference, return it
          // Otherwise continue to next sort criteria
          if (comparison !== 0) {
            return comparison;
          }
        }
        return 0; // All sort criteria are equal
      });
    }

    return filtered;
  }, [selectedDeliveryType, selectedGroceryTypes, selectedSorts]);

  const handleSortToggle = (type: string) => {
    setSelectedSorts((prev) => {
      const existingIndex = prev.findIndex(sort => sort.type === type);
      
      if (existingIndex >= 0) {
        // For rating, distance, and time, just toggle off (on/off behavior)
        return prev.filter((_, idx) => idx !== existingIndex);
      } else {
        // Add new sort with default direction
        // Rating: desc (best to worst), Distance and Time: asc (shortest to most)
        const direction = type === 'distance' || type === 'time' ? 'asc' : 'desc';
        return [...prev, { type, direction }];
      }
    });
  };

  const dropdownHeight = dropdownAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 400],
  });


  // Style for the overlay text (copied from explore page)
  const selectOneTextStyle = {
    fontSize: 12,
    fontWeight: 300,
    color: '#666',
    textAlign: 'center',
    marginTop: 7,
    marginBottom: 10,
    letterSpacing: 1,
  };

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <ScrollView 
        ref={scrollViewRef}
        style={[styles.container, { backgroundColor: '#fff', flex: 1 }]} 
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Header */}
        <View 
          style={[
            styles.header, 
            { backgroundColor: Colors[colorScheme].background },
          ]}
        > 
          <View style={styles.headerTop}>
            <View style={styles.logoSection}>
              <Text style={styles.modernLogo}>Home</Text>
            </View>
            <TouchableOpacity
              style={styles.mapButton}
              onPress={() => router.push('/(tabs)/map')}
            >
              <Ionicons name="map-outline" size={24} color="#000" />
            </TouchableOpacity>
          </View>
          <View style={styles.searchRow}>
            <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color={colorScheme === 'dark' ? Colors.dark.icon : Colors.light.icon} />
              <TextInput
                style={[styles.searchInput, { color: Colors[colorScheme].text }]}
                placeholder="Search fruits, vegetables..."
                placeholderTextColor={colorScheme === 'dark' ? '#888' : '#999'}
                value={''}
                onChangeText={() => {}}
              />
            </View>
            <TouchableOpacity
              style={[
                styles.filterButton,
                showFilterDropdown && styles.filterButtonActive,
              ]}
              onPress={() => setShowFilterDropdown(!showFilterDropdown)}
            >
              <Ionicons 
                name={showFilterDropdown ? "close" : "options"} 
                size={24} 
                color={showFilterDropdown ? "#fff" : "#000"} 
              />
              {(selectedDeliveryType || selectedGroceryTypes.length > 0 || selectedSorts.length > 0) && (
                <View style={styles.filterBadge} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Filter Dropdown */}
        <Animated.View
          style={[
            styles.filterDropdown,
            {
              maxHeight: dropdownHeight,
              opacity: dropdownAnim,
            },
          ]}
        >
          <ScrollView style={styles.filterContent} showsVerticalScrollIndicator={false}>
            {/* Delivery Type */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Delivery Type</Text>
              <View style={styles.filterOptions}>
                <TouchableOpacity
                  style={[
                    styles.filterOption,
                    selectedDeliveryType === 'pickup' && styles.filterOptionActive,
                  ]}
                  onPress={() => setSelectedDeliveryType(selectedDeliveryType === 'pickup' ? null : 'pickup')}
                >
                  <Ionicons
                    name="bag-outline"
                    size={18}
                    color={selectedDeliveryType === 'pickup' ? '#fff' : '#000'}
                  />
                  <Text
                    style={[
                      styles.filterOptionText,
                      selectedDeliveryType === 'pickup' && styles.filterOptionTextActive,
                    ]}
                  >
                    Pickup
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.filterOption,
                    selectedDeliveryType === 'delivery' && styles.filterOptionActive,
                  ]}
                  onPress={() => setSelectedDeliveryType(selectedDeliveryType === 'delivery' ? null : 'delivery')}
                >
                  <Ionicons
                    name="bicycle-outline"
                    size={18}
                    color={selectedDeliveryType === 'delivery' ? '#fff' : '#000'}
                  />
                  <Text
                    style={[
                      styles.filterOptionText,
                      selectedDeliveryType === 'delivery' && styles.filterOptionTextActive,
                    ]}
                  >
                    Delivery
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Grocery Types */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Grocery Type</Text>
              <View style={styles.filterOptions}>
                <TouchableOpacity
                  style={[
                    styles.filterOption,
                    selectedGroceryTypes.includes('fruits') && styles.filterOptionActive,
                  ]}
                  onPress={() => {
                    setSelectedGroceryTypes(prev =>
                      prev.includes('fruits')
                        ? prev.filter(t => t !== 'fruits')
                        : [...prev, 'fruits']
                    );
                  }}
                >
                  <Ionicons
                    name="nutrition-outline"
                    size={18}
                    color={selectedGroceryTypes.includes('fruits') ? '#fff' : '#000'}
                  />
                  <Text
                    style={[
                      styles.filterOptionText,
                      selectedGroceryTypes.includes('fruits') && styles.filterOptionTextActive,
                    ]}
                  >
                    Fruits
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.filterOption,
                    selectedGroceryTypes.includes('vegetables') && styles.filterOptionActive,
                  ]}
                  onPress={() => {
                    setSelectedGroceryTypes(prev =>
                      prev.includes('vegetables')
                        ? prev.filter(t => t !== 'vegetables')
                        : [...prev, 'vegetables']
                    );
                  }}
                >
                  <Ionicons
                    name="leaf-outline"
                    size={18}
                    color={selectedGroceryTypes.includes('vegetables') ? '#fff' : '#000'}
                  />
                  <Text
                    style={[
                      styles.filterOptionText,
                      selectedGroceryTypes.includes('vegetables') && styles.filterOptionTextActive,
                    ]}
                  >
                    Vegetables
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Sort By */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Sort By</Text>
              <View style={styles.sortOptions}>
                <TouchableOpacity
                  style={[
                    styles.sortOption,
                    selectedSorts.some(s => s.type === 'rating') && styles.filterOptionActive,
                  ]}
                  onPress={() => handleSortToggle('rating')}
                >
                  <Ionicons
                    name="star-outline"
                    size={16}
                    color={selectedSorts.some(s => s.type === 'rating') ? '#fff' : '#000'}
                  />
                  <Text
                    style={[
                      styles.filterOptionText,
                      selectedSorts.some(s => s.type === 'rating') && styles.filterOptionTextActive,
                    ]}
                    numberOfLines={1}
                  >
                    Rating
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.sortOption,
                    selectedSorts.some(s => s.type === 'distance') && styles.filterOptionActive,
                    !isAuthenticated && styles.sortOptionDisabled,
                  ]}
                  onPress={() => {
                    if (isAuthenticated) {
                      handleSortToggle('distance');
                    }
                  }}
                  disabled={!isAuthenticated}
                >
                  <Ionicons
                    name="location-outline"
                    size={16}
                    color={
                      !isAuthenticated 
                        ? '#ccc' 
                        : selectedSorts.some(s => s.type === 'distance') ? '#fff' : '#000'
                    }
                  />
                  <Text
                    style={[
                      styles.filterOptionText,
                      selectedSorts.some(s => s.type === 'distance') && styles.filterOptionTextActive,
                      !isAuthenticated && styles.filterOptionTextDisabled,
                    ]}
                    numberOfLines={1}
                  >
                    Distance
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.sortOption,
                    selectedSorts.some(s => s.type === 'time') && styles.filterOptionActive,
                    !isAuthenticated && styles.sortOptionDisabled,
                  ]}
                  onPress={() => {
                    if (isAuthenticated) {
                      handleSortToggle('time');
                    }
                  }}
                  disabled={!isAuthenticated}
                >
                  <Ionicons
                    name="time-outline"
                    size={16}
                    color={
                      !isAuthenticated 
                        ? '#ccc' 
                        : selectedSorts.some(s => s.type === 'time') ? '#fff' : '#000'
                    }
                  />
                  <Text
                    style={[
                      styles.filterOptionText,
                      selectedSorts.some(s => s.type === 'time') && styles.filterOptionTextActive,
                      !isAuthenticated && styles.filterOptionTextDisabled,
                    ]}
                    numberOfLines={1}
                  >
                    Time
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Clear Filters */}
            {(selectedDeliveryType || selectedGroceryTypes.length > 0 || selectedSorts.length > 0) && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => {
                  setSelectedDeliveryType(null);
                  setSelectedGroceryTypes([]);
                  setSelectedSorts([]);
                }}
              >
                <Text style={styles.clearButtonText}>Clear All Filters</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </Animated.View>
        {/* Vendors List */}
        <FlatList
          data={filteredAndSortedVendors}
          renderItem={({ item, index }: { item: Vendor; index: number }) => <VendorCard item={item} index={index} getVendorRating={getVendorRating} isAuthenticated={isAuthenticated} />}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 100, paddingTop: 0 }}
          ItemSeparatorComponent={() => <View style={{ height: 20 }} />}
        />
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    marginBottom: 20, // Space under header
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  modernLogo: {
    fontSize: 42,
    fontWeight: '800',
    color: '#000',
    letterSpacing: -1,
    marginTop: 20,
    marginBottom: 11, // 11px space below heading
  },
  logoSection: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  welcomeText: {
    fontSize: 18,
    color: '#000',
    marginTop: 4,
    opacity: 0.8,
    fontWeight: '500',
    marginBottom: 0,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 0,
    paddingRight: 0, // Ensure no extra padding on right
  },
  mapButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f0f0f0',
    marginTop: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  greeting: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginBottom: 0,
    marginTop: 0, // Increase padding above search bar by 1px
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    letterSpacing: 0,
    color: '#000',
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterButtonActive: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  filterBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
  },
  filterDropdown: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    overflow: 'hidden',
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  sortOptions: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    gap: 8,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#000',
    backgroundColor: '#fff',
    gap: 8,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#000',
    backgroundColor: '#fff',
    gap: 8,
  },
  filterOptionActive: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  filterOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  filterOptionTextActive: {
    color: '#fff',
  },
  sortOptionDisabled: {
    opacity: 0.5,
    borderColor: '#ccc',
    backgroundColor: '#f5f5f5',
  },
  filterOptionTextDisabled: {
    color: '#ccc',
  },
  clearButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    marginTop: 8,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  section: {
    paddingTop: 4,
    paddingBottom: 10,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    backgroundColor: '#000',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    overflow: 'hidden',
    marginTop: -8,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    gap: 0,
  },
  quickActionsRow: {
    flexDirection: 'row',
    width: '100%',
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quickActionCard: {
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  quickActionIcon: {
    fontSize: 24,
    marginBottom: 4,
    color: '#fff',
  },
  quickActionTitle: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  quickActionTitleSelected: {
    color: '#fff',
  },
  categoriesContainer: {
    paddingHorizontal: 20,
  },
  categoryCard: {
    width: 80,
    height: 80,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: '#000',
  },
  categoryIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  categoryName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  categoryCardPlain: {
    width: 80,
    height: 80,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: 'transparent',
  },
  categoryIconPlain: {
    fontSize: 24,
    marginBottom: 4,
    color: '#000',
  },
  categoryNamePlain: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
  },
  restaurantsContainer: {
    paddingHorizontal: 20,
  },
  restaurantCard: {
    width: width * 0.75,
    backgroundColor: '#000', // black background
    borderRadius: 16,
    marginRight: 16,
    // Remove all shadow styles
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 2 },
    // shadowOpacity: 0.1,
    // shadowRadius: 8,
    // elevation: 3,
  },
  restaurantImageContainer: {
    position: 'relative',
  },
  restaurantImage: {
    width: '100%',
    height: 160,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  restaurantBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  restaurantBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  restaurantInfo: {
    padding: 16,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff', // white text
    marginBottom: 4,
  },
  restaurantCuisine: {
    fontSize: 14,
    color: '#bbb', // grey text
    marginBottom: 8,
  },
  restaurantDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  deliveryTime: {
    fontSize: 14,
    color: '#bbb', // grey text
  },
  deliveryFee: {
    fontSize: 14,
    color: '#bbb', // grey text
  },
  recentOrderCard: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  recentOrderInfo: {
    flex: 1,
  },
  recentOrderTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  recentOrderDate: {
    fontSize: 14,
    color: '#666',
  },
  reorderButton: {
    backgroundColor: '#000',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  reorderButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  grozaBrand: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 4,
  },
  featuredVendorsContainer: {
    paddingHorizontal: 20,
  },
  orContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    minWidth: 32,
  },
  orText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
    letterSpacing: 1,
  },
  sortContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 24,
  },
  sortLabel: {
    fontSize: 16,
    color: '#666',
  },
  sortButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  sortButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  sortButtonActive: {
    backgroundColor: '#000',
    borderColor: '#fff',
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  sortButtonTextActive: {
    color: '#fff',
  },
  vendorCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
    position: 'relative',
  },
  vendorName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginRight: 8,
  },
  vendorTagline: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  vendorDelivery: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  ratingBadge: {
    backgroundColor: 'rgba(0,0,0,0.8)',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 0,
  },
  ratingText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 2,
  },
  selectOneText: {
    fontSize: 12,
    fontWeight: '300',
    color: '#666',
    textAlign: 'center',
    marginTop: 7,
    marginBottom: 10,
    letterSpacing: 1,
  },
  quickActionCardSelected: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
});
