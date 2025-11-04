import React, { useState } from 'react';
import { View, Text, Switch, StyleSheet, Animated, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { navigateBack } from '../../utils/navigation';
import { useScrollPreservation } from '../../hooks/useScrollPreservation';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

export default function NotificationsScreen() {
  const colorSchemeRaw = useColorScheme();
  const colorScheme = colorSchemeRaw === 'dark' ? 'dark' : 'light';
  const [pushEnabled, setPushEnabled] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [smsEnabled, setSMSEnabled] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const translateY = React.useRef(new Animated.Value(24)).current;
  const slideAnim = React.useRef(new Animated.Value(100)).current;
  const { scrollViewRef, handleScroll } = useScrollPreservation('notifications');

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
      router.push('/(tabs)/profile');
    });
  };

  useFocusEffect(
    React.useCallback(() => {
      // Slide up animation
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

      return () => {
        // Cleanup animation on unmount
        slideAnim.setValue(100);
        fadeAnim.setValue(0);
      };
    }, [slideAnim, fadeAnim, translateY])
  );

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
        <View style={styles.cartHeadingContainer}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={handleBackPress}
          >
            <Ionicons name="arrow-back" size={24} color={Colors[colorScheme].text} />
          </TouchableOpacity>
          <Text style={[styles.cartHeading, { color: Colors[colorScheme].text }]}>Notifications</Text>
        </View>
      <ScrollView ref={scrollViewRef as any} onScroll={handleScroll} scrollEventThrottle={16} contentContainerStyle={{ paddingBottom: 40 }}>
      <View style={styles.section}>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.label, { color: Colors[colorScheme].text }]}>Push Notifications</Text>
            <Text style={[styles.description, { color: colorScheme === 'dark' ? '#9ca3af' : '#6b7280' }]}>Receive real-time alerts about orders, promotions, and important updates.</Text>
          </View>
          <Switch value={pushEnabled} onValueChange={setPushEnabled} />
        </View>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.label, { color: Colors[colorScheme].text }]}>Email Notifications</Text>
            <Text style={[styles.description, { color: colorScheme === 'dark' ? '#9ca3af' : '#6b7280' }]}>Get receipts, order summaries, and occasional news delivered to your inbox.</Text>
          </View>
          <Switch value={emailEnabled} onValueChange={setEmailEnabled} />
        </View>
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={[styles.label, { color: Colors[colorScheme].text }]}>SMS Notifications</Text>
            <Text style={[styles.description, { color: colorScheme === 'dark' ? '#9ca3af' : '#6b7280' }]}>Get time‑sensitive texts for delivery status and driver arrival.</Text>
          </View>
          <Switch value={smsEnabled} onValueChange={setSMSEnabled} />
        </View>
      </View>
      </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  cartHeadingContainer: {
    paddingHorizontal: 20,
    paddingTop: 80,
    paddingBottom: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  cartHeading: {
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: -1,
  },
  backButton: {
    marginRight: 16,
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
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
  section: {
    marginTop: 32,
    paddingHorizontal: 20,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 18,
    fontWeight: '500',
  },
  description: {
    fontSize: 13,
    marginTop: 4,
    lineHeight: 18,
  },
}); 