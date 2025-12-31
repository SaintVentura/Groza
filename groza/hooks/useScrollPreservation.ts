import React, { useRef, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { ScrollView } from 'react-native';

interface ScrollPosition {
  x: number;
  y: number;
}

// Global store for scroll positions
const scrollPositions = new Map<string, ScrollPosition>();

export const useScrollPreservation = (screenKey: string) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const currentScrollPosition = useRef<ScrollPosition>({ x: 0, y: 0 });

  // Save scroll position when screen loses focus
  useFocusEffect(
    React.useCallback(() => {
      return () => {
        // Save the current scroll position when leaving the screen
        scrollPositions.set(screenKey, currentScrollPosition.current);
      };
    }, [screenKey])
  );

  // Restore scroll position when screen gains focus
  useFocusEffect(
    React.useCallback(() => {
      // Restore saved position for all pages
      const savedPosition = scrollPositions.get(screenKey);
      if (savedPosition) {
        setTimeout(() => {
          if (scrollViewRef.current && typeof scrollViewRef.current.scrollTo === 'function') {
            scrollViewRef.current.scrollTo({
              x: savedPosition.x,
              y: savedPosition.y,
              animated: false,
            });
          }
        }, 100);
      }
    }, [screenKey])
  );

  // Handle scroll events to track current position
  const handleScroll = (event: any) => {
    const { contentOffset } = event.nativeEvent;
    currentScrollPosition.current = {
      x: contentOffset.x,
      y: contentOffset.y,
    };
  };

  return { scrollViewRef, handleScroll };
};

// Utility function to manually save scroll position
export const saveScrollPosition = (screenKey: string, x: number, y: number) => {
  scrollPositions.set(screenKey, { x, y });
};

// Utility function to get saved scroll position
export const getScrollPosition = (screenKey: string) => {
  return scrollPositions.get(screenKey);
};

// Utility function to clear saved scroll position
export const clearScrollPosition = (screenKey: string) => {
  scrollPositions.delete(screenKey);
};
