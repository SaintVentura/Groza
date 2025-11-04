// @ts-ignore
import React from 'react';
// @ts-ignore
import { DefaultTheme } from '@react-navigation/native';
// @ts-ignore
import { useFonts } from 'expo-font';
// @ts-ignore
import { Stack } from 'expo-router';
// @ts-ignore
import { StatusBar } from 'expo-status-bar';
// @ts-ignore
import { useEffect } from 'react';
// @ts-ignore
import 'react-native-reanimated';

// @ts-ignore
import AnimatedSplash from '../components/AnimatedSplash';
// @ts-ignore
import { useStore } from '../groza/store/useStore';

// @ts-ignore
import JostFont from '../groza/assets/fonts/Jost-VariableFont_wght.ttf';
// @ts-ignore
import SpaceMonoFont from '../groza/assets/fonts/SpaceMono-Regular.ttf';

export default function RootLayout() {
  const { setUser, setAuthenticated, setLoading } = useStore();

  const [loaded] = useFonts({
    // @ts-ignore
    Jost: require('../groza/assets/fonts/Jost-VariableFont_wght.ttf'),
    // @ts-ignore
    SpaceMono: require('../groza/assets/fonts/SpaceMono-Regular.ttf'),
  });
  const [showSplash, setShowSplash] = React.useState(true);

  React.useEffect(() => {
    if (loaded && showSplash === false) {
      // Fonts loaded and splash finished
    }
  }, [loaded, showSplash]);

  useEffect(() => {
    const initializeAuth = async () => {
      setLoading(true);
      try {
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
  if (showSplash) {
    return <AnimatedSplash onFinish={() => setShowSplash(false)} />;
  }

  return (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  );
} 