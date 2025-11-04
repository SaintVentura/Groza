import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useRef, useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';
import { Animated } from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Platform, StatusBar as RNStatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useColorScheme } from '@/hooks/useColorScheme';
import { useStore } from '@/store/useStore';
import { useRouter, usePathname } from 'expo-router';
import { TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const { setUser, setAuthenticated, setLoading, cart } = useStore();
  const router = useRouter();
  const pathname = usePathname();

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const isAuthPage = pathname.includes('/login') || pathname.includes('/signup');
  const showCartButton = cartCount > 0 && !pathname.includes('/cart') && !isAuthPage;

  // Animation for floating cart button
  const popAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (showCartButton) {
      Animated.spring(popAnim, {
        toValue: 1,
        useNativeDriver: true,
        friction: 6,
        tension: 120,
      }).start();
    } else {
      Animated.timing(popAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }).start();
    }
  }, [showCartButton, popAnim]);

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      try {
        // For now, we'll skip Firebase auth check to avoid issues
        // In a real app, you would check Firebase auth here
        setLoading(false);
      } catch (error) {
        console.error('Auth initialization error:', error);
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  if (!loaded) {
    return null;
  }

  const statusBarHeight = Platform.OS === 'ios' ? 44 : RNStatusBar.currentHeight || 24;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider value={DefaultTheme}>
          <Stack>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar translucent backgroundColor="transparent" style="dark" />
          <Animated.View
            style={{
              ...styles.floatingCartContainer,
              opacity: popAnim,
              transform: [
                { scale: popAnim.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) },
              ],
              pointerEvents: cartCount > 0 ? 'auto' : 'none',
            }}
            pointerEvents="box-none"
          >
            <TouchableOpacity
              style={styles.floatingCartButton}
              onPress={() => router.push('/(tabs)/cart')}
              activeOpacity={0.85}
              disabled={cartCount === 0}
            >
              <Ionicons name="bag" size={32} color="#fff" />
              <Text style={styles.floatingCartLabel}>View Cart</Text>
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </ThemeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  floatingCartContainer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 120, // higher above the tabs bar
    alignItems: 'center',
    zIndex: 1000,
    pointerEvents: 'box-none',
  },
  floatingCartButton: {
    backgroundColor: '#000',
    borderRadius: 24, // increased from 20
    paddingHorizontal: 24, // increased from 18
    paddingVertical: 14, // increased from 10
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 }, // positive value for lower shadow
    shadowOpacity: 0.45,
    shadowRadius: 24,
    elevation: 24,
    flexDirection: 'row',
    alignItems: 'center',
  },
  cartBadge: {
    backgroundColor: '#e53935',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: -6, // adjusted position
    right: -6, // adjusted position
    paddingHorizontal: 5,
    zIndex: 10,
  },
  cartBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 13,
    textAlign: 'center',
  },
  floatingCartLabel: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 10,
    marginRight: 4,
  },
});
