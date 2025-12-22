import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { vendors } from '@/constants/Vendors';
import type { Vendor } from '@/constants/Vendors';
import { useFocusEffect } from '@react-navigation/native';
import { useStore } from '@/store/useStore';

const { width, height } = Dimensions.get('window');

export default function MapScreen() {
  const colorSchemeRaw = useColorScheme();
  const colorScheme = colorSchemeRaw === 'dark' ? 'dark' : 'light';
  const { isAuthenticated, getVendorRating } = useStore();
  const [selectedVendor, setSelectedVendor] = useState<Vendor | null>(null);
  const [region, setRegion] = useState({
    latitude: -26.2041,
    longitude: 28.0473,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  });
  const mapRef = useRef<MapView>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;
  const translateY = useRef(new Animated.Value(24)).current;
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
    }, [slideAnim, fadeAnim, translateY])
  );

  const handleBackPress = () => {
    router.back();
  };

  const handleMarkerPress = (vendor: Vendor) => {
    setSelectedVendor(vendor);
    // Animate card up
    slideAnim.setValue(300);
    Animated.spring(slideAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 50,
      friction: 7,
    }).start();
    // Center map on vendor
    if (mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: vendor.location.latitude,
        longitude: vendor.location.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      });
    }
  };

  const handleVendorCardPress = (vendor: Vendor) => {
    router.push(`/(tabs)/restaurant/${vendor.id}`);
  };

  const handleCloseCard = () => {
    Animated.timing(slideAnim, {
      toValue: 300,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setSelectedVendor(null);
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <Animated.View style={{ flex: 1, transform: [{ translateY: slideAnim }], opacity: fadeAnim }}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Ionicons name="arrow-back" size={24} color={Colors[colorScheme].text} />
          </TouchableOpacity>
          <View style={{ marginLeft: 12 }} />
          <Text style={[styles.headerTitle, { color: Colors[colorScheme].text, textAlign: 'left' }]}>Map View</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Map */}
        <MapView
          ref={mapRef}
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
          style={styles.map}
          initialRegion={region}
          onRegionChangeComplete={setRegion}
          showsUserLocation={true}
          showsMyLocationButton={true}
          toolbarEnabled={false}
        >
          {vendors.map((vendor) => (
            <Marker
              key={vendor.id}
              coordinate={vendor.location}
              onPress={() => handleMarkerPress(vendor)}
            >
              <View style={styles.markerContainer}>
                <View style={styles.marker}>
                  <Ionicons name="storefront" size={20} color="#fff" />
                </View>
                <View style={styles.markerDot} />
              </View>
            </Marker>
          ))}
        </MapView>

        {/* Vendor Info Card */}
        {selectedVendor && (
          <Animated.View
            style={[
              styles.vendorCard,
              {
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            <TouchableOpacity style={styles.closeButton} onPress={handleCloseCard}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.vendorCardContent}
              onPress={() => handleVendorCardPress(selectedVendor)}
              activeOpacity={0.9}
            >
              <View style={styles.vendorHeader}>
                <Image
                  source={{ uri: selectedVendor.image }}
                  style={styles.vendorLogo}
                  resizeMode="cover"
                />
                <View style={styles.vendorInfo}>
                  <Text style={styles.vendorName}>{selectedVendor.name}</Text>
                  <Text style={styles.vendorTagline}>{selectedVendor.tagline}</Text>
                </View>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={16} color="#FFD700" />
                  <Text style={styles.ratingText}>
                    {(() => {
                      const productIds = selectedVendor.products.map(p => p.id);
                      const calculatedRating = getVendorRating(selectedVendor.id, productIds);
                      return calculatedRating > 0 ? calculatedRating.toFixed(1) : selectedVendor.rating.toFixed(1);
                    })()}
                  </Text>
                </View>
              </View>
              {isAuthenticated ? (
                <View style={styles.vendorDetails}>
                  <View style={styles.detailItem}>
                    <Ionicons name="time-outline" size={16} color="#666" />
                    <Text style={styles.detailText}>{selectedVendor.deliveryEstimate}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons name="cash-outline" size={16} color="#666" />
                    <Text style={styles.detailText}>{selectedVendor.deliveryFee}</Text>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons name="location-outline" size={16} color="#666" />
                    <Text style={styles.detailText}>{selectedVendor.distance}</Text>
                  </View>
                </View>
              ) : (
                <View style={[styles.vendorDetails, { paddingVertical: 16, paddingHorizontal: 12, backgroundColor: '#f5f5f5', borderRadius: 8, marginBottom: 20, borderTopWidth: 1, borderBottomWidth: 1, borderColor: '#f0f0f0' }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                    <Ionicons name="information-circle-outline" size={18} color="#666" style={{ marginRight: 8, marginTop: 2 }} />
                    <Text style={{ fontSize: 12, color: '#666', lineHeight: 16, flex: 1 }}>
                      Sign Up to see Delivery Price, Order Time and Distance.
                    </Text>
                  </View>
                </View>
              )}
              <TouchableOpacity style={styles.viewButton}>
                <Text style={styles.viewButtonText}>View Menu</Text>
                <Ionicons name="chevron-forward" size={20} color="#fff" />
              </TouchableOpacity>
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Vendor Count Badge */}
        <View style={styles.vendorCountBadge}>
          <Ionicons name="storefront-outline" size={16} color="#000" />
          <Text style={styles.vendorCountText}>{vendors.length} vendors nearby</Text>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: '#fff',
    zIndex: 10,
  },
  backButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: -1,
    flex: 1,
    textAlign: 'left',
  },
  map: {
    flex: 1,
    width: width,
    height: height,
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  marker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  markerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#000',
    marginTop: -2,
  },
  vendorCard: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 100,
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 101,
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  vendorCardContent: {
    padding: 20,
    paddingTop: 50,
  },
  vendorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  vendorLogo: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: '#f0f0f0',
    marginRight: 12,
  },
  vendorInfo: {
    flex: 1,
  },
  vendorName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  vendorTagline: {
    fontSize: 16,
    color: '#666',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  ratingText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginLeft: 4,
  },
  vendorDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#f0f0f0',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 14,
    color: '#666',
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    borderRadius: 12,
    paddingVertical: 16,
    gap: 8,
  },
  viewButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  vendorCountBadge: {
    position: 'absolute',
    top: 180,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    gap: 8,
    zIndex: 50,
  },
  vendorCountText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
});

