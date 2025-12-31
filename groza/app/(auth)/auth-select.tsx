import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from 'react-native';

export default function AuthSelectScreen() {
  const colorSchemeRaw = useColorScheme();
  const colorScheme = colorSchemeRaw === 'dark' ? 'dark' : 'light';
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Logo/Brand */}
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>GROZA</Text>
          <Text style={[styles.tagline, { color: colorScheme === 'dark' ? '#aaa' : '#666' }]}>
            Fresh groceries from local vendors
          </Text>
        </View>

        {/* Options */}
        <View style={styles.optionsContainer}>
          <TouchableOpacity
            style={[styles.optionButton, styles.signupButton]}
            onPress={() => router.push('/(auth)/onboarding')}
            activeOpacity={0.8}
          >
            <Ionicons name="person-add-outline" size={24} color="#fff" style={styles.buttonIcon} />
            <Text style={styles.signupButtonText}>Sign Up</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.optionButton, styles.loginButton]}
            onPress={() => router.push('/(auth)/login')}
            activeOpacity={0.8}
          >
            <Ionicons name="log-in-outline" size={24} color="#000" style={styles.buttonIcon} />
            <Text style={styles.loginButtonText}>Log In</Text>
          </TouchableOpacity>
        </View>

        {/* Continue as Guest */}
        <TouchableOpacity
          style={styles.guestButton}
          onPress={() => router.replace('/(tabs)')}
          activeOpacity={0.7}
        >
          <Text style={[styles.guestButtonText, { color: colorScheme === 'dark' ? '#aaa' : '#666' }]}>
            Continue as Guest
          </Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  content: {
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 80,
  },
  logo: {
    fontSize: 48,
    fontWeight: '800',
    letterSpacing: 2,
    color: '#000',
    marginBottom: 12,
  },
  tagline: {
    fontSize: 16,
    textAlign: 'center',
  },
  optionsContainer: {
    width: '100%',
    gap: 16,
    marginBottom: 24,
  },
  optionButton: {
    width: '100%',
    paddingVertical: 18,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  signupButton: {
    backgroundColor: '#000',
  },
  loginButton: {
    backgroundColor: '#fff',
    borderWidth: 2,
    borderColor: '#000',
  },
  buttonIcon: {
    marginRight: 12,
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  loginButtonText: {
    color: '#000',
    fontSize: 18,
    fontWeight: '600',
  },
  guestButton: {
    paddingVertical: 12,
  },
  guestButtonText: {
    fontSize: 16,
    fontWeight: '500',
  },
});




