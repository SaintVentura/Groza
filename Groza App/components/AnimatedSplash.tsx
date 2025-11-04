// @ts-ignore
import React, { useEffect, useRef, useState } from 'react';
// @ts-ignore
import { View, Animated, StyleSheet } from 'react-native';
// @ts-ignore
import { ThemedText } from './ThemedText';
// @ts-ignore
import * as SplashScreen from 'expo-splash-screen';

export default function AnimatedSplash({ onFinish }: { onFinish: () => void }) {
  const opacity = useRef(new Animated.Value(0)).current;
  const [done, setDone] = useState(false);

  useEffect(() => {
    SplashScreen.preventAutoHideAsync();
    Animated.sequence([
      Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      Animated.delay(900),
      Animated.timing(opacity, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start(async () => {
      setDone(true);
      await SplashScreen.hideAsync();
      onFinish();
    });
  }, []);

  if (done) return null;

  return (
    <View style={styles.container}>
      <Animated.View style={{ opacity }}>
        <ThemedText type="title" style={styles.brand}>GROZA</ThemedText>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
  },
  brand: {
    fontSize: 48,
    letterSpacing: 8,
    textAlign: 'center',
  },
}); 