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
import { router, useLocalSearchParams } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { resetPasswordWithOTP, verifyOTP } from '@/services/auth';

export default function ResetPasswordScreen() {
  const params = useLocalSearchParams();
  const email = (params.email as string) || '';
  const otp = (params.otp as string) || '';

  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [newPasswordFocused, setNewPasswordFocused] = useState(false);
  const [confirmPasswordFocused, setConfirmPasswordFocused] = useState(false);
  const confirmPasswordRef = useRef<TextInput>(null);
  const colorSchemeRaw = useColorScheme();
  const colorScheme = colorSchemeRaw === 'dark' ? 'dark' : 'light';

  React.useEffect(() => {
    if (!email || !otp) {
      Alert.alert('Error', 'Invalid reset link. Please start the recovery process again.', [
        { text: 'OK', onPress: () => router.replace('/(auth)/forgot-password') },
      ]);
    }
  }, [email, otp]);

  const clearError = () => {
    if (hasError) {
      setHasError(false);
      setErrorMessage('');
    }
  };

  const handleNewPasswordChange = (text: string) => {
    setNewPassword(text);
    clearError();
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    clearError();
  };

  const handleResetPassword = async () => {
    if (!newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (newPassword.length < 6) {
      setHasError(true);
      setErrorMessage('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setHasError(true);
      setErrorMessage('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setHasError(false);
    try {
      // First verify OTP again for security
      const isValidOTP = await verifyOTP(email, otp);
      if (!isValidOTP) {
        throw new Error('Invalid or expired verification code. Please start the recovery process again.');
      }

      // Attempt to reset password with OTP
      // Note: This stores the password reset request and sends an email
      // For direct password reset, backend integration with Firebase Admin SDK is required
      await resetPasswordWithOTP(email, otp, newPassword);

      // If successful, show success message
      Alert.alert(
        'Password Reset Initiated',
        'Your password reset request has been processed. A password reset link has been sent to your email. Please check your email and use the link to complete the password reset. If you have backend integration, the password will be updated directly.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/(auth)/login'),
          },
        ]
      );
    } catch (error: any) {
      setHasError(true);
      setErrorMessage(error.message);
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
        {/* Back button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color={Colors[colorScheme].text} />
        </TouchableOpacity>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.title, { color: Colors[colorScheme].text }]}>Reset Password</Text>
              <Text style={[styles.subtitle, { color: colorScheme === 'dark' ? '#aaa' : '#6b7280' }]}>
                Enter your new password below
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              <View style={[styles.inputContainer, { position: 'relative' }]}>
                <Text style={[styles.label, { color: Colors[colorScheme].text }]}>New Password</Text>
                <TextInput
                  style={[
                    styles.input,
                    {
                      color: hasError ? '#ef4444' : Colors[colorScheme].text,
                      borderColor: hasError
                        ? '#ef4444'
                        : newPasswordFocused
                        ? '#000'
                        : colorScheme === 'dark'
                        ? '#333'
                        : '#d1d5db',
                      borderWidth: newPasswordFocused ? 3 : 1,
                      backgroundColor: Colors[colorScheme].background,
                      paddingRight: 44,
                    },
                  ]}
                  placeholder="Enter new password"
                  value={newPassword}
                  onChangeText={handleNewPasswordChange}
                  secureTextEntry={!showNewPassword}
                  autoCapitalize="none"
                  returnKeyType="next"
                  onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                  onFocus={() => setNewPasswordFocused(true)}
                  onBlur={() => setNewPasswordFocused(false)}
                />
                <TouchableOpacity
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: 38,
                    height: '100%',
                    width: 32,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  onPress={() => setShowNewPassword((prev) => !prev)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={showNewPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={22}
                    color={newPasswordFocused ? '#000' : '#ccc'}
                  />
                </TouchableOpacity>
              </View>

              <View style={[styles.inputContainer, { position: 'relative' }]}>
                <Text style={[styles.label, { color: Colors[colorScheme].text }]}>Confirm New Password</Text>
                <TextInput
                  ref={confirmPasswordRef}
                  style={[
                    styles.input,
                    {
                      color: hasError ? '#ef4444' : Colors[colorScheme].text,
                      borderColor: hasError
                        ? '#ef4444'
                        : confirmPasswordFocused
                        ? '#000'
                        : colorScheme === 'dark'
                        ? '#333'
                        : '#d1d5db',
                      borderWidth: confirmPasswordFocused ? 3 : 1,
                      backgroundColor: Colors[colorScheme].background,
                      paddingRight: 44,
                    },
                  ]}
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChangeText={handleConfirmPasswordChange}
                  secureTextEntry={!showConfirmPassword}
                  autoCapitalize="none"
                  returnKeyType="done"
                  onSubmitEditing={handleResetPassword}
                  onFocus={() => setConfirmPasswordFocused(true)}
                  onBlur={() => setConfirmPasswordFocused(false)}
                />
                <TouchableOpacity
                  style={{
                    position: 'absolute',
                    right: 12,
                    top: 38,
                    height: '100%',
                    width: 32,
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  onPress={() => setShowConfirmPassword((prev) => !prev)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={22}
                    color={confirmPasswordFocused ? '#000' : '#ccc'}
                  />
                </TouchableOpacity>
                {hasError && errorMessage && (
                  <Text style={[styles.errorText, { color: '#ef4444' }]}>{errorMessage}</Text>
                )}
              </View>

              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleResetPassword}
                disabled={isLoading}
              >
                <Text style={styles.buttonText}>
                  {isLoading ? 'Resetting Password...' : 'Reset Password'}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.backToLoginButton}
                onPress={() => router.replace('/(auth)/login')}
              >
                <Text style={[styles.backToLoginText, { color: colorScheme === 'dark' ? '#aaa' : '#6b7280' }]}>
                  Back to Sign In
                </Text>
              </TouchableOpacity>
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
  backButton: {
    position: 'absolute',
    top: 52,
    left: 13,
    zIndex: 10,
    backgroundColor: 'rgba(255,255,255,0.8)',
    borderRadius: 20,
    padding: 8,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingTop: 100,
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
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 22,
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
  errorText: {
    fontSize: 14,
    marginTop: 4,
  },
  button: {
    width: '100%',
    paddingVertical: 16,
    borderRadius: 8,
    backgroundColor: '#000',
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
  backToLoginButton: {
    marginTop: 32,
    alignItems: 'center',
  },
  backToLoginText: {
    fontSize: 14,
    color: '#6b7280',
  },
});

