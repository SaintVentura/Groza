import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
  Keyboard,
} from 'react-native';
import { Link, router } from 'expo-router';
import { useStore } from '@/store/useStore';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const passwordRef = useRef<TextInput>(null);
  const { setUser, setAuthenticated, setError } = useStore();
  const colorSchemeRaw = useColorScheme();
  const colorScheme = colorSchemeRaw === 'dark' ? 'dark' : 'light';

  const clearError = () => {
    if (hasError) {
      setHasError(false);
    }
  };

  const handleEmailChange = (text: string) => {
    setEmail(text);
    clearError();
  };

  const handlePasswordChange = (text: string) => {
    setPassword(text);
    clearError();
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      // Mock validation - simulate incorrect credentials
      if (email !== 'demo@example.com' || password !== 'password123') {
        setHasError(true);
        setIsLoading(false);
        return;
      }

      // Mock login for demo purposes
      const mockUser = {
        id: '1',
        email: email,
        name: 'Demo User',
        role: 'customer' as const,
      };
      
      setUser(mockUser);
      setAuthenticated(true);
      setError(null);
      router.replace('/(tabs)');
    } catch (error: any) {
      setError(error.message);
      Alert.alert('Login Failed', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}
      >
        {/* Cross button to continue as guest */}
        <TouchableOpacity
          style={{ position: 'absolute', top: 52, right: 13, zIndex: 10, backgroundColor: 'rgba(255,255,255,0.8)', borderRadius: 20, padding: 8 }}
          onPress={() => router.replace('/(tabs)')}
        >
          <Ionicons name="close" size={36} color="#000" />
        </TouchableOpacity>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.title, { color: Colors[colorScheme].text }]}>Welcome Back</Text>
              <Text style={[styles.subtitle, { color: colorScheme === 'dark' ? '#aaa' : '#6b7280' }]}>Sign in to your Groza account</Text>
            </View>
            {/* Form */}
            <View style={[styles.form, { gap: hasError ? 8 : 16 }]}>
              <View style={styles.inputContainer}>
                <Text style={[styles.label, { color: Colors[colorScheme].text }]}>Email</Text>
                <TextInput
                  style={[styles.input, { 
                    color: hasError ? '#ef4444' : Colors[colorScheme].text, 
                    borderColor: hasError ? '#ef4444' : emailFocused ? '#000' : colorScheme === 'dark' ? '#333' : '#d1d5db', 
                    borderWidth: emailFocused ? 3 : 1,
                    backgroundColor: Colors[colorScheme].background 
                  }]}
                  placeholder="Enter your email"
                  value={email}
                  onChangeText={handleEmailChange}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  returnKeyType="next"
                  onSubmitEditing={() => passwordRef.current?.focus()}
                  onFocus={() => setEmailFocused(true)}
                  onBlur={() => setEmailFocused(false)}
                />
              </View>
              <View style={[styles.inputContainer, { marginTop: hasError ? 8 : 0, position: 'relative' }]}>
                <Text style={[styles.label, { color: Colors[colorScheme].text }]}>Password</Text>
                <TextInput
                  ref={passwordRef}
                  style={[styles.input, { 
                    color: hasError ? '#ef4444' : Colors[colorScheme].text, 
                    borderColor: hasError ? '#ef4444' : passwordFocused ? '#000' : colorScheme === 'dark' ? '#333' : '#d1d5db', 
                    borderWidth: passwordFocused ? 3 : 1,
                    backgroundColor: Colors[colorScheme].background,
                    paddingRight: 44
                  }]}
                  placeholder="Enter your password"
                  value={password}
                  onChangeText={handlePasswordChange}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                />
                <TouchableOpacity
                  style={{ position: 'absolute', right: 12, top: 13, height: '100%', width: 32, justifyContent: 'center', alignItems: 'center' }}
                  onPress={() => setShowPassword((prev) => !prev)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={22} color={hasError ? '#ef4444' : passwordFocused ? '#000' : '#ccc'} />
                </TouchableOpacity>
                {hasError && (
                  <Text style={[styles.errorText, { color: '#ef4444' }]}>
                    Your email/password is incorrect.
                  </Text>
                )}
              </View>
              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled, { 
                  backgroundColor: isLoading ? '#9ca3af' : '#000',
                  marginTop: hasError ? 13 : 29
                }]}
                onPress={handleLogin}
                disabled={isLoading}
              >
                <Text style={[styles.buttonText, { color: '#fff' }]}>
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={{ marginTop: hasError ?31.5: 24, marginBottom: 0.5 }}
                onPress={() => Alert.alert('Account Recovery', 'Account recovery feature coming soon!')}>
                <Text style={[styles.recoveryLink, { textAlign: 'center' }]}>
                  <Text style={{ color: colorScheme === 'dark' ? '#aaa' : '#6b7280', marginBottom: 4 }}>Forgot password? </Text>
                  <Text style={{ fontWeight: '600' }}>Recover Account</Text>
                </Text>
              </TouchableOpacity>
            </View>
            {/* Sign Up Link */}
            <View style={styles.linkContainer}>
              <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: hasError ? -0.5 : 0 }}>
                <Text style={[styles.linkText, { color: colorScheme === 'dark' ? '#aaa' : '#6b7280' }]}>Don't have an account? </Text>
                <Link href="/(auth)/signup" asChild>
                  <TouchableOpacity>
                    <Text style={[styles.link, { color: '#000' }]}>Sign Up</Text>
                  </TouchableOpacity>
                </Link>
              </View>
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
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  header: {
    marginBottom: 48,
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
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: 32,
  },
  linkText: {
    color: '#6b7280',
  },
  link: {
    color: '#2563eb',
    fontWeight: '600',
  },
  errorText: {
    fontSize: 14,
    marginTop: 0,
  },
  recoveryLink: {
    color: '#000',
    fontSize: 14,
    marginTop: -2,
  },
}); 