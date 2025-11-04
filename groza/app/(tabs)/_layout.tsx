import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Ionicons, Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useStore } from '@/store/useStore';
import { Colors } from '@/constants/Colors';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const { cart } = useStore();
  const insets = useSafeAreaInsets();

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
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
    </Tabs>
  );
}
