import { useColorScheme as useRNColorScheme } from 'react-native';
import { useStore } from '@/store/useStore';

export function useColorScheme() {
  const systemColorScheme = useRNColorScheme();
  const { darkModeEnabled } = useStore();
  
  // If user has explicitly set dark mode preference, use it
  // Otherwise, use system preference
  if (darkModeEnabled !== undefined && darkModeEnabled !== null) {
    return darkModeEnabled ? 'dark' : 'light';
  }
  
  return systemColorScheme ?? 'light';
}
