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

export default function LoginScreen() {
  const colorScheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
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
      <View style={styles.formBox}>
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
        <TouchableOpacity style={styles.loginButton} activeOpacity={0.85} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); handleLogin(); }}>
          <ThemedText style={styles.loginButtonText}>{isLoading ? 'Logging in...' : 'Login'}</ThemedText>
        </TouchableOpacity>
      </View>
      <TouchableOpacity style={styles.linkBox} onPress={() => router.replace('/(auth)/signup')}>
        <ThemedText style={styles.linkText}>Don't have an account? <ThemedText style={styles.link}>Sign Up</ThemedText></ThemedText>
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
  loginButton: {
    backgroundColor: '#11181C',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 8,
  },
  loginButtonText: {
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
}); 