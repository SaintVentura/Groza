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

export default function PrivacyScreen() {
  const colorSchemeRaw = useColorScheme();
  const colorScheme = colorSchemeRaw === 'dark' ? 'dark' : 'light';
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(24)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;
  const { scrollViewRef, handleScroll } = useScrollPreservation('privacy');

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
            Privacy Policy
          </Text>
        </View>

        <ScrollView
          ref={scrollViewRef as any}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <View style={styles.content}>
            <Text style={styles.sectionTitle}>1. Information We Collect</Text>
            <Text style={styles.text}>
              We collect information you provide directly to us, including name, email, phone number, delivery addresses, and payment information.
            </Text>

            <Text style={styles.sectionTitle}>2. How We Use Your Information</Text>
            <Text style={styles.text}>
              We use your information to process orders, communicate with you, improve our services, and send you promotional materials if you opt-in.
            </Text>

            <Text style={styles.sectionTitle}>3. Information Sharing</Text>
            <Text style={styles.text}>
              We share your information with vendors and delivery partners to fulfill your orders. We do not sell your personal information to third parties.
            </Text>

            <Text style={styles.sectionTitle}>4. Data Security</Text>
            <Text style={styles.text}>
              We implement appropriate security measures to protect your personal information. However, no method of transmission over the internet is 100% secure.
            </Text>

            <Text style={styles.sectionTitle}>5. Your Rights</Text>
            <Text style={styles.text}>
              You have the right to access, update, or delete your personal information at any time through your account settings.
            </Text>

            <Text style={styles.sectionTitle}>6. Location Data</Text>
            <Text style={styles.text}>
              We collect location data to provide accurate delivery estimates and show nearby vendors. You can disable location services in your device settings.
            </Text>

            <Text style={styles.sectionTitle}>7. Cookies and Tracking</Text>
            <Text style={styles.text}>
              We use cookies and similar technologies to enhance your experience and analyze app usage.
            </Text>

            <Text style={styles.sectionTitle}>8. Contact Us</Text>
            <Text style={styles.text}>
              If you have questions about this Privacy Policy, please contact us at grozadelivery@gmail.com.
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


