import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Animated,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Switch,
  Keyboard,
  Image,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useStore } from '@/store/useStore';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from 'react-native';
import * as Linking from 'expo-linking';
import { GooglePlacesAutocomplete } from 'react-native-google-places-autocomplete';
import { signUp, checkUsernameAvailability, checkEmailExists, signInWithGoogle, signInWithApple, completeSocialSignUp } from '@/services/auth';

interface OnboardingData {
  phone: string;
  email: string;
  name: string;
  username: string;
  password: string;
  confirmPassword: string;
  address: {
    label: string;
    street: string;
    city: string;
    postalCode: string;
  };
  notificationsEnabled: boolean;
}

export default function OnboardingScreen() {
  const colorSchemeRaw = useColorScheme();
  const colorScheme = colorSchemeRaw === 'dark' ? 'dark' : 'light';
  const { setUser, setAuthenticated } = useStore();
  const scrollViewRef = useRef<ScrollView>(null);
  const emailInputRef = useRef<TextInput>(null);
  
  const [currentStep, setCurrentStep] = useState(0);
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);
  const [showEmailExistsModal, setShowEmailExistsModal] = useState(false);
  const [isSocialSignUp, setIsSocialSignUp] = useState(false);
  
  const [data, setData] = useState<OnboardingData>({
    phone: '',
    email: '',
    name: '',
    username: '',
    password: '',
    confirmPassword: '',
    address: {
      label: '',
      street: '',
      city: '',
      postalCode: '',
    },
    notificationsEnabled: true,
  });

  const steps = [
    { title: 'Welcome to Groza', subtitle: 'Let\'s get you started' },
    { title: 'Phone Number', subtitle: 'We\'ll use this to contact you during delivery' },
    { title: 'Email Address', subtitle: 'Order confirmations will be sent here' },
    { title: 'Your Name', subtitle: 'How should we address you?' },
    { title: 'Username', subtitle: 'Choose a unique username' },
    { title: 'Password', subtitle: 'Create a secure password' },
    { title: 'Delivery Address', subtitle: 'Where should we deliver your orders?' },
    { title: 'Notifications', subtitle: 'Stay updated on your orders' },
    { title: 'Review', subtitle: 'Confirm your details' },
    { title: 'Verify Account', subtitle: 'Enter the code we sent you' },
  ];

  const progress = ((currentStep + 1) / steps.length) * 100;

  // Auto-focus email field when reaching step 2
  useEffect(() => {
    if (currentStep === 2) {
      const timer = setTimeout(() => {
        emailInputRef.current?.focus();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [currentStep]);

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1: // Phone
        const phoneRegex = /^(\+27|0)[6-8][0-9]{8}$/;
        const cleanedPhone = data.phone.replace(/\s/g, '');
        if (!cleanedPhone || !phoneRegex.test(cleanedPhone)) {
          Alert.alert('Invalid Phone', 'Please enter a valid South African phone number');
          return false;
        }
        return true;
      case 2: // Email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!data.email || !emailRegex.test(data.email)) {
          Alert.alert('Invalid Email', 'Please enter a valid email address');
          return false;
        }
        return true;
      case 3: // Name
        if (!data.name.trim() || data.name.trim().length < 2) {
          Alert.alert('Invalid Name', 'Please enter your full name');
          return false;
        }
        return true;
      case 4: // Username
        if (!data.username.trim() || data.username.trim().length < 3) {
          Alert.alert('Invalid Username', 'Username must be at least 3 characters');
          return false;
        }
        // Check username format
        const usernameRegex = /^[a-zA-Z0-9_]+$/;
        if (!usernameRegex.test(data.username.trim())) {
          Alert.alert('Invalid Username', 'Username can only contain letters, numbers, and underscores');
          return false;
        }
        // Username availability check will be done on step 5 (Password step)
        return true;
      case 5: // Password
        // Skip password validation for social sign-ups (Google/Apple)
        if (isSocialSignUp) {
          return true;
        }
        if (!data.password || data.password.length < 6) {
          Alert.alert('Invalid Password', 'Password must be at least 6 characters');
          return false;
        }
        if (data.password !== data.confirmPassword) {
          Alert.alert('Password Mismatch', 'Passwords do not match');
          return false;
        }
        return true;
      case 6: // Address
        if (!data.address.street || !data.address.city) {
          Alert.alert('Incomplete Address', 'Please fill in street address and city');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const result = await signInWithGoogle();
      
      if ('user' in result) {
        // User exists, sign them in
        setUser(result.user);
        setAuthenticated(true);
        router.replace('/(tabs)');
      } else {
        // New user, pre-fill email and name, continue to name step
        setIsSocialSignUp(true);
        setData({
          ...data,
          email: result.email,
          name: result.name,
        });
        setCurrentStep(3); // Go to name step
      }
    } catch (error: any) {
      if (error.message === 'Sign-in cancelled') {
        // User cancelled, ignore
        return;
      }
      Alert.alert('Error', error.message || 'Failed to sign in with Google');
    }
  };

  const handleAppleSignIn = async () => {
    try {
      if (Platform.OS !== 'ios' && Platform.OS !== 'web') {
        Alert.alert('Apple Sign-In', 'Apple Sign-In is only available on iOS devices and web.');
        return;
      }
      
      const result = await signInWithApple();
      
      if ('user' in result) {
        // User exists, sign them in
        setUser(result.user);
        setAuthenticated(true);
        router.replace('/(tabs)');
      } else {
        // New user, pre-fill email and name, continue to name step
        setIsSocialSignUp(true);
        setData({
          ...data,
          email: result.email,
          name: result.name,
        });
        setCurrentStep(3); // Go to name step
      }
    } catch (error: any) {
      if (error.message === 'Sign-in cancelled') {
        // User cancelled, ignore
        return;
      }
      Alert.alert('Error', error.message || 'Failed to sign in with Apple');
    }
  };

  const handleNext = async () => {
    // Skip validation for welcome screen (step 0) and review/OTP screens (steps 8+)
    // Only validate steps 1-6 (phone through address)
    if (currentStep >= 1 && currentStep <= 6) {
      // For email step (step 2), check if email already exists
      if (currentStep === 2) {
        // First validate email format
        if (!validateStep(currentStep)) {
          return;
        }
        
        // Then check if email is already registered
        const emailTrimmed = data.email.trim().toLowerCase();
        if (emailTrimmed) {
          try {
            const emailExists = await checkEmailExists(emailTrimmed);
            if (emailExists) {
              setShowEmailExistsModal(true);
              return;
            }
          } catch (error: any) {
            Alert.alert('Error', error.message || 'Could not check email. Please try again.');
            return;
          }
        }
      } else if (currentStep === 5) {
        // For password step (step 5), check username availability before proceeding
        // Skip password validation for social sign-ups
        if (!isSocialSignUp && !validateStep(currentStep)) {
          return;
        }
        
        // Check if username from step 4 is available
        const usernameTrimmed = data.username.trim();
        if (usernameTrimmed && usernameTrimmed.length >= 3) {
          try {
            const isAvailable = await checkUsernameAvailability(usernameTrimmed);
            if (!isAvailable) {
              Alert.alert('Username is taken', 'Username is taken');
              return;
            }
          } catch (error: any) {
            Alert.alert('Error', error.message || 'Could not check username availability. Please try again.');
            return;
          }
        }
      } else {
        // For other steps, use normal validation
        if (!validateStep(currentStep)) {
          return;
        }
      }
    }
    
    // If moving from step 1 (phone) to step 2 (email), dismiss keyboard first
    if (currentStep === 1) {
      Keyboard.dismiss();
      setTimeout(() => {
        setCurrentStep(2);
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
        // Focus email field after a short delay
        setTimeout(() => {
          emailInputRef.current?.focus();
        }, 300);
      }, 100);
      return;
    }
    
    if (currentStep === 8) {
      // After review, send OTP
      await sendOTP();
      setCurrentStep(9);
    } else if (currentStep < steps.length - 1) {
      let nextStep = currentStep + 1;
      // Skip password step (5) for social sign-ups
      if (isSocialSignUp && nextStep === 5) {
        nextStep = 6; // Skip to address step
      }
      setCurrentStep(nextStep);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      let prevStep = currentStep - 1;
      // Skip password step (5) for social sign-ups when going back
      if (isSocialSignUp && prevStep === 5) {
        prevStep = 4; // Go back to username step
      }
      setCurrentStep(prevStep);
      scrollViewRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  const sendOTP = async () => {
    // Mock OTP sending - in production, this would call your backend
    const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setOtpSent(true);
    
    // In production, send via email/SMS
    Alert.alert(
      'OTP Sent',
      `For demo purposes, your OTP is: ${mockOtp}\n\nIn production, this would be sent to ${data.email} or ${data.phone}`,
      [{ text: 'OK' }]
    );
    
    // Store OTP for verification (in production, this would be on the backend)
    (global as any).__mockOtp = mockOtp;
  };

  const handleVerifyOTP = async () => {
    if (!otpCode || otpCode.length !== 6) {
      Alert.alert('Invalid Code', 'Please enter the 6-digit code');
      return;
    }

    setIsVerifying(true);
    
    try {
      // Mock verification - in production, verify with backend
      const mockOtp = (global as any).__mockOtp;
      if (otpCode === mockOtp || otpCode === '123456') {
        // Complete signup using Firebase
        const cleanedPhone = data.phone.replace(/\s/g, '');
        
        // Check if user is already authenticated (from Google/Apple sign-in)
        const { auth } = await import('@/services/firebase');
        const firebaseUser = auth.currentUser;
        
        let userData;
        if (isSocialSignUp && firebaseUser) {
          // User authenticated via Google/Apple, complete sign-up without password
          userData = await completeSocialSignUp(
            data.name.trim(),
            data.username.trim(),
            cleanedPhone,
            data.notificationsEnabled,
            'customer'
          );
        } else {
          // Regular sign-up with email/password
          userData = await signUp(
            data.email.trim().toLowerCase(),
            data.password,
            data.name.trim(),
            data.username.trim(),
            cleanedPhone,
            data.notificationsEnabled,
            'customer'
          );
        }
        
        setUser(userData);
        setAuthenticated(true);
        
        // Request permissions (gracefully handle Expo Go limitations)
        try {
          const Notifications = await import('expo-notifications');
          if (Notifications?.default?.requestPermissionsAsync || Notifications?.requestPermissionsAsync) {
            const requestFn = Notifications.default?.requestPermissionsAsync || Notifications.requestPermissionsAsync;
            if (typeof requestFn === 'function') {
              await requestFn();
            }
          }
        } catch (error) {
          // Silently fail in Expo Go - notifications require development build
          // Error is expected in Expo Go, so we don't log it
        }
        
        try {
          const Location = await import('expo-location');
          if (Location?.default?.requestForegroundPermissionsAsync || Location?.requestForegroundPermissionsAsync) {
            const requestFn = Location.default?.requestForegroundPermissionsAsync || Location.requestForegroundPermissionsAsync;
            if (typeof requestFn === 'function') {
              await requestFn();
            }
          }
        } catch (error) {
          // Silently fail - location may not be available in all environments
          // Error is expected in Expo Go, so we don't log it
        }
        
        // Add address to store
        const store = useStore.getState();
        store.addAddress({
          id: Date.now().toString(),
          ...data.address,
          isDefault: true,
        });
        
        router.replace('/(tabs)');
      } else {
        Alert.alert('Invalid Code', 'The code you entered is incorrect. Please try again.');
        setIsVerifying(false);
      }
    } catch (error: any) {
      Alert.alert('Sign Up Error', error.message || 'Failed to create account. Please try again.');
      setIsVerifying(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Welcome
        return (
          <View style={styles.stepContent}>
            <Ionicons name="storefront" size={80} color="#000" style={{ marginBottom: 24 }} />
            <Text style={styles.welcomeText}>
              Welcome to Groza!{'\n'}
              Your local food delivery platform
            </Text>
            <Text style={styles.welcomeSubtext}>
              We'll help you set up your account in just a few steps
            </Text>
          </View>
        );
      
      case 1: // Phone
        return (
          <View style={styles.stepContent}>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: focusedField === 'phone' ? '#000' : '#d1d5db',
                  borderWidth: focusedField === 'phone' ? 3 : 1,
                },
              ]}
              placeholder="+27 65 123 4567"
              value={data.phone}
              onChangeText={(text) => setData({ ...data, phone: text })}
              keyboardType="phone-pad"
              onFocus={() => setFocusedField('phone')}
              onBlur={() => setFocusedField(null)}
              autoFocus
            />
            <Text style={styles.hintText}>
              This is the number drivers will contact during delivery
            </Text>
          </View>
        );
      
      case 2: // Email
        return (
          <View style={styles.stepContent}>
            {/* Social Sign-In Buttons */}
            <View style={styles.socialButtonsContainer}>
              <TouchableOpacity
                style={styles.socialButton}
                onPress={handleGoogleSignIn}
              >
                <Image
                  source={{ uri: 'https://www.google.com/images/branding/googleg/1x/googleg_standard_color_128dp.png' }}
                  style={styles.googleLogo}
                  resizeMode="contain"
                />
                <Text style={styles.socialButtonText}>Continue with Google</Text>
              </TouchableOpacity>
              {Platform.OS === 'ios' && (
                <TouchableOpacity
                  style={[styles.socialButton, styles.appleButton]}
                  onPress={handleAppleSignIn}
                >
                  <Ionicons name="logo-apple" size={20} color="#fff" />
                  <Text style={[styles.socialButtonText, styles.appleButtonText]}>Continue with Apple</Text>
                </TouchableOpacity>
              )}
            </View>
            
            <View style={styles.dividerContainer}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or</Text>
              <View style={styles.dividerLine} />
            </View>

            <TextInput
              ref={emailInputRef}
              style={[
                styles.input,
                {
                  borderColor: focusedField === 'email' ? '#000' : '#d1d5db',
                  borderWidth: focusedField === 'email' ? 3 : 1,
                },
              ]}
              placeholder="your.email@example.com"
              value={data.email}
              onChangeText={(text) => setData({ ...data, email: text })}
              keyboardType="default"
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="emailAddress"
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
            />
            <Text style={styles.hintText}>
              Order confirmations will be sent here
            </Text>
          </View>
        );
      
      case 3: // Name
        return (
          <View style={styles.stepContent}>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: focusedField === 'name' ? '#000' : '#d1d5db',
                  borderWidth: focusedField === 'name' ? 3 : 1,
                },
              ]}
              placeholder="John Doe"
              value={data.name}
              onChangeText={(text) => setData({ ...data, name: text })}
              autoCapitalize="words"
              onFocus={() => setFocusedField('name')}
              onBlur={() => setFocusedField(null)}
              autoFocus
            />
          </View>
        );
      
      case 4: // Username
        return (
          <View style={styles.stepContent}>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: focusedField === 'username' ? '#000' : '#d1d5db',
                  borderWidth: focusedField === 'username' ? 3 : 1,
                },
              ]}
              placeholder="johndoe"
              value={data.username}
              onChangeText={(text) => setData({ ...data, username: text })}
              autoCapitalize="none"
              onFocus={() => setFocusedField('username')}
              onBlur={() => setFocusedField(null)}
              autoFocus
            />
            <Text style={styles.hintText}>
              Your username will appear as @{data.username || 'username'}
            </Text>
          </View>
        );
      
      case 5: // Password
        return (
          <View style={styles.stepContent}>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: focusedField === 'password' ? '#000' : '#d1d5db',
                  borderWidth: focusedField === 'password' ? 3 : 1,
                },
              ]}
              placeholder="Password"
              value={data.password}
              onChangeText={(text) => setData({ ...data, password: text })}
              secureTextEntry
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              autoFocus
            />
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: focusedField === 'confirmPassword' ? '#000' : '#d1d5db',
                  borderWidth: focusedField === 'confirmPassword' ? 3 : 1,
                  marginTop: 16,
                },
              ]}
              placeholder="Confirm Password"
              value={data.confirmPassword}
              onChangeText={(text) => setData({ ...data, confirmPassword: text })}
              secureTextEntry
              onFocus={() => setFocusedField('confirmPassword')}
              onBlur={() => setFocusedField(null)}
            />
            <Text style={styles.hintText}>
              Password must be at least 6 characters
            </Text>
          </View>
        );
      
      case 6: // Address
        return (
          <View style={styles.stepContent}>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: focusedField === 'addressLabel' ? '#000' : '#d1d5db',
                  borderWidth: focusedField === 'addressLabel' ? 3 : 1,
                },
              ]}
              placeholder="Home, Work, etc."
              value={data.address.label}
              onChangeText={(text) => setData({ ...data, address: { ...data.address, label: text } })}
              onFocus={() => setFocusedField('addressLabel')}
              onBlur={() => setFocusedField(null)}
              autoFocus
            />
            <View style={{ marginTop: 16 }}>
              {(() => {
                const GOOGLE_PLACES_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_PLACES_API_KEY || '';
                const hasValidApiKey = GOOGLE_PLACES_API_KEY && GOOGLE_PLACES_API_KEY !== 'YOUR_GOOGLE_PLACES_API_KEY' && GOOGLE_PLACES_API_KEY.length > 0;
                
                if (!hasValidApiKey) {
                  // Fallback to regular TextInput if API key is not configured
                  return (
                    <TextInput
                      style={[
                        styles.input,
                        {
                          borderColor: focusedField === 'addressStreet' ? '#000' : '#d1d5db',
                          borderWidth: focusedField === 'addressStreet' ? 3 : 1,
                        },
                      ]}
                      placeholder="123 Main Street"
                      value={data.address.street}
                      onChangeText={(text) => setData({ ...data, address: { ...data.address, street: text } })}
                      autoComplete="street-address"
                      textContentType="fullStreetAddress"
                      onFocus={() => setFocusedField('addressStreet')}
                      onBlur={() => setFocusedField(null)}
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
                        
                        setData({ 
                          ...data, 
                          address: { 
                            ...data.address, 
                            street: street,
                            city: city,
                            postalCode: postalCode
                          } 
                        });
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
                        borderWidth: focusedField === 'addressStreet' ? 3 : 1,
                        borderColor: focusedField === 'addressStreet' ? '#000' : '#d1d5db',
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
                      onFocus: () => setFocusedField('addressStreet'),
                      onBlur: () => setFocusedField(null),
                      value: data.address.street,
                    }}
                    enablePoweredByContainer={false}
                    debounce={300}
                  />
                );
              })()}
            </View>
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: focusedField === 'addressCity' ? '#000' : '#d1d5db',
                  borderWidth: focusedField === 'addressCity' ? 3 : 1,
                  marginTop: 16,
                },
              ]}
              placeholder="City"
              value={data.address.city}
              onChangeText={(text) => setData({ ...data, address: { ...data.address, city: text } })}
              onFocus={() => setFocusedField('addressCity')}
              onBlur={() => setFocusedField(null)}
              editable={true}
            />
            <TextInput
              style={[
                styles.input,
                {
                  borderColor: focusedField === 'addressPostal' ? '#000' : '#d1d5db',
                  borderWidth: focusedField === 'addressPostal' ? 3 : 1,
                  marginTop: 16,
                },
              ]}
              placeholder="Postal Code"
              value={data.address.postalCode}
              onChangeText={(text) => setData({ ...data, address: { ...data.address, postalCode: text } })}
              keyboardType="numeric"
              onFocus={() => setFocusedField('addressPostal')}
              onBlur={() => setFocusedField(null)}
              editable={true}
            />
          </View>
        );
      
      case 7: // Notifications
        return (
          <View style={styles.stepContent}>
            <View style={styles.switchRow}>
              <View style={styles.switchContent}>
                <Text style={styles.switchTitle}>Enable Notifications</Text>
                <Text style={styles.switchSubtitle}>
                  Receive real-time alerts about orders, promotions, and important updates
                </Text>
              </View>
              <Switch
                value={data.notificationsEnabled}
                onValueChange={(value) => setData({ ...data, notificationsEnabled: value })}
                trackColor={{ false: '#e0e0e0', true: '#000' }}
                thumbColor="#fff"
              />
            </View>
          </View>
        );
      
      case 8: // Review
        return (
          <View style={styles.stepContent}>
            <View style={styles.reviewSection}>
              <Text style={styles.reviewLabel}>Phone Number</Text>
              <Text style={styles.reviewValue}>{data.phone || 'Not provided'}</Text>
            </View>
            <View style={styles.reviewSection}>
              <Text style={styles.reviewLabel}>Email</Text>
              <Text style={styles.reviewValue}>{data.email || 'Not provided'}</Text>
            </View>
            <View style={styles.reviewSection}>
              <Text style={styles.reviewLabel}>Name</Text>
              <Text style={styles.reviewValue}>{data.name || 'Not provided'}</Text>
            </View>
            <View style={styles.reviewSection}>
              <Text style={styles.reviewLabel}>Username</Text>
              <Text style={styles.reviewValue}>@{data.username || 'Not provided'}</Text>
            </View>
            <View style={styles.reviewSection}>
              <Text style={styles.reviewLabel}>Delivery Address</Text>
              <Text style={styles.reviewValue}>
                {data.address.street && data.address.city
                  ? `${data.address.street}, ${data.address.city}`
                  : 'Not provided'}
              </Text>
            </View>
            <View style={styles.reviewSection}>
              <Text style={styles.reviewLabel}>Notifications</Text>
              <Text style={styles.reviewValue}>
                {data.notificationsEnabled ? 'Enabled' : 'Disabled'}
              </Text>
            </View>
          </View>
        );
      
      case 9: // OTP Verification
        return (
          <View style={styles.stepContent}>
            <Text style={styles.otpInstructions}>
              We've sent a 6-digit verification code to{'\n'}
              {data.email} and {data.phone}
            </Text>
            <View style={styles.otpContainer}>
              <TextInput
                style={styles.otpInput}
                placeholder="000000"
                value={otpCode}
                onChangeText={(text) => setOtpCode(text.replace(/[^0-9]/g, '').slice(0, 6))}
                keyboardType="number-pad"
                maxLength={6}
                autoFocus
                textAlign="center"
              />
            </View>
            <TouchableOpacity
              style={styles.resendButton}
              onPress={sendOTP}
            >
              <Text style={styles.resendText}>Resend Code</Text>
            </TouchableOpacity>
          </View>
        );
      
      default:
        return null;
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Progress Bar */}
        <View style={styles.progressContainer}>
          <View style={styles.progressBar}>
            <Animated.View
              style={[
                styles.progressFill,
                { width: `${progress}%` },
              ]}
            />
          </View>
          <Text style={styles.progressText}>
            Step {currentStep + 1} of {steps.length}
          </Text>
        </View>

        {/* Header */}
        <View style={styles.header}>
          {currentStep > 0 && currentStep < 9 && (
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Ionicons name="arrow-back" size={24} color="#000" />
            </TouchableOpacity>
          )}
          <View style={styles.headerText}>
            <Text style={styles.title}>{steps[currentStep].title}</Text>
            <Text style={styles.subtitle}>{steps[currentStep].subtitle}</Text>
          </View>
          {/* Close X button to abort signup */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => {
              Alert.alert(
                'Abort Sign Up?',
                'Are you sure you want to cancel the sign up process? Your progress will be lost.',
                [
                  {
                    text: 'Continue Sign Up',
                    style: 'cancel',
                  },
                  {
                    text: 'Abort',
                    style: 'destructive',
                    onPress: () => {
                      router.replace('/(tabs)');
                    },
                  },
                ]
              );
            }}
          >
            <Ionicons name="close" size={24} color="#000" />
          </TouchableOpacity>
        </View>

        {/* Step Content */}
        {renderStepContent()}

        {/* Navigation Buttons */}
        <View style={styles.buttonContainer}>
          {currentStep < steps.length - 1 && currentStep !== 8 && currentStep !== 9 && (
            <TouchableOpacity
              style={styles.nextButton}
              onPress={handleNext}
            >
              <Text style={styles.nextButtonText}>Continue</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          )}
          {currentStep === 8 && (
            <TouchableOpacity
              style={styles.nextButton}
              onPress={handleNext}
            >
              <Text style={styles.nextButtonText}>Confirm & Continue</Text>
              <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          )}
          {currentStep === 9 && (
            <TouchableOpacity
              style={[styles.nextButton, isVerifying && styles.nextButtonDisabled]}
              onPress={handleVerifyOTP}
              disabled={isVerifying}
            >
              <Text style={styles.nextButtonText}>
                {isVerifying ? 'Verifying...' : 'Verify & Complete'}
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Email Already Registered Modal */}
        <Modal
          visible={showEmailExistsModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowEmailExistsModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setShowEmailExistsModal(false)}
              >
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>Email Already Registered</Text>
              <Text style={styles.modalText}>
                This email is already registered. Would you like to sign in instead, or use a different email?
              </Text>
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonSecondary]}
                  onPress={() => {
                    setShowEmailExistsModal(false);
                    // Clear email field to let user change it
                    setData({ ...data, email: '' });
                  }}
                >
                  <Text style={styles.modalButtonTextSecondary}>Change Email</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonPrimary]}
                  onPress={() => {
                    setShowEmailExistsModal(false);
                    router.replace('/(auth)/login');
                  }}
                >
                  <Text style={styles.modalButtonTextPrimary}>Sign In</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  progressContainer: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
  },
  progressBar: {
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#000',
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'right',
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 32,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
  },
  backButton: {
    marginRight: 16,
    padding: 8,
  },
  headerText: {
    flex: 1,
  },
  closeButton: {
    position: 'absolute',
    top: 0,
    right: 24,
    padding: 8,
    zIndex: 10,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  stepContent: {
    paddingHorizontal: 24,
    minHeight: 200,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
    marginBottom: 16,
  },
  welcomeSubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  input: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    fontSize: 16,
    backgroundColor: '#f9fafb',
    borderWidth: 1,
    borderColor: '#d1d5db',
    letterSpacing: 0,
  },
  hintText: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  switchContent: {
    flex: 1,
    marginRight: 16,
  },
  switchTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
  },
  switchSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  reviewSection: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  reviewLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  reviewValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000',
  },
  otpInstructions: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 32,
  },
  otpContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  otpInput: {
    width: 280,
    paddingVertical: 20,
    paddingHorizontal: 32,
    fontSize: 36,
    fontWeight: 'bold',
    letterSpacing: 8,
    borderWidth: 2,
    borderColor: '#000',
    borderRadius: 12,
    backgroundColor: '#f9fafb',
  },
  resendButton: {
    alignSelf: 'center',
  },
  resendText: {
    fontSize: 14,
    color: '#000',
    textDecorationLine: 'underline',
  },
  buttonContainer: {
    paddingHorizontal: 24,
    paddingTop: 32,
  },
  nextButton: {
    backgroundColor: '#000',
    paddingVertical: 16,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonDisabled: {
    opacity: 0.6,
  },
  nextButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  socialButtonsContainer: {
    marginBottom: 24,
    gap: 12,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
    gap: 12,
  },
  googleLogo: {
    width: 20,
    height: 20,
  },
  appleButton: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  socialButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  appleButtonText: {
    color: '#fff',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#e5e7eb',
  },
  dividerText: {
    marginHorizontal: 16,
    fontSize: 14,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    width: '90%',
    maxWidth: 400,
    position: 'relative',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonPrimary: {
    backgroundColor: '#000',
  },
  modalButtonSecondary: {
    backgroundColor: '#f0f0f0',
  },
  modalButtonTextPrimary: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonTextSecondary: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
});

