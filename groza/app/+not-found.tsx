import { Link, Stack } from 'expo-router';
import { StyleSheet, Text } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from 'react-native';

export default function NotFoundScreen() {
  const colorSchemeRaw = useColorScheme();
  const colorScheme = colorSchemeRaw === 'dark' ? 'dark' : 'light';
  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <ThemedView style={[styles.container, { backgroundColor: Colors[colorScheme].background }] }>
        <Text style={{ fontSize: 36, fontWeight: 'bold', letterSpacing: 2, color: colorScheme === 'dark' ? '#fff' : '#000', textAlign: 'center', marginBottom: 24 }}>GROZA</Text>
        <ThemedText type="title" style={{ color: Colors[colorScheme].text }}>This screen does not exist.</ThemedText>
        <Link href="/" style={styles.link}>
          <ThemedText type="link" style={{ color: Colors[colorScheme].text }}>Go to home screen!</ThemedText>
        </Link>
      </ThemedView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  link: {
    marginTop: 15,
    paddingVertical: 15,
  },
});
