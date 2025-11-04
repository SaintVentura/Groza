import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  StyleSheet,
  TextInput,
  Modal,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useStore } from '@/store/useStore';
import * as ImagePicker from 'expo-image-picker';
import { useFocusEffect } from '@react-navigation/native';
import { navigateBack } from '../../utils/navigation';
import { useScrollPreservation } from '../../hooks/useScrollPreservation';

export default function ProfileScreen() {
  const { user, setUser, setAuthenticated, orders, favourites = [] } = useStore();
  const [profileImage, setProfileImage] = React.useState(user?.avatar || null);
  const [bannerImage, setBannerImage] = React.useState<string | null>(null);
  const [showUsernameModal, setShowUsernameModal] = useState(false);
  const [newUsername, setNewUsername] = useState(user?.username || '');
  const [showFavoritesModal, setShowFavoritesModal] = useState(false);
  
  // Add scroll preservation for profile screen
  const { scrollViewRef, handleScroll } = useScrollPreservation('profile');

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(24)).current;
  const versionFadeAnim = useRef(new Animated.Value(0)).current; // NEW: for version text
  const isFirstLoad = useRef(true);
  const [animTrigger, setAnimTrigger] = useState(0);
  useFocusEffect(
    React.useCallback(() => {
      setAnimTrigger((t) => t + 1);
      fadeAnim.setValue(0);
      versionFadeAnim.setValue(0); // NEW: reset version text fade
      if (isFirstLoad.current) {
        translateY.setValue(24);
        Animated.parallel([
          Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: 0,
            duration: 600,
            useNativeDriver: true,
          }),
        ]).start(() => {
          isFirstLoad.current = false;
          // NEW: Fade in version text after main fade-in
          Animated.timing(versionFadeAnim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
          }).start();
        });
      } else {
        translateY.setValue(0);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }).start(() => {
          // NEW: Fade in version text after main fade-in
          Animated.timing(versionFadeAnim, {
            toValue: 1,
            duration: 400,
          useNativeDriver: true,
        }).start();
        });
      }
    }, [fadeAnim, translateY, versionFadeAnim])
  );

  const pickImage = async (setter: (uri: string) => void) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });
    if (!result.canceled && result.assets && result.assets.length > 0) {
      setter(result.assets[0].uri);
    }
  };

  const handleUsernameUpdate = () => {
    if (newUsername.trim() && user) {
      Alert.alert(
        'Confirm Username Change',
        `Are you sure you want to change your username to @${newUsername.trim()}?`,
        [
          {
            text: 'No, Keep Current',
            style: 'cancel',
            onPress: () => {
              setNewUsername(user?.username || '');
              setShowUsernameModal(false);
            }
          },
          {
            text: 'Yes, Save New Username',
            style: 'default',
            onPress: () => {
              const updatedUser = {
                ...user,
                username: newUsername.trim(),
              };
              setUser(updatedUser);
              setShowUsernameModal(false);
            }
          }
        ]
      );
    }
  };

  const handleSignOut = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              setUser(null);
              setAuthenticated(false);
              router.replace('/(auth)/login');
            } catch (error: any) {
              Alert.alert('Error', error.message);
            }
          },
        },
      ]
    );
  };

  const menuItems = [
    {
      icon: 'receipt-outline',
      title: 'My Orders',
      subtitle: `${orders.length} orders`,
      onPress: () => router.push('/orders'),
    },
    {
      icon: 'heart-outline',
      title: 'Favourites',
      subtitle: 'Your saved restaurants',
      onPress: () => router.push('/(tabs)/favourites'),
    },
    {
      icon: 'location-outline',
      title: 'Delivery Addresses',
      subtitle: 'Manage your addresses',
      onPress: () => Alert.alert('Coming Soon', 'This feature will be available soon!'),
    },
    {
      icon: 'card-outline',
      title: 'Payment Methods',
      subtitle: 'Manage your cards',
      onPress: () => Alert.alert('Coming Soon', 'This feature will be available soon!'),
    },
    {
      icon: 'notifications-outline',
      title: 'Notifications',
      subtitle: 'Manage your notification preferences',
      onPress: () => router.push('/notifications'),
    },
    {
      icon: 'help-circle-outline',
      title: 'Help & Support',
      subtitle: 'Get help with your orders',
      onPress: () => Alert.alert('Coming Soon', 'This feature will be available soon!'),
    },
    {
      icon: 'settings-outline',
      title: 'Settings',
      subtitle: 'App preferences',
      onPress: () => Alert.alert('Coming Soon', 'This feature will be available soon!'),
    },
  ];

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY }] }}>
      <ScrollView 
        ref={scrollViewRef}
        style={[styles.container, { backgroundColor: '#fff', flex: 1 }]} 
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Profile Picture and Name */}
        <View style={{ alignItems: 'center', marginBottom: 0, paddingBottom: 0, paddingTop: 96 }}>
          {user?.name ? (
            <>
              <View style={{ position: 'relative', width: 220, height: 220 }}>
                <TouchableOpacity onPress={() => pickImage(setProfileImage)} activeOpacity={0.8}>
                  {profileImage ? (
                    <Image
                      source={{ uri: profileImage }}
                      style={{ width: 220, height: 220, borderRadius: 110, borderWidth: 8, borderColor: '#fff', backgroundColor: '#fff' }}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.defaultProfileContainer}>
                      <Ionicons name="add" size={60} color="#666" />
                    </View>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    backgroundColor: '#fff',
                    borderRadius: 20,
                    padding: 10,
                    elevation: 2,
                    position: 'absolute',
                    right: 8,
                    top: 8,
                  }}
                  onPress={() => pickImage(setProfileImage)}
                >
                  <Ionicons name="pencil" size={24} color="#000" />
                </TouchableOpacity>
              </View>
              
              {/* Username Display with Edit Button */}
              <View style={[styles.usernameContainer, { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', width: '100%' }]}> 
                <Text style={[styles.usernameText, { textAlign: 'center', flexShrink: 1 }]}>
                  @{user.username}
                </Text>
                <TouchableOpacity
                  style={{ backgroundColor: '#e0e0e0', borderRadius: 12, padding: 3, justifyContent: 'center', alignItems: 'center', marginLeft: 6, marginTop: 4 }}
                  onPress={() => setShowUsernameModal(true)}
                >
                  <Ionicons name="pencil" size={14} color="#000" />
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <View style={styles.defaultProfileContainer}>
                <Image
                  source={require('../../assets/images/logo.png')}
                  style={{ width: 180, height: 180, borderRadius: 90 }}
                  resizeMode="contain"
                />
              </View>
              <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#000', marginTop: 16, textAlign: 'center' }}>Guest Account</Text>
              <Text style={{ fontSize: 16, color: '#666', marginTop: 8, marginBottom: 16, textAlign: 'center', maxWidth: 320 }}>
                Sign in or create an account to personalize your profile.
              </Text>
              <TouchableOpacity
                style={{ backgroundColor: '#000', borderRadius: 12, paddingVertical: 14, paddingHorizontal: 32, marginTop: 8, marginBottom: 32 }}
                onPress={() => router.replace('/(auth)/login')}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 18 }}>Sign Up or Login</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
        {/* Profile Header and Stats */}
        {user?.name && (
          <>
            <View style={styles.profileHeader}>
              <View style={styles.profileInfo}>
                <View style={styles.profileDetails}>
                  <Text style={styles.profileName}>{user?.name}</Text>
                  <Text style={styles.profileEmail}>{user?.email}</Text>
                  <Text style={styles.profileRole}>
                    {user?.role}
                  </Text>
                </View>
              </View>
            </View>
            {/* Quick Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>{orders.length}</Text>
                <Text style={styles.statLabel}>Orders</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>5</Text>
                <Text style={styles.statLabel}>Favourites</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>4.8</Text>
                <Text style={styles.statLabel}>Rating</Text>
              </View>
            </View>
          </>
        )}

        {/* Menu Items */}
        <View style={styles.menuContainer}>
          {(user?.name
            ? menuItems
            : menuItems.filter(item =>
                [
                  'notifications-outline',
                  'help-circle-outline',
                  'settings-outline',
                ].includes(item.icon)
              )
          ).map((item, index, arr) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.menuItem,
                index !== arr.length - 1 && styles.menuItemBorder
              ]}
              onPress={item.onPress}
            >
              <View style={styles.menuIcon}>
                <Ionicons name={item.icon as any} size={20} color="#000" />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color="#ccc" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Sign Out Button */}
        {user?.name && (
          <View style={styles.signOutContainer}>
            <TouchableOpacity
              style={styles.signOutButton}
              onPress={handleSignOut}
            >
              <Text style={styles.signOutText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* App Version */}
        <Animated.View style={[styles.versionContainer, { opacity: versionFadeAnim }]}> 
          <Text style={styles.versionText}>Groza v1.0.0</Text>
        </Animated.View>

        {/* Username Edit Modal */}
        <Modal
          visible={showUsernameModal}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setShowUsernameModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Edit Username</Text>
              <Text style={styles.modalSubtitle}>Choose a unique username for your profile</Text>
              
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Username</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Enter username (without @)"
                  value={newUsername}
                  onChangeText={setNewUsername}
                  autoCapitalize="none"
                  autoCorrect={false}
                  maxLength={20}
                />
                <Text style={styles.inputHint}>Your username will appear as @{newUsername || 'username'}</Text>
              </View>

              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setNewUsername(user?.username || '');
                    setShowUsernameModal(false);
                  }}
                >
                  <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.saveButton, !newUsername.trim() && styles.saveButtonDisabled]}
                  onPress={handleUsernameUpdate}
                  disabled={!newUsername.trim()}
                >
                  <Text style={styles.saveButtonText}>Save</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Favorites Modal */}
        <Modal visible={showFavoritesModal} animationType="slide" onRequestClose={() => setShowFavoritesModal(false)}>
          <View style={{ flex: 1, backgroundColor: '#fff', padding: 24 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>Favorite Vendors</Text>
            {favourites.length === 0 ? (
              <Text style={{ color: '#888', fontSize: 16 }}>No favourites yet.</Text>
            ) : (
              favourites.map((vendor) => (
                <TouchableOpacity
                  key={vendor.id}
                  style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 16 }}
                  onPress={() => {
                    setShowFavoritesModal(false);
                    router.push(`/restaurant/${vendor.id}`);
                  }}
                >
                  <Image source={{ uri: vendor.image }} style={{ width: 48, height: 48, borderRadius: 12, marginRight: 12 }} />
                  <View>
                    <Text style={{ fontWeight: 'bold', fontSize: 18 }}>{vendor.name}</Text>
                    <Text style={{ color: '#888' }}>{vendor.tagline}</Text>
                  </View>
                </TouchableOpacity>
              ))
            )}
            <TouchableOpacity onPress={() => setShowFavoritesModal(false)} style={{ marginTop: 24, alignSelf: 'center' }}>
              <Text style={{ color: '#2563eb', fontWeight: 'bold', fontSize: 16 }}>Close</Text>
            </TouchableOpacity>
          </View>
        </Modal>
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modernLogo: {
    fontSize: 42,
    fontWeight: '800',
    color: '#000',
    letterSpacing: -1,
    marginTop: 80,
    marginBottom: 32,
    marginLeft: 20,
  },
  defaultProfileContainer: {
    width: 220,
    height: 220,
    borderRadius: 110,
    borderWidth: 8,
    borderColor: '#fff',
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  usernameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 20,
  },
  usernameText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  usernameEditButton: {
    marginLeft: 12,
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 16,
  },
  profileHeader: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  profileInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  profileDetails: {
    flex: 1,
    marginLeft: 16,
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  profileEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  profileRole: {
    fontSize: 14,
    color: '#999',
    textTransform: 'capitalize',
  },
  editButton: {
    padding: 8,
  },
  statsContainer: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    marginBottom: 16,
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#666',
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#f0f0f0',
  },
  menuContainer: {
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  menuItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuIcon: {
    width: 40,
    height: 40,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 2,
  },
  menuSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  signOutContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  signOutButton: {
    backgroundColor: '#000',
    borderWidth: 1,
    borderColor: '#000',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  signOutText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  versionContainer: {
    paddingHorizontal: 20,
    paddingTop: 5, // decreased from 7px to 5px for fine-tuned spacing
    paddingBottom: 109, // increased from 105 to 109 for precise bottom padding
    alignItems: 'center',
  },
  versionText: {
    fontSize: 14,
    color: '#999',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 20,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 8,
    textAlign: 'center',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000',
    backgroundColor: '#fff',
  },
  inputHint: {
    fontSize: 14,
    color: '#666',
    marginTop: 8,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#d1d5db',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  saveButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    backgroundColor: '#000',
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#fff',
  },
}); 