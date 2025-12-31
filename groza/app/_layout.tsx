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

import { useStore } from '@/store/useStore';
import { useRouter, usePathname } from 'expo-router';
import { TouchableOpacity, View, Text, StyleSheet, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentUser } from '@/services/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/services/firebase';
import SplashScreen from '@/components/SplashScreen';

export default function RootLayout() {
  const colorScheme = 'light';
  const { setUser, setAuthenticated, setLoading, cart, isAuthenticated, isLoading, currentOrder, showMultiVendorModal, dismissMultiVendorPopup } = useStore();
  const router = useRouter();
  const pathname = usePathname();
  const [showSignupModal, setShowSignupModal] = React.useState(false);
  const [showSplash, setShowSplash] = React.useState(true);
  const hasShownWelcomeThisSession = React.useRef(false);
  const authInitialized = React.useRef(false);
  const wasAuthenticatedOnStartup = React.useRef<boolean | null>(null);

  // Load persisted data on app start
  useEffect(() => {
    useStore.getState().loadPersistedData();
  }, []);

  // Initialize Firebase Auth state listener
  useEffect(() => {
    if (authInitialized.current) return;
    authInitialized.current = true;

    setLoading(true);
    
    // Set up Firebase auth state listener
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // User is signed in, load their data
          const userData = await getCurrentUser();
          if (userData) {
            setUser(userData);
            setAuthenticated(true);
            // Track that user was authenticated on startup
            if (wasAuthenticatedOnStartup.current === null) {
              wasAuthenticatedOnStartup.current = true;
            }
          } else {
            // User signed in but data not found
            setUser(null);
            setAuthenticated(false);
            // Track that user was not authenticated on startup
            if (wasAuthenticatedOnStartup.current === null) {
              wasAuthenticatedOnStartup.current = false;
            }
          }
        } else {
          // User is signed out
          setUser(null);
          setAuthenticated(false);
          // Track that user was not authenticated on startup (only if this is the first check)
          if (wasAuthenticatedOnStartup.current === null) {
            wasAuthenticatedOnStartup.current = false;
          }
        }
      } catch (error) {
        console.error('Error loading user data:', error);
        setUser(null);
        setAuthenticated(false);
        // Track that user was not authenticated on startup (only if this is the first check)
        if (wasAuthenticatedOnStartup.current === null) {
          wasAuthenticatedOnStartup.current = false;
        }
      } finally {
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const isAuthPage = pathname.includes('/login') || pathname.includes('/signup') || pathname.includes('/onboarding') || pathname.includes('/auth-select');
  const showCartButton = cartCount > 0 && !pathname.includes('/cart') && !pathname.includes('/checkout') && !isAuthPage;

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

  // Check for welcome modal on app load/reload (only once per session)
  useEffect(() => {
    const checkAndShowWelcome = async () => {
      // Wait for fonts to load
      if (!loaded) return;
      
      // Wait for auth state to be initialized (don't show if still loading)
      if (isLoading) return;
      
      // Only show once per app session
      if (hasShownWelcomeThisSession.current) return;
      
      try {
        // Get current pathname
        const currentPath = pathname || '';
        
        // Check if we're on an auth page
        const isAuthPage = currentPath.includes('/login') || 
                          currentPath.includes('/signup') || 
                          currentPath.includes('/onboarding') ||
                          currentPath.includes('/auth-select');
        
        // Show welcome popup once per session if:
        // 1. User is not authenticated (not signed up)
        // 2. Not on an auth page
        // 3. Auth state has been initialized (not loading)
        // 4. User was NOT authenticated on app startup (not signed out during this session)
        if (!isAuthenticated && !isAuthPage && wasAuthenticatedOnStartup.current === false) {
          hasShownWelcomeThisSession.current = true;
          // Delay to ensure UI is ready
          setTimeout(() => {
            setShowSignupModal(true);
          }, 1500);
        }
      } catch (error) {
        console.error('[Welcome Modal] Error checking welcome modal:', error);
      }
    };

    checkAndShowWelcome();
  }, [loaded, isAuthenticated, isLoading, pathname]);

  if (!loaded) {
    return null;
  }

  const statusBarHeight = Platform.OS === 'ios' ? 44 : RNStatusBar.currentHeight || 24;

  // Show splash screen on app start
  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ThemeProvider value={DefaultTheme}>
          <Stack>
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="checkout" options={{ headerShown: false }} />
            <Stack.Screen name="order-details" options={{ headerShown: false }} />
            <Stack.Screen name="+not-found" />
          </Stack>
          <StatusBar translucent backgroundColor="transparent" style="dark" />
          {/* Floating Cart Button - Hide on order details page */}
          {!pathname?.includes('order-details') && (
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
          )}

          {/* Global Floating Order Popup */}
          {currentOrder && currentOrder.status !== 'delivered' && !pathname.includes('/order-details') && (
            <TouchableOpacity
              style={{
                position: 'absolute',
                bottom: 100,
                right: 20,
                backgroundColor: '#000',
                borderRadius: 24,
                paddingHorizontal: 16,
                paddingVertical: 12,
                flexDirection: 'row',
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
                elevation: 8,
                zIndex: 1001,
                minWidth: 120,
              }}
              onPress={() => router.push(`/order-details?orderId=${currentOrder.id}`)}
              activeOpacity={0.9}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 12, color: '#fff', marginBottom: 2, fontWeight: '500' }}>
                  Order Arriving
                </Text>
                <Text style={{ fontSize: 14, color: '#fff', fontWeight: '600' }}>
                  {currentOrder.estimatedDelivery 
                    ? new Date(currentOrder.estimatedDelivery).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    : '--:--'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#fff" style={{ marginLeft: 8 }} />
            </TouchableOpacity>
          )}
          
          {/* Signup Modal */}
          <Modal
            visible={showSignupModal}
            transparent={true}
            animationType="fade"
            onRequestClose={() => setShowSignupModal(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                {/* Close X button */}
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={async () => {
                    await AsyncStorage.setItem('hasSeenWelcomeModal', 'true');
                    await AsyncStorage.setItem('showSignupPrompt', 'true');
                    setShowSignupModal(false);
                  }}
                >
                  <Ionicons name="close" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Welcome to Groza!</Text>
                <Text style={styles.modalText}>
                  Sign up to access all features and start ordering fresh groceries from local vendors.
                </Text>
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonSecondary]}
                    onPress={async () => {
                      await AsyncStorage.setItem('hasSeenWelcomeModal', 'true');
                      await AsyncStorage.setItem('showSignupPrompt', 'true');
                      setShowSignupModal(false);
                    }}
                  >
                    <Text style={styles.modalButtonTextSecondary}>Continue as Guest</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonPrimary]}
                    onPress={async () => {
                      await AsyncStorage.setItem('hasSeenWelcomeModal', 'true');
                      setShowSignupModal(false);
                      router.push('/(auth)/auth-select');
                    }}
                  >
                    <Text style={styles.modalButtonTextPrimary}>Sign Up</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {/* Multi-Vendor Cart Modal */}
          <Modal
            visible={showMultiVendorModal}
            transparent={true}
            animationType="fade"
            onRequestClose={dismissMultiVendorPopup}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={dismissMultiVendorPopup}
                >
                  <Ionicons name="close" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.modalTitle}>Multiple Vendors in Cart</Text>
                <Text style={styles.modalText}>
                  You have items from more than one vendor. Select one vendor to proceed to checkout.
                </Text>
                <View style={styles.modalButtons}>
                  <TouchableOpacity
                    style={[styles.modalButton, styles.modalButtonPrimary]}
                    onPress={() => {
                      dismissMultiVendorPopup();
                      router.push('/(tabs)/cart');
                    }}
                  >
                    <Text style={styles.modalButtonTextPrimary}>Go to Cart</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 20,
    width: '90%',
    maxWidth: 400,
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    zIndex: 10,
    padding: 4,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 12,
    textAlign: 'center',
  },
  modalText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
    lineHeight: 22,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalButtonPrimary: {
    backgroundColor: '#000',
  },
  modalButtonSecondary: {
    backgroundColor: '#f0f0f0',
  },
  modalButtonTextPrimary: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalButtonTextSecondary: {
    color: '#000',
    fontSize: 16,
    fontWeight: '600',
  },
});
