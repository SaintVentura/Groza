// @ts-ignore
import { BrandHeader } from '../../components/BrandHeader';
// @ts-ignore
import { ThemedText } from '../../components/ThemedText';
// @ts-ignore
import React, { useState } from 'react';
// @ts-ignore
import { View, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native';
// @ts-ignore
import { Colors } from '../../groza/app/constants/Colors';
// @ts-ignore
import { useColorScheme } from '../../groza/hooks/useColorScheme';
// @ts-ignore
import { router } from 'expo-router';
// @ts-ignore
import * as Haptics from 'expo-haptics';
// @ts-ignore
import Checkbox from 'expo-checkbox';

export default function SignupScreen() {
  const colorScheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [joinNewsletter, setJoinNewsletter] = useState(false);
  const [receiveDiscounts, setReceiveDiscounts] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
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
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      router.replace('/(tabs)');
    }, 1000);
  };

  return (
    <ScrollView style={[styles.container, { backgroundColor: Colors[colorScheme].background }]}
      contentContainerStyle={{ paddingBottom: 32 }}>
      <BrandHeader />
      <ThemedText type="subtitle" style={styles.sectionTitle}>Customer Signup</ThemedText>
      <View style={styles.formBox}>
        <ThemedText style={styles.label}>Name</ThemedText>
        <TextInput
          style={[styles.input, { color: Colors[colorScheme].text, backgroundColor: colorScheme === 'dark' ? '#222' : '#f3f4f6' }]}
          value={name}
          onChangeText={setName}
          placeholder="Enter your name"
          placeholderTextColor={colorScheme === 'dark' ? '#888' : '#aaa'}
        />
        <ThemedText style={styles.label}>Email</ThemedText>
        <TextInput
          style={[styles.input, { color: Colors[colorScheme].text, backgroundColor: colorScheme === 'dark' ? '#222' : '#f3f4f6' }]}
          value={email}
          onChangeText={setEmail}
          placeholder="Enter your email"
          placeholderTextColor={colorScheme === 'dark' ? '#888' : '#aaa'}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <ThemedText style={styles.label}>Password</ThemedText>
        <TextInput
          style={[styles.input, { color: Colors[colorScheme].text, backgroundColor: colorScheme === 'dark' ? '#222' : '#f3f4f6' }]}
          value={password}
          onChangeText={setPassword}
          placeholder="Enter your password"
          placeholderTextColor={colorScheme === 'dark' ? '#888' : '#aaa'}
          secureTextEntry
        />
        <ThemedText style={styles.label}>Confirm Password</ThemedText>
        <TextInput
          style={[styles.input, { color: Colors[colorScheme].text, backgroundColor: colorScheme === 'dark' ? '#222' : '#f3f4f6' }]}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Confirm your password"
          placeholderTextColor={colorScheme === 'dark' ? '#888' : '#aaa'}
          secureTextEntry
        />
        <View style={styles.checkboxRow}>
          <Checkbox value={joinNewsletter} onValueChange={setJoinNewsletter} color={joinNewsletter ? '#0a7ea4' : undefined} />
          <ThemedText style={styles.checkboxLabel}>Join our newsletter</ThemedText>
        </View>
        <View style={styles.checkboxRow}>
          <Checkbox value={receiveDiscounts} onValueChange={setReceiveDiscounts} color={receiveDiscounts ? '#0a7ea4' : undefined} />
          <ThemedText style={styles.checkboxLabel}>Receive discounts and special offers</ThemedText>
        </View>
        <TouchableOpacity style={styles.signupButton} activeOpacity={0.85} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); handleSignup(); }}>
          <ThemedText style={styles.signupButtonText}>{isLoading ? 'Signing up...' : 'Sign Up'}</ThemedText>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.linkBox} onPress={() => router.replace('/(auth)/login')}>
        <ThemedText style={styles.linkText}>Already have an account? <ThemedText style={styles.link}>Login</ThemedText></ThemedText>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 32,
    paddingHorizontal: 20,
  },
  brand: {
    textAlign: 'center',
    marginBottom: 24,
    fontSize: 40,
    letterSpacing: 4,
  },
  sectionTitle: {
    marginTop: 16,
    marginBottom: 8,
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  formBox: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    elevation: 2,
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 6,
  },
  input: {
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  signupButton: {
    backgroundColor: '#11181C',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  signupButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  linkBox: {
    alignItems: 'center',
    marginTop: 8,
  },
  linkText: {
    color: '#888',
    fontSize: 15,
  },
  link: {
    color: '#2563eb',
    fontWeight: 'bold',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 15,
  },
}); 