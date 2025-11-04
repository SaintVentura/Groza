// @ts-ignore
import { BrandHeader } from '../components/BrandHeader';
// @ts-ignore
import { ThemedText } from '../components/ThemedText';
// @ts-ignore
import React from 'react';
// @ts-ignore
import { StyleSheet, View } from 'react-native';
// @ts-ignore
import { Colors } from './groza/app/constants/Colors';
// @ts-ignore
import { useColorScheme } from './groza/hooks/useColorScheme';

export default function NotFoundScreen() {
  const colorScheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  return (
    <View style={[styles.container, { backgroundColor: Colors[colorScheme].background }] }>
      <BrandHeader />
      {/* Remove any <ThemedText> or text-based 'GROZA' branding, only use <BrandHeader /> */}
      <ThemedText style={styles.link} onPress={() => window.location.href = '/'}>Go to Home</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  brand: {
    fontSize: 40,
    letterSpacing: 4,
    marginBottom: 24,
    textAlign: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  link: {
    color: '#2563eb',
    fontWeight: 'bold',
    fontSize: 16,
    marginTop: 16,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
}); 