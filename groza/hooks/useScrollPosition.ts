import { useRef, useEffect, useCallback } from 'react';
import { useFocusEffect } from '@react-navigation/native';

interface ScrollPosition {
  x: number;
  y: number;
}

const scrollPositions = new Map<string, ScrollPosition>();

export const useScrollPosition = (screenKey: string) => {
  const scrollViewRef = useRef<any>(null);

  // Save scroll position when screen loses focus
  useFocusEffect(
    useCallback(() => {
      return () => {
        if (scrollViewRef.current) {
          scrollViewRef.current.getScrollResponder()?.getScrollableNode()?.measure((x: number, y: number, width: number, height: number, pageX: number, pageY: number) => {
            scrollPositions.set(screenKey, { x: pageX, y: pageY });
          });
        }
      };
    }, [screenKey])
  );

  // Restore scroll position when screen gains focus
  useFocusEffect(
    useCallback(() => {
      const savedPosition = scrollPositions.get(screenKey);
      if (savedPosition && scrollViewRef.current) {
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({
            x: savedPosition.x,
            y: savedPosition.y,
            animated: false,
          });
        }, 100);
      }
    }, [screenKey])
  );

  return scrollViewRef;
};






















