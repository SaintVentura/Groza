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
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { requestPasswordReset, verifyOTP } from '@/services/auth';

export default function ForgotPasswordScreen() {
  const [step, setStep] = useState<'request' | 'verify'>('request');
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [usernameOrEmailFocused, setUsernameOrEmailFocused] = useState(false);
  const [otpFocused, setOtpFocused] = useState(false);
  const otpRef = useRef<TextInput>(null);
  const colorSchemeRaw = useColorScheme();
  const colorScheme = colorSchemeRaw === 'dark' ? 'dark' : 'light';

  const clearError = () => {
    if (hasError) {
      setHasError(false);
      setErrorMessage('');
    }
  };

  const handleUsernameOrEmailChange = (text: string) => {
    setUsernameOrEmail(text);
    clearError();
  };

  const handleOtpChange = (text: string) => {
    // Only allow digits
    const digitsOnly = text.replace(/[^0-9]/g, '');
    if (digitsOnly.length <= 6) {
      setOtp(digitsOnly);
      clearError();
    }
  };

  const handleRequestOTP = async () => {
    if (!usernameOrEmail.trim()) {
      Alert.alert('Error', 'Please enter your username or email');
      return;
    }

    setIsLoading(true);
    setHasError(false);
    try {
      const userEmail = await requestPasswordReset(usernameOrEmail);
      setEmail(userEmail);
      setStep('verify');
      Alert.alert('OTP Sent', `A verification code has been sent to ${userEmail}. Please check your email.`);
    } catch (error: any) {
      setHasError(true);
      setErrorMessage(error.message);
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('Error', 'Please enter the 6-digit verification code');
      return;
    }

    setIsLoading(true);
    setHasError(false);
    try {
      const isValid = await verifyOTP(email, otp);
      if (isValid) {
        // Navigate to reset password screen
        router.push({
          pathname: '/(auth)/reset-password',
          params: { email, otp },
        });
      } else {
        setHasError(true);
        setErrorMessage('Invalid verification code. Please try again.');
      }
    } catch (error: any) {
      setHasError(true);
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (!email) return;
    setIsLoading(true);
    try {
      await requestPasswordReset(usernameOrEmail);
      Alert.alert('OTP Resent', 'A new verification code has been sent to your email.');
      setOtp('');
    } catch (error: any) {
      Alert.alert('Error', error.message);
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
          onPress={() => {
            if (step === 'verify') {
              setStep('request');
              setOtp('');
            } else {
              router.back();
            }
          }}
        >
          <Ionicons name="arrow-back" size={24} color={Colors[colorScheme].text} />
        </TouchableOpacity>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          <View style={styles.content}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={[styles.title, { color: Colors[colorScheme].text }]}>
                {step === 'request' ? 'Recover Account' : 'Verify Code'}
              </Text>
              <Text style={[styles.subtitle, { color: colorScheme === 'dark' ? '#aaa' : '#6b7280' }]}>
                {step === 'request'
                  ? 'Enter your username or email to receive a verification code'
                  : `Enter the 6-digit code sent to ${email}`}
              </Text>
            </View>

            {/* Form */}
            <View style={styles.form}>
              {step === 'request' ? (
                <>
                  <View style={styles.inputContainer}>
                    <Text style={[styles.label, { color: Colors[colorScheme].text }]}>
                      Username or Email
                    </Text>
                    <TextInput
                      style={[
                        styles.input,
                        {
                          color: hasError ? '#ef4444' : Colors[colorScheme].text,
                          borderColor: hasError
                            ? '#ef4444'
                            : usernameOrEmailFocused
                            ? '#000'
                            : colorScheme === 'dark'
                            ? '#333'
                            : '#d1d5db',
                          borderWidth: usernameOrEmailFocused ? 3 : 1,
                          backgroundColor: Colors[colorScheme].background,
                        },
                      ]}
                      placeholder="Enter your username or email"
                      value={usernameOrEmail}
                      onChangeText={handleUsernameOrEmailChange}
                      autoCapitalize="none"
                      autoCorrect={false}
                      keyboardType="default"
                      returnKeyType="send"
                      onSubmitEditing={handleRequestOTP}
                      onFocus={() => setUsernameOrEmailFocused(true)}
                      onBlur={() => setUsernameOrEmailFocused(false)}
                    />
                    {hasError && errorMessage && (
                      <Text style={[styles.errorText, { color: '#ef4444' }]}>{errorMessage}</Text>
                    )}
                  </View>

                  <TouchableOpacity
                    style={[styles.button, isLoading && styles.buttonDisabled]}
                    onPress={handleRequestOTP}
                    disabled={isLoading}
                  >
                    <Text style={styles.buttonText}>
                      {isLoading ? 'Sending Code...' : 'Send Verification Code'}
                    </Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <View style={styles.inputContainer}>
                    <Text style={[styles.label, { color: Colors[colorScheme].text }]}>
                      Verification Code
                    </Text>
                    <TextInput
                      ref={otpRef}
                      style={[
                        styles.input,
                        {
                          color: hasError ? '#ef4444' : Colors[colorScheme].text,
                          borderColor: hasError
                            ? '#ef4444'
                            : otpFocused
                            ? '#000'
                            : colorScheme === 'dark'
                            ? '#333'
                            : '#d1d5db',
                          borderWidth: otpFocused ? 3 : 1,
                          backgroundColor: Colors[colorScheme].background,
                          textAlign: 'center',
                          fontSize: 24,
                          letterSpacing: 8,
                          fontFamily: 'monospace',
                        },
                      ]}
                      placeholder="000000"
                      value={otp}
                      onChangeText={handleOtpChange}
                      keyboardType="number-pad"
                      maxLength={6}
                      returnKeyType="done"
                      onSubmitEditing={handleVerifyOTP}
                      onFocus={() => setOtpFocused(true)}
                      onBlur={() => setOtpFocused(false)}
                    />
                    {hasError && errorMessage && (
                      <Text style={[styles.errorText, { color: '#ef4444' }]}>{errorMessage}</Text>
                    )}
                  </View>

                  <TouchableOpacity
                    style={[styles.button, isLoading && styles.buttonDisabled]}
                    onPress={handleVerifyOTP}
                    disabled={isLoading}
                  >
                    <Text style={styles.buttonText}>
                      {isLoading ? 'Verifying...' : 'Verify Code'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.resendButton}
                    onPress={handleResendOTP}
                    disabled={isLoading}
                  >
                    <Text style={[styles.resendText, { color: Colors[colorScheme].text }]}>
                      Didn't receive the code? <Text style={{ fontWeight: '600' }}>Resend</Text>
                    </Text>
                  </TouchableOpacity>
                </>
              )}

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
  resendButton: {
    marginTop: 16,
    alignItems: 'center',
  },
  resendText: {
    fontSize: 14,
    color: '#6b7280',
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




