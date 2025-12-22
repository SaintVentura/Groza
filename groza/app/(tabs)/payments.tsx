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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from 'react-native';
import { useScrollPreservation } from '../../hooks/useScrollPreservation';
import { useFocusEffect } from '@react-navigation/native';

interface PaymentMethod {
  id: string;
  type: 'card' | 'cash';
  label: string;
  last4?: string;
  expiry?: string;
  isDefault: boolean;
}

export default function PaymentsScreen() {
  const colorSchemeRaw = useColorScheme();
  const colorScheme = colorSchemeRaw === 'dark' ? 'dark' : 'light';
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      type: 'cash',
      label: 'Cash on Delivery',
      isDefault: true,
    },
  ]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCard, setNewCard] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    cardholderName: '',
  });
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(24)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;
  const isFirstLoad = useRef(true);
  const { scrollViewRef, handleScroll } = useScrollPreservation('payments');

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
    setPaymentMethods((prev) =>
      prev.map((method) => ({
        ...method,
        isDefault: method.id === id,
      }))
    );
  };

  const handleDelete = (id: string) => {
    const method = paymentMethods.find((m) => m.id === id);
    // Prevent deletion of cash on delivery
    if (method?.type === 'cash') {
      Alert.alert('Cannot Delete', 'Cash on Delivery cannot be removed as a payment method.');
      return;
    }
    Alert.alert('Delete Payment Method', 'Are you sure you want to delete this payment method?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          setPaymentMethods((prev) => prev.filter((method) => method.id !== id));
        },
      },
    ]);
  };

  const handleAddCard = () => {
    if (!newCard.cardNumber || !newCard.expiry || !newCard.cvv || !newCard.cardholderName) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }
    const last4 = newCard.cardNumber.slice(-4);
    const cardType = newCard.cardNumber.startsWith('4') ? 'Visa' : 'Mastercard';
    const method: PaymentMethod = {
      id: Date.now().toString(),
      type: 'card',
      label: cardType,
      last4,
      expiry: newCard.expiry,
      isDefault: paymentMethods.length === 0,
    };
    setPaymentMethods((prev) => [...prev, method]);
    setNewCard({ cardNumber: '', expiry: '', cvv: '', cardholderName: '' });
    setShowAddModal(false);
    Alert.alert('Success', 'Payment method added successfully!');
  };

  const formatCardNumber = (text: string) => {
    const cleaned = text.replace(/\s/g, '');
    const formatted = cleaned.match(/.{1,4}/g)?.join(' ') || cleaned;
    return formatted.slice(0, 19);
  };

  const formatExpiry = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned.length >= 2) {
      return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
    }
    return cleaned;
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
          <Text style={[styles.headerTitle, { color: Colors[colorScheme].text, fontSize: 36 }]}>
            Payment Methods
          </Text>
        </View>

        <ScrollView
          ref={scrollViewRef as any}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {paymentMethods.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="card-outline" size={64} color="#ccc" />
              <Text style={styles.emptyText}>No payment methods saved</Text>
              <Text style={styles.emptySubtext}>Add your first payment method</Text>
            </View>
          ) : (
            <View style={styles.paymentsContainer}>
              {paymentMethods.map((method, index) => (
                <View key={method.id} style={styles.paymentCard}>
                  <View style={styles.paymentHeader}>
                    <View style={styles.paymentInfo}>
                      {method.type === 'card' ? (
                        <Ionicons name="card" size={32} color="#000" />
                      ) : (
                        <Ionicons name="cash" size={32} color="#000" />
                      )}
                      <View style={styles.paymentDetails}>
                        <Text style={styles.paymentLabel}>{method.label}</Text>
                        {method.type === 'card' && (
                          <Text style={styles.paymentNumber}>
                            •••• •••• •••• {method.last4}
                          </Text>
                        )}
                        {method.expiry && (
                          <Text style={styles.paymentExpiry}>Expires {method.expiry}</Text>
                        )}
                      </View>
                    </View>
                    <View style={styles.paymentActions}>
                      {method.isDefault && (
                        <View style={styles.defaultBadge}>
                          <Text style={styles.defaultBadgeText}>Default</Text>
                        </View>
                      )}
                      {!method.isDefault && (
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => handleSetDefault(method.id)}
                        >
                          <Ionicons name="star-outline" size={20} color="#000" />
                        </TouchableOpacity>
                      )}
                      {method.type !== 'cash' && (
                        <TouchableOpacity
                          style={styles.actionButton}
                          onPress={() => handleDelete(method.id)}
                        >
                          <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>
                </View>
              ))}
            </View>
          )}

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => setShowAddModal(true)}
          >
            <Ionicons name="add" size={24} color="#fff" />
            <Text style={styles.addButtonText}>Add Payment Method</Text>
          </TouchableOpacity>
        </ScrollView>

        {/* Add Card Modal */}
        <Modal
          visible={showAddModal}
          transparent={true}
          animationType="slide"
          onRequestClose={() => setShowAddModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Payment Method</Text>
                <TouchableOpacity onPress={() => setShowAddModal(false)}>
                  <Ionicons name="close" size={24} color="#000" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.modalBody}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Cardholder Name</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="John Doe"
                    value={newCard.cardholderName}
                    onChangeText={(text) =>
                      setNewCard({ ...newCard, cardholderName: text })
                    }
                    placeholderTextColor="#999"
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Card Number</Text>
                  <TextInput
                    style={styles.textInput}
                    placeholder="1234 5678 9012 3456"
                    value={newCard.cardNumber}
                    onChangeText={(text) =>
                      setNewCard({ ...newCard, cardNumber: formatCardNumber(text) })
                    }
                    keyboardType="numeric"
                    maxLength={19}
                    placeholderTextColor="#999"
                  />
                </View>

                <View style={styles.row}>
                  <View style={[styles.inputGroup, { flex: 1, marginRight: 8 }]}>
                    <Text style={styles.inputLabel}>Expiry</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="MM/YY"
                      value={newCard.expiry}
                      onChangeText={(text) =>
                        setNewCard({ ...newCard, expiry: formatExpiry(text) })
                      }
                      keyboardType="numeric"
                      maxLength={5}
                      placeholderTextColor="#999"
                    />
                  </View>

                  <View style={[styles.inputGroup, { flex: 1, marginLeft: 8 }]}>
                    <Text style={styles.inputLabel}>CVV</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="123"
                      value={newCard.cvv}
                      onChangeText={(text) =>
                        setNewCard({ ...newCard, cvv: text.replace(/\D/g, '').slice(0, 3) })
                      }
                      keyboardType="numeric"
                      maxLength={3}
                      secureTextEntry
                      placeholderTextColor="#999"
                    />
                  </View>
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => setShowAddModal(false)}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.saveButton} onPress={handleAddCard}>
                  <Text style={styles.saveButtonText}>Add Card</Text>
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
  paymentsContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  paymentCard: {
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
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paymentInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentDetails: {
    marginLeft: 16,
    flex: 1,
  },
  paymentLabel: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  paymentNumber: {
    fontSize: 16,
    color: '#666',
    marginBottom: 2,
    letterSpacing: 1,
  },
  paymentExpiry: {
    fontSize: 14,
    color: '#999',
  },
  paymentActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  defaultBadge: {
    backgroundColor: '#000',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  defaultBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  actionButton: {
    padding: 8,
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
  row: {
    flexDirection: 'row',
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

