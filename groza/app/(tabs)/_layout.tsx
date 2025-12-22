import { Tabs, usePathname } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useStore } from '@/store/useStore';
import { Colors } from '@/constants/Colors';
import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { cart, isAuthenticated, user } = useStore();
  const insets = useSafeAreaInsets();
  const pathname = usePathname();
  const [showSignupPrompt, setShowSignupPrompt] = useState(false);
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  
  // Check if we're on the profile page
  const isProfilePage = pathname?.includes('/profile') || pathname === '/(tabs)/profile';

  // Check if we should show signup prompt
  useEffect(() => {
    const checkSignupPrompt = async () => {
      try {
        // Don't show if user is authenticated
        if (isAuthenticated || user?.name) {
          await AsyncStorage.removeItem('showSignupPrompt');
          setShowSignupPrompt(false);
          return;
        }
        
        const shouldShow = await AsyncStorage.getItem('showSignupPrompt');
        if (shouldShow === 'true') {
          // Hide if on profile page, show otherwise
          if (isProfilePage) {
            Animated.timing(fadeAnim, {
              toValue: 0,
              duration: 300,
              useNativeDriver: true,
            }).start(() => {
              setShowSignupPrompt(false);
            });
          } else {
            // Animate in
            Animated.timing(fadeAnim, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }).start();
            setShowSignupPrompt(true);
          }
        }
      } catch (error) {
        console.error('Error checking signup prompt:', error);
      }
    };
    
    checkSignupPrompt();
  }, [isAuthenticated, user, isProfilePage]);

  return (
    <View style={{ flex: 1 }}>
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colorScheme === 'dark' ? '#fff' : '#000',
        tabBarInactiveTintColor: colorScheme === 'dark' ? '#fff' : '#000',
        tabBarStyle: {
          backgroundColor: colorScheme === 'dark' ? Colors.dark.background : Colors.light.background,
          height: 88,
          paddingBottom: 48 + insets.bottom,
          paddingTop: 8,
          shadowColor: colorScheme === 'dark' ? '#fff' : '#000',
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 4,
          elevation: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
        headerStyle: {
          backgroundColor: colorScheme === 'dark' ? Colors.dark.background : Colors.light.background,
          shadowColor: colorScheme === 'dark' ? '#fff' : '#000',
          shadowOffset: {
            width: 0,
            height: 1,
          },
          shadowOpacity: 0.05,
          shadowRadius: 2,
          elevation: 3,
        },
        headerTintColor: colorScheme === 'dark' ? '#fff' : '#000',
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarLabel: 'Home',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'home' : 'home-outline'} size={28} color={focused ? '#000' : color} />
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarLabel: 'Explore',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons 
              name={focused ? 'search' : 'search-outline'} 
              size={28} 
              color={focused ? '#000' : color} 
              style={{ fontWeight: focused ? 'bold' : 'normal' }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Cart',
          tabBarLabel: 'Cart',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'bag' : 'bag-outline'} size={28} color={color} />
          ),
          tabBarBadge: cartCount > 0 ? cartCount : undefined,
          tabBarBadgeStyle: {
            backgroundColor: '#FF3B30',
            color: '#fff',
            fontSize: 12, // changed from 13 to 12
            fontWeight: '600',
          },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarLabel: 'Profile',
          headerShown: false,
          tabBarIcon: ({ color, focused }) => (
            <Ionicons name={focused ? 'person' : 'person-outline'} size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="restaurant/[id]"
        options={{
          href: null, // Hide from tab bar
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          href: null, // Hide from tab bar
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="favourites"
        options={{
          href: null, // Hide from tab bar
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="notifications"
        options={{
          href: null, // Hide from tab bar
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          href: null, // Hide from tab bar
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="support"
        options={{
          href: null, // Hide from tab bar
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="addresses"
        options={{
          href: null, // Hide from tab bar
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="payments"
        options={{
          href: null, // Hide from tab bar
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="map"
        options={{
          href: null, // Hide from tab bar
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="faqs"
        options={{
          href: null, // Hide from tab bar
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="terms"
        options={{
          href: null, // Hide from tab bar
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="privacy"
        options={{
          href: null, // Hide from tab bar
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="about"
        options={{
          href: null, // Hide from tab bar
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="change-password"
        options={{
          href: null, // Hide from tab bar
          headerShown: false,
        }}
      />
      </Tabs>
      {/* Sign Up prompt - floats over profile tab icon */}
      {showSignupPrompt && (
        <Animated.View 
          style={[
            styles.signupPromptContainer,
            { opacity: fadeAnim }
          ]}
          pointerEvents="box-none"
        >
          <View style={styles.signupPromptBubble}>
            <Text style={styles.signupPromptText}>Sign Up</Text>
            <TouchableOpacity
              style={styles.signupPromptCloseButton}
              onPress={async () => {
                await AsyncStorage.removeItem('showSignupPrompt');
                Animated.timing(fadeAnim, {
                  toValue: 0,
                  duration: 300,
                  useNativeDriver: true,
                }).start(() => {
                  setShowSignupPrompt(false);
                });
              }}
            >
              <Ionicons name="close" size={16} color="#000" />
            </TouchableOpacity>
          </View>
          {/* Arrow pointing to profile tab - centered */}
          <View style={styles.signupPromptArrow} />
        </Animated.View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  signupPromptContainer: {
    position: 'absolute',
    bottom: 100, // Above the tab bar
    right: 0, // Start from right edge
    width: '25%', // Width of one tab (4 tabs = 25% each)
    zIndex: 10000,
    alignItems: 'center', // Center content within the tab width
    pointerEvents: 'box-none', // Allows touches to pass through to content below
  },
  signupPromptBubble: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    paddingRight: 28,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    position: 'relative',
    marginRight: 0, // Align to the right side of the tab area
  },
  signupPromptText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
  },
  signupPromptCloseButton: {
    position: 'absolute',
    top: 4,
    right: 6,
    padding: 2,
  },
  signupPromptArrow: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 6,
    borderRightWidth: 6,
    borderTopWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#fff',
    marginTop: -1,
    alignSelf: 'center', // Center the arrow with the tab icon
  },
});
