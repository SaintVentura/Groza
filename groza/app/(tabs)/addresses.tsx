import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
  Modal,
  TextInput,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from 'react-native';
import { useScrollPreservation } from '../../hooks/useScrollPreservation';
import { useFocusEffect } from '@react-navigation/native';
import { useStore, Address } from '@/store/useStore';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';

export default function AddressesScreen() {
  const colorSchemeRaw = useColorScheme();
  const colorScheme = colorSchemeRaw === 'dark' ? 'dark' : 'light';
  const { addresses, addAddress, removeAddress, setDefaultAddress } = useStore();
  const params = useLocalSearchParams();
  const [showAddModal, setShowAddModal] = useState(params.fromSignup === 'true');
  
  // Auto-open modal if coming from signup
  useFocusEffect(
    React.useCallback(() => {
      if (params.fromSignup === 'true' && addresses.length === 0) {
        setShowAddModal(true);
      }
    }, [params.fromSignup, addresses.length])
  );
  const [newAddress, setNewAddress] = useState({
    label: '',
    street: '',
    city: '',
    postalCode: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(24)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;
  const isFirstLoad = useRef(true);
  const { scrollViewRef, handleScroll } = useScrollPreservation('addresses');

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
    router.push('/(tabs)/profile');
  };

  const handleSetDefault = (id: string) => {
    setDefaultAddress(id);
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Address', 'Are you sure you want to delete this address?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          removeAddress(id);
        },
      },
    ]);
  };

  const handleAddAddress = () => {
    if (!newAddress.label || !newAddress.street || !newAddress.city) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    const address: Address = {
      id: Date.now().toString(),
      ...newAddress,
      isDefault: addresses.length === 0,
    };
    addAddress(address);
    setNewAddress({ label: '', street: '', city: '', postalCode: '' });
    setShowAddModal(false);
    if (params.fromSignup === 'true') {
      // Navigate to home after adding first address from signup
      router.replace('/(tabs)');
    } else {
      Alert.alert('Success', 'Address added successfully!');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <Animated.View
        style={[
          { flex: 1 },
          {
            transform: [{ translateY: slideAnim }],
            opacity: fadeAnim,
          },
        ]}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Ionicons name="arrow-back" size={24} color={Colors[colorScheme].text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: Colors[colorScheme].text }]}>
            Delivery Addresses
          </Text>
        </View>

        <ScrollView
          ref={scrollViewRef as any}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {addresses.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="location-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>No addresses saved</Text>
              <Text style={styles.emptySubtext}>Add your first delivery address</Text>
            </View>
          ) : (
            <View style={styles.addressesContainer}>
              {addresses.map((address, index) => (
                <View key={address.id} style={styles.addressCard}>
                  <View style={styles.addressHeader}>
                    <View style={styles.addressLabelContainer}>
                      <Ionicons
                        name={address.label === 'Home' ? 'home' : 'briefcase'}
                        size={20}
                        color="#000"
                      />
                      <Text style={styles.addressLabel}>{address.label}</Text>
                      {address.isDefault && (
                        <View style={styles.defaultBadge}>
                          <Text style={styles.defaultBadgeText}>Default</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.addressActions}>
                      {!address.isDefault && (
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => handleSetDefault(address.id)}
                        >
                          <Ionicons name="star-outline" size={20} color="#000" />
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => handleDelete(address.id)}
                      >
                        <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                      </TouchableOpacity>
                    </View>
                  </View>
                  <Text style={styles.addressStreet}>{address.street}</Text>
                  <Text style={styles.addressCity}>{address.city}</Text>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Ionicons name="add" size={24} color="#fff" />
            <Text style={styles.addButtonText}>Add New Address</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Add Address Modal */}
        <Modal
          visible={showAddModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowAddModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add New Address</Text>
                <TouchableOpacity onPress={() => setShowAddModal(false)}>
                  <Ionicons name="close" size={24} color="#000" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Label (e.g., Home, Work)</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Home"
                    value={newAddress.label}
                    onChangeText={(text) => setNewAddress({ ...newAddress, label: text })}
                    placeholderTextColor="#999"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Search Address</Text>
                  {(() => {
                    const GOOGLE_PLACES_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY || '';
                    const hasValidApiKey = GOOGLE_PLACES_API_KEY && GOOGLE_PLACES_API_KEY !== 'YOUR_GOOGLE_PLACES_API_KEY' && GOOGLE_PLACES_API_KEY.length > 0;
                    
                    if (!hasValidApiKey) {
                      // Fallback to regular TextInput if API key is not configured
                      return (
                        <TextInput
                          style={styles.textInput}
                          placeholder="Start typing your address..."
                          value={searchQuery}
                          onChangeText={(text) => {
                            setSearchQuery(text);
                            if (text && !newAddress.street) {
                              setNewAddress({ ...newAddress, street: text });
                            }
                          }}
                          placeholderTextColor="#999"
                          autoComplete="street-address"
                          textContentType="fullStreetAddress"
                          returnKeyType="next"
                        />
                      );
                    }
                    
                    return (
                      <GooglePlacesAutocomplete
                        placeholder="Start typing your address..."
                        onPress={(placeData, details = null) => {
                          try {
                            // Extract address components
                            const street = details?.formatted_address || placeData?.description || '';
                            const city = details?.address_components?.find((comp: any) => 
                              comp?.types?.includes('locality') || comp?.types?.includes('administrative_area_level_1')
                            )?.long_name || '';
                            const postalCode = details?.address_components?.find((comp: any) => 
                              comp?.types?.includes('postal_code')
                            )?.long_name || '';
                            
                            setNewAddress({
                              ...newAddress,
                              street: street,
                              city: city,
                              postalCode: postalCode
                            });
                            setSearchQuery(street);
                          } catch (error) {
                            console.log('Error processing address:', error);
                          }
                        }}
                        query={{
                          key: GOOGLE_PLACES_API_KEY,
                          language: 'en',
                          components: 'country:za', // Restrict to South Africa
                        }}
                        fetchDetails={true}
                        onFail={(error) => {
                          console.log('Google Places error:', error);
                        }}
                        requestUrl={{
                          useOnPlatform: 'web',
                          url: 'https://maps.googleapis.com/maps/api/place/autocomplete/json',
                        }}
                        styles={{
                          textInputContainer: {
                            borderWidth: 1,
                            borderColor: '#d1d5db',
                            borderRadius: 12,
                            backgroundColor: '#fff',
                          },
                          textInput: {
                            height: 50,
                            color: '#000',
                            fontSize: 16,
                            paddingHorizontal: 16,
                          },
                          listView: {
                            backgroundColor: '#fff',
                            borderRadius: 12,
                            marginTop: 8,
                            elevation: 3,
                            shadowColor: '#000',
                            shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.1,
                            shadowRadius: 4,
                          },
                          row: {
                            padding: 12,
                            borderBottomWidth: 1,
                            borderBottomColor: '#f0f0f0',
                          },
                          description: {
                            color: '#000',
                            fontSize: 14,
                          },
                        }}
                        textInputProps={{
                          value: searchQuery,
                          onChangeText: (text) => setSearchQuery(text),
                        }}
                        enablePoweredByContainer={false}
                        debounce={300}
                      />
                    );
                  })()}
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Street Address</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="123 Main Street (auto-filled from search)"
                    value={newAddress.street}
                    onChangeText={(text) => setNewAddress({ ...newAddress, street: text })}
                    placeholderTextColor="#999"
                    editable={true}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>City</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="Johannesburg (auto-filled from search)"
                    value={newAddress.city}
                    onChangeText={(text) => setNewAddress({ ...newAddress, city: text })}
                    placeholderTextColor="#999"
                    editable={true}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Postal Code</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="2000 (auto-filled from search)"
                    value={newAddress.postalCode}
                    onChangeText={(text) => setNewAddress({ ...newAddress, postalCode: text })}
                    keyboardType="numeric"
                    placeholderTextColor="#999"
                  />
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowAddModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={handleAddAddress}>
                  <Text style={styles.saveButtonText}>Save Address</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 80,
    paddingBottom: 20,
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
  addressesContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  addressCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  addressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addressLabelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  addressLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
  },
  defaultBadge: {
    backgroundColor: '#000',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  defaultBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  addressActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    padding: 8,
  },
  addressStreet: {
    fontSize: 16,
    color: '#000',
    marginBottom: 4,
  },
  addressCity: {
    fontSize: 14,
    color: '#666',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    borderRadius: 16,
    paddingVertical: 16,
    marginHorizontal: 20,
    marginTop: 20,
    gap: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#999',
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  modalBody: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#f8f9fa',
  },
  modalFooter: {
    flexDirection: 'row',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#000',
    alignItems: 'center',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
});

