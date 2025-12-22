import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
  ScrollView,
} from 'react-native';
import { Link, router } from 'expo-router';
import { useStore } from '@/store/useStore';
import { Ionicons } from '@expo/vector-icons';
import { signUp, checkUsernameAvailability } from '@/services/auth';

export default function SignupScreen() {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [newsletterSubscription, setNewsletterSubscription] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [nameFocused, setNameFocused] = useState(false);
  const [usernameFocused, setUsernameFocused] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [phoneFocused, setPhoneFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  const [usernameError, setUsernameError] = useState('');
  const [isCheckingUsername, setIsCheckingUsername] = useState(false);
  const usernameRef = useRef<TextInput>(null);
  const emailRef = useRef<TextInput>(null);
  const phoneRef = useRef<TextInput>(null);
  const passwordRef = useRef<TextInput>(null);
  const confirmPasswordRef = useRef<TextInput>(null);
  const { setUser, setAuthenticated, setError } = useStore();

  const handleSignup = async () => {
    if (!name || !username || !email || !phone || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    // Phone validation (South African format)
    const phoneRegex = /^(\+27|0)[6-8][0-9]{8}$/;
    const cleanedPhone = phone.replace(/\s/g, '');
    if (!phoneRegex.test(cleanedPhone)) {
      Alert.alert('Error', 'Please enter a valid South African phone number');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    if (username.length < 3) {
      Alert.alert('Error', 'Username must be at least 3 characters');
      return;
    }

    // Validate username format (alphanumeric and underscore only)
    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!usernameRegex.test(username)) {
      Alert.alert('Error', 'Username can only contain letters, numbers, and underscores');
      return;
    }

    setIsLoading(true);
    setUsernameError('');
    try {
      // Check username availability
      const isAvailable = await checkUsernameAvailability(username);
      if (!isAvailable) {
        setUsernameError('Username is already taken. Please choose another one.');
        setIsLoading(false);
        return;
      }

      // Create account using Firebase Auth
      const userData = await signUp(
        email.trim().toLowerCase(),
        password,
        name.trim(),
        username.trim(),
        cleanedPhone,
        newsletterSubscription,
        'customer'
      );
      
      setUser(userData);
      setAuthenticated(true);
      setError(null);
      
      // Request notification permission after signup (gracefully handle Expo Go limitations)
      try {
        const Notifications = await import('expo-notifications');
        const getPermissionsFn = Notifications?.default?.getPermissionsAsync || Notifications?.getPermissionsAsync;
        const requestPermissionsFn = Notifications?.default?.requestPermissionsAsync || Notifications?.requestPermissionsAsync;
        
        if (typeof getPermissionsFn === 'function' && typeof requestPermissionsFn === 'function') {
          const { status: existingStatus } = await getPermissionsFn();
          if (existingStatus !== 'granted') {
            await requestPermissionsFn();
          }
        }
      } catch (error) {
        // Silently fail in Expo Go - notifications require development build
        // Error is expected in Expo Go
      }
      
      // Request location permission after signup
      try {
        const Location = await import('expo-location');
        const requestFn = Location?.default?.requestForegroundPermissionsAsync || Location?.requestForegroundPermissionsAsync;
        
        if (typeof requestFn === 'function') {
          const { status: locationStatus } = await requestFn();
          if (locationStatus === 'granted') {
            router.replace('/(tabs)/addresses?fromSignup=true');
          } else {
            Alert.alert('Location Permission', 'Please enable location services to get accurate delivery estimates.');
            router.replace('/(tabs)/addresses?fromSignup=true');
          }
        } else {
          router.replace('/(tabs)/addresses?fromSignup=true');
        }
      } catch (error) {
        // Gracefully handle location permission errors - just navigate to addresses
        router.replace('/(tabs)/addresses?fromSignup=true');
      }
    } catch (error: any) {
      setError(error.message);
      Alert.alert('Signup Failed', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
      {/* Cross button to continue as guest */}
      <TouchableOpacity
        style={{ position: 'absolute', top: 52, right: 13, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 20, padding: 8 }}
        onPress={() => router.replace('/(tabs)')}
      >
        <Ionicons name="close" size={36} color="#000" />
      </TouchableOpacity>
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
          keyboardShouldPersistTaps="handled"
        >
        <View style={styles.content}>
          {/* Header */}
        <View style={[styles.header, { paddingTop: 100 }]}> 
            <Text style={styles.title}>Join Groza</Text>
            <Text style={styles.subtitle}>Create your account to get started</Text>
          </View>

          {/* Form */}
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name</Text>
              <TextInput
                style={[styles.input, { 
                  borderColor: nameFocused ? '#000' : '#d1d5db',
                  borderWidth: nameFocused ? 3 : 1
                }]}
                placeholder="Enter your full name"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
                returnKeyType="next"
                onSubmitEditing={() => usernameRef.current?.focus()}
                onFocus={() => setNameFocused(true)}
                onBlur={() => setNameFocused(false)}
              />
            </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              ref={usernameRef}
              style={[styles.input, { 
                borderColor: usernameError ? '#ef4444' : usernameFocused ? '#000' : '#d1d5db',
                borderWidth: usernameFocused ? 3 : 1
              }]}
              placeholder="Choose a username (without @)"
              value={username}
              onChangeText={(text) => {
                setUsername(text);
                setUsernameError('');
              }}
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={20}
              returnKeyType="next"
              onSubmitEditing={() => emailRef.current?.focus()}
              onFocus={() => setUsernameFocused(true)}
              onBlur={async () => {
                setUsernameFocused(false);
                // Check username availability when user leaves the field
                if (username.length >= 3) {
                  const usernameRegex = /^[a-zA-Z0-9_]+$/;
                  if (!usernameRegex.test(username)) {
                    setUsernameError('Username can only contain letters, numbers, and underscores');
                    return;
                  }
                  setIsCheckingUsername(true);
                  try {
                    const isAvailable = await checkUsernameAvailability(username);
                    if (!isAvailable) {
                      setUsernameError('Username is already taken');
                    }
                  } catch (error) {
                    // Silently fail - will check again on submit
                  } finally {
                    setIsCheckingUsername(false);
                  }
                }
              }}
            />
            {usernameError ? (
              <Text style={[styles.inputHint, { color: '#ef4444' }]}>{usernameError}</Text>
            ) : (
              <Text style={styles.inputHint}>
                {isCheckingUsername ? 'Checking availability...' : `Your username will appear as @${username || 'username'}`}
              </Text>
            )}
          </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                ref={emailRef}
                style={[styles.input, { 
                  borderColor: emailFocused ? '#000' : '#d1d5db',
                  borderWidth: emailFocused ? 3 : 1
                }]}
                placeholder="Enter your email"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                onSubmitEditing={() => phoneRef.current?.focus()}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
              />
              <Text style={styles.inputHint}>Order confirmations will be sent here</Text>
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                ref={phoneRef}
                style={[styles.input, { 
                  borderColor: phoneFocused ? '#000' : '#d1d5db',
                  borderWidth: phoneFocused ? 3 : 1
                }]}
                placeholder="+27 65 123 4567"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                autoCapitalize="none"
                autoCorrect={false}
                returnKeyType="next"
                onSubmitEditing={() => passwordRef.current?.focus()}
                onFocus={() => setPhoneFocused(true)}
                onBlur={() => setPhoneFocused(false)}
              />
              <Text style={styles.inputHint}>This is the number drivers will contact during delivery</Text>
            </View>

            <View style={[styles.inputContainer, { position: 'relative' }]}>
              <Text style={styles.label}>Password</Text>
              <TextInput
                ref={passwordRef}
                style={[styles.input, { 
                  paddingRight: 44,
                  borderColor: passwordFocused ? '#000' : '#d1d5db',
                  borderWidth: passwordFocused ? 3 : 1
                }]}
                placeholder="Enter your password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                returnKeyType="next"
                onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
              />
              <TouchableOpacity
                style={{ position: 'absolute', right: 12, top: 13, height: '100%', width: 32, justifyContent: 'center', alignItems: 'center' }}
                onPress={() => setShowPassword((prev) => !prev)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color={passwordFocused ? '#000' : '#ccc'} />
              </TouchableOpacity>
            </View>

            <View style={[styles.inputContainer, { position: 'relative' }]}>
              <Text style={styles.label}>Confirm Password</Text>
              <TextInput
                ref={confirmPasswordRef}
                style={[styles.input, { 
                  paddingRight: 44,
                  borderColor: confirmPasswordFocused ? '#000' : '#d1d5db',
                  borderWidth: confirmPasswordFocused ? 3 : 1
                }]}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                returnKeyType="done"
                onSubmitEditing={handleSignup}
                onFocus={() => setConfirmPasswordFocused(true)}
                onBlur={() => setConfirmPasswordFocused(false)}
              />
              <TouchableOpacity
                style={{ position: 'absolute', right: 12, top: 13, height: '100%', width: 32, justifyContent: 'center', alignItems: 'center' }}
                onPress={() => setShowConfirmPassword((prev) => !prev)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color={confirmPasswordFocused ? '#000' : '#ccc'} />
              </TouchableOpacity>
            </View>

          {/* Newsletter Subscription Checkbox */}
                  <TouchableOpacity
            style={styles.checkboxContainer}
            onPress={() => setNewsletterSubscription(!newsletterSubscription)}
            activeOpacity={0.7}
          >
            <View style={[styles.checkbox, newsletterSubscription && styles.checkboxChecked]}>
              {newsletterSubscription && (
                <Ionicons name="checkmark" size={16} color="#fff" />
              )}
            </View>
            <Text style={styles.checkboxText}>
              I want to receive newsletter updates from Groza with the latest news and discounts
            </Text>
          </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, isLoading && styles.buttonDisabled]}
              onPress={handleSignup}
              disabled={isLoading}
            >
              <Text style={styles.buttonText}>
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Sign In Link */}
        <View style={[styles.linkContainer, { marginBottom: 60 }]}>
            <Text style={styles.linkText}>Already have an account? </Text>
            <Link href="/(auth)/login" asChild>
              <TouchableOpacity>
                <Text style={styles.link}>Sign In</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>
        </ScrollView>
    </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#6b7280',
  },
  form: {
    gap: 16,
  },
  inputContainer: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  input: {
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    fontSize: 16,
    color: '#111827',
  },
  inputHint: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  checkboxContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderRadius: 4,
    marginRight: 12,
    marginTop: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  checkboxChecked: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  checkboxText: {
    flex: 1,
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  button: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 8,
    backgroundColor: '#000', // black button
    marginTop: 24,
  },
  buttonDisabled: {
    backgroundColor: '#9ca3af',
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 18,
  },
  linkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 32,
  },
  linkText: {
    color: '#6b7280',
  },
  link: {
    color: '#000',
    fontWeight: 'bold',
  },
}); 