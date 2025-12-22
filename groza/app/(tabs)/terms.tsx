import React, { useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from 'react-native';
import { useScrollPreservation } from '../../hooks/useScrollPreservation';
import { useFocusEffect } from '@react-navigation/native';

export default function TermsScreen() {
  const colorSchemeRaw = useColorScheme();
  const colorScheme = colorSchemeRaw === 'dark' ? 'dark' : 'light';
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(24)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;
  const { scrollViewRef, handleScroll } = useScrollPreservation('terms');

  useFocusEffect(
    React.useCallback(() => {
      slideAnim.setValue(100);
      fadeAnim.setValue(0);
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
      ]).start();
    }, [slideAnim, fadeAnim, translateY])
  );

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
      router.push('/(tabs)/profile');
    });
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
            Terms of Service
          </Text>
        </View>

        <ScrollView
          ref={scrollViewRef as any}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
            <Text style={styles.text}>
              By accessing and using the Groza app, you accept and agree to be bound by the terms and provision of this agreement.
            </Text>

            <Text style={styles.sectionTitle}>2. Use License</Text>
            <Text style={styles.text}>
              Permission is granted to temporarily use Groza for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title.
            </Text>

            <Text style={styles.sectionTitle}>3. User Account</Text>
            <Text style={styles.text}>
              You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
            </Text>

            <Text style={styles.sectionTitle}>4. Orders and Payments</Text>
            <Text style={styles.text}>
              All orders are subject to vendor availability. Payment is required at the time of delivery. Groza reserves the right to refuse or cancel any order.
            </Text>

            <Text style={styles.sectionTitle}>5. Delivery</Text>
            <Text style={styles.text}>
              Delivery times are estimates and may vary. Groza is not responsible for delays caused by vendors or delivery partners.
            </Text>

            <Text style={styles.sectionTitle}>6. Limitation of Liability</Text>
            <Text style={styles.text}>
              Groza shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use of the service.
            </Text>

            <Text style={styles.sectionTitle}>7. Changes to Terms</Text>
            <Text style={styles.text}>
              Groza reserves the right to modify these terms at any time. Your continued use of the app constitutes acceptance of any changes.
            </Text>

            <Text style={styles.lastUpdated}>Last updated: {new Date().toLocaleDateString()}</Text>
          </View>
        </ScrollView>
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
  content: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 24,
    marginBottom: 12,
  },
  text: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
    marginBottom: 16,
  },
  lastUpdated: {
    fontSize: 14,
    color: '#999',
    marginTop: 32,
    fontStyle: 'italic',
  },
});


