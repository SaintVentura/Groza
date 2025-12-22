import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Switch,
  StyleSheet,
  Animated,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from 'react-native';
import { useScrollPreservation } from '../../hooks/useScrollPreservation';
import { useFocusEffect } from '@react-navigation/native';
import { useStore } from '@/store/useStore';

export default function SettingsScreen() {
  const colorScheme = 'light';
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [locationEnabled, setLocationEnabled] = useState(true);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(24)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;
  const isFirstLoad = useRef(true);
  const { scrollViewRef, handleScroll } = useScrollPreservation('settings');

  useFocusEffect(
    React.useCallback(() => {
      slideAnim.setValue(100);
      fadeAnim.setValue(0);
      if (isFirstLoad.current) {
        translateY.setValue(24);
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          isFirstLoad.current = false;
        });
      } else {
        translateY.setValue(0);
        Animated.parallel([
          Animated.timing(slideAnim, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }, [slideAnim, fadeAnim, translateY])
  );

  const handleBackPress = () => {
    router.push('/(tabs)/profile');
  };

  const settingsSections = [
    {
      title: 'Preferences',
      items: [
        {
          icon: 'location-outline',
          title: 'Location Services',
          subtitle: 'Allow location access for delivery',
          type: 'switch',
          value: locationEnabled,
          onToggle: async (value: boolean) => {
            setLocationEnabled(value);
            if (value) {
              try {
                const Location = await import('expo-location');
                const requestFn = Location?.default?.requestForegroundPermissionsAsync || Location?.requestForegroundPermissionsAsync;
                
                if (typeof requestFn === 'function') {
                  await requestFn();
                } else {
                  Alert.alert(
                    'Location Permission',
                    'Location services are not available. Please build a development version to enable this feature.'
                  );
                  setLocationEnabled(false);
                }
              } catch (error) {
                Alert.alert(
                  'Location Permission',
                  'Location services may have limited functionality in Expo Go. For full features, build a development version.'
                );
                setLocationEnabled(false);
              }
            }
          },
        },
      ],
    },
    {
      title: 'Privacy',
      items: [
        {
          icon: 'analytics-outline',
          title: 'Analytics',
          subtitle: 'Help improve the app',
          type: 'switch',
          value: analyticsEnabled,
          onToggle: setAnalyticsEnabled,
        },
        {
          icon: 'lock-closed-outline',
          title: 'Privacy Policy',
          subtitle: 'View our privacy policy',
          type: 'navigation',
          onPress: () => router.push('/(tabs)/privacy'),
        },
        {
          icon: 'document-text-outline',
          title: 'Terms of Service',
          subtitle: 'Read terms and conditions',
          type: 'navigation',
          onPress: () => router.push('/(tabs)/terms'),
        },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          icon: 'person-outline',
          title: 'Edit Profile',
          subtitle: 'Update your personal information',
          type: 'navigation',
          onPress: () => router.push('/(tabs)/profile'),
        },
        {
          icon: 'key-outline',
          title: 'Change Password',
          subtitle: 'Update your password',
          type: 'navigation',
          onPress: () => router.push('/(tabs)/change-password'),
        },
        {
          icon: 'trash-outline',
          title: 'Delete Account',
          subtitle: 'Permanently delete your account',
          type: 'navigation',
          onPress: () => {
            Alert.alert(
              'Delete Account',
              'Are you sure you want to permanently delete your account? This action cannot be undone.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete',
                  style: 'destructive',
                  onPress: () => {
                    Alert.alert('Account Deletion', 'Please contact support at grozadelivery@gmail.com to delete your account.');
                  },
                },
              ]
            );
          },
          danger: true,
        },
      ],
    },
    {
      title: 'About',
      items: [
        {
          icon: 'information-circle-outline',
          title: 'App Version',
          subtitle: 'Groza v1.0.0',
          type: 'info',
        },
        {
          icon: 'star-outline',
          title: 'Rate App',
          subtitle: 'Rate us on the App Store',
          type: 'navigation',
          onPress: async () => {
            const { openURL } = await import('expo-linking');
            const appStoreUrl = Platform.OS === 'ios' 
              ? 'https://apps.apple.com/app/groza/id123456789'
              : 'https://play.google.com/store/apps/details?id=com.groza.app';
            openURL(appStoreUrl).catch(() => {
              Alert.alert('Rate App', 'App store link will be available when the app is published.');
            });
          },
        },
        {
          icon: 'share-outline',
          title: 'Share App',
          subtitle: 'Tell your friends about Groza',
          type: 'navigation',
          onPress: async () => {
            const { Share } = await import('react-native');
            try {
              await Share.share({
                message: 'Check out Groza - the best way to order from local street vendors! Download now.',
                title: 'Share Groza',
              });
            } catch (error) {
              Alert.alert('Share', 'Unable to share at this time.');
            }
          },
        },
      ],
    },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <Animated.View
        style={[
          { flex: 1 },
          {
            transform: [{ translateY: slideAnim }],
            opacity: fadeAnim,
          },
        ]}
      >
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
            <Ionicons name="arrow-back" size={24} color={Colors[colorScheme].text} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: Colors[colorScheme].text }]}>Settings</Text>
        </View>

        <ScrollView
          ref={scrollViewRef as any}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          {settingsSections.map((section, sectionIndex) => (
            <View key={sectionIndex} style={styles.section}>
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <View style={styles.sectionContent}>
                {section.items.map((item, itemIndex) => (
                  <TouchableOpacity
                    key={itemIndex}
                    style={[
                      styles.settingItem,
                      itemIndex !== section.items.length - 1 && styles.settingItemBorder,
                      item.danger && styles.dangerItem,
                    ]}
                    onPress={item.type === 'navigation' ? item.onPress : undefined}
                    disabled={item.type !== 'navigation'}
                  >
                    <View style={styles.settingIcon}>
                      <Ionicons
                        name={item.icon as any}
                        size={24}
                        color={item.danger ? '#FF3B30' : '#000'}
                      />
                    </View>
                    <View style={styles.settingContent}>
                      <Text style={[styles.settingTitle, item.danger && styles.dangerText]}>
                        {item.title}
                      </Text>
                      <Text style={styles.settingSubtitle}>{item.subtitle}</Text>
                    </View>
                    {item.type === 'switch' && (
                      <Switch
                        value={item.value}
                        onValueChange={(value) => {
                          if (item.onToggle) {
                            if (typeof item.onToggle === 'function' && item.onToggle.length > 0) {
                              item.onToggle(value);
                            } else {
                              item.onToggle();
                            }
                          }
                        }}
                        trackColor={{ false: '#e0e0e0', true: '#000' }}
                        thumbColor="#fff"
                      />
                    )}
                    {item.type === 'navigation' && (
                      <Ionicons name="chevron-forward" size={20} color="#ccc" />
                    )}
                    {item.type === 'info' && <View style={{ width: 24 }} />}
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 80,
    paddingBottom: 20,
    backgroundColor: '#fff',
  },
  backButton: {
    marginRight: 16,
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  headerTitle: {
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: -1,
  },
  section: {
    marginTop: 32,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  settingItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  dangerItem: {
    backgroundColor: '#fff5f5',
  },
  dangerText: {
    color: '#FF3B30',
  },
});

