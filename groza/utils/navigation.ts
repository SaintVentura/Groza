import { router } from 'expo-router';

// Store scroll positions for different screens
const scrollPositions = new Map<string, { x: number; y: number }>();

export const navigateBack = () => {
  // Use router.back() which maintains the navigation stack state
  // React Navigation automatically preserves scroll positions for screens in the stack
  router.back();
};

export const saveScrollPosition = (screenKey: string, x: number, y: number) => {
  scrollPositions.set(screenKey, { x, y });
};

export const getScrollPosition = (screenKey: string) => {
  return scrollPositions.get(screenKey);
};

export const clearScrollPosition = (screenKey: string) => {
  scrollPositions.delete(screenKey);
};
