import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Image, StatusBar } from 'react-native';

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const translateXAnim = useRef(new Animated.Value(0)).current;
  const whiteFadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto dismiss after 2 seconds with swipe left animation and white fade
    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(translateXAnim, {
          toValue: -1000, // Swipe left off screen
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(whiteFadeAnim, {
          toValue: 1, // Fade to white
          duration: 500,
          useNativeDriver: false, // backgroundColor cannot use native driver
        }),
      ]).start(() => {
        onFinish();
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor="#000" />
      <View style={styles.container}>
        <Animated.View
          style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [
                { scale: scaleAnim },
                { translateX: translateXAnim },
              ],
            },
          ]}
        >
          {/* Logo - you can replace this with your actual logo */}
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>GROZA</Text>
          </View>
          <Text style={styles.subtitle}>A Saint Ventura Economic Development Project</Text>
        </Animated.View>
        {/* White fade overlay */}
        <Animated.View
          style={[
            styles.whiteOverlay,
            {
              opacity: whiteFadeAnim,
            },
          ]}
        />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    marginBottom: 24,
  },
  logoText: {
    fontSize: 64,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    letterSpacing: 1,
    marginTop: 8,
  },
  whiteOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#fff',
  },
});
