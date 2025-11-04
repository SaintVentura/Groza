// @ts-ignore
import React from 'react';
// @ts-ignore
import { View, StyleSheet, Platform, Image } from 'react-native';
// @ts-ignore
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export function BrandHeader() {
  const insets = useSafeAreaInsets ? useSafeAreaInsets() : { top: 0 };
  return (
    <SafeAreaView style={[styles.safe, { paddingTop: insets.top || (Platform.OS === 'ios' ? 28 : 12) }]}> 
      <View style={styles.container}>
        {/* eslint-disable-next-line @typescript-eslint/no-var-requires */}
        {/* @ts-ignore */}
        <Image
          source={require('./groza/assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
          accessible
          accessibilityLabel="Groza logo"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    backgroundColor: 'transparent',
  },
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    marginTop: 0,
  },
  logo: {
    width: 120,
    height: 48,
    marginTop: 0,
    alignSelf: 'center',
  },
}); 