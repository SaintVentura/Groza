import React, { useRef, useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, Animated, StyleSheet, Dimensions } from 'react-native';
import { useStore } from '@/store/useStore';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';
import type { Swipeable as SwipeableType } from 'react-native-gesture-handler';
import { navigateBack } from '../../utils/navigation';
import { useScrollPreservation } from '../../hooks/useScrollPreservation';
import { useFocusEffect } from '@react-navigation/native';

const { width } = Dimensions.get('window');

const FavouriteItem = ({ item, onRemove, onPress }: { item: any; onRemove: () => void; onPress: () => void }) => {
  const swipeableRef = useRef<SwipeableType | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={() => (
        <TouchableOpacity
          style={styles.trashButton}
          onPress={() => {
            swipeableRef.current?.close();
            onRemove();
          }}
        >
          <Ionicons name="trash" size={28} color="#fff" />
        </TouchableOpacity>
      )}
      onSwipeableOpen={() => setIsOpen(true)}
      onSwipeableClose={() => setIsOpen(false)}
    >
      <TouchableOpacity
        style={styles.restaurantCard}
        onPress={() => {
          if (!isOpen) {
            onPress();
          }
        }}
        activeOpacity={0.7}
      >
        <View style={styles.restaurantImageContainer}>
          <Image
            source={{ uri: item.image || 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=400&q=80' }}
            style={styles.restaurantImage}
            resizeMode="cover"
          />
          <View style={[styles.ratingBadge, { flexDirection: 'row', alignItems: 'center' }]}> 
            <Ionicons name="star" size={12} color="#FFD700" style={{ marginRight: 2 }} />
            <Text style={styles.ratingText}>{item.rating}</Text>
          </View>
        </View>
        <View style={styles.restaurantInfo}>
          <Text style={styles.restaurantName}>{item.name}</Text>
          <Text style={styles.restaurantCuisine}>{item.tagline}</Text>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );
};

export default function FavouritesScreen() {
  const { favourites = [], removeFavourite } = useStore();
  const colorSchemeRaw = useColorScheme();
  const colorScheme = colorSchemeRaw === 'dark' ? 'dark' : 'light';
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(24)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;
  const { scrollViewRef, handleScroll } = useScrollPreservation('favourites');

  // Handle back navigation with slide-down animation
  const handleBackPress = () => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 100,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Navigate after animation completes
      router.back();
    });
  };

  useFocusEffect(
    React.useCallback(() => {
      // Slide up animation
      slideAnim.setValue(100);
      fadeAnim.setValue(0);
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
      ]).start();

      return () => {
        // Cleanup animation on unmount
        slideAnim.setValue(100);
        fadeAnim.setValue(0);
      };
    }, [slideAnim, fadeAnim, translateY])
  );

  if (favourites.length === 0) {
    return (
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <Animated.View 
          style={[
            { flex: 1 },
            {
              transform: [
                { translateY: slideAnim }
              ],
              opacity: fadeAnim,
            }
          ]}
        >
          <View style={styles.cartHeadingContainer}>
            <TouchableOpacity 
              style={styles.backButton} 
              onPress={handleBackPress}
            >
              <Ionicons name="arrow-back" size={24} color={Colors[colorScheme].text} />
            </TouchableOpacity>
            <Text style={[styles.cartHeading, { color: Colors[colorScheme].text }]}>Favourites</Text>
          </View>
                 <View style={styles.emptyContent}>
           <Ionicons name="heart-outline" size={80} color={colorScheme === 'dark' ? '#fff' : '#9ca3af'} style={{ marginBottom: 0 }} />
           <Text style={[styles.emptyTitle, { color: Colors[colorScheme].text }]}>No favourites yet</Text>
           <Text style={[styles.emptySubtitle, { color: colorScheme === 'dark' ? '#aaa' : '#666' }]}>Tap the heart on a vendor page to add them to your favourites!</Text>
           <TouchableOpacity style={[styles.browseButton, { backgroundColor: colorScheme === 'dark' ? '#fff' : '#000', marginTop: 0 }]} onPress={() => router.push('/explore')}>
             <Text style={[styles.browseButtonText, { color: colorScheme === 'dark' ? '#000' : '#fff' }]}>Browse Street Vendors</Text>
           </TouchableOpacity>
         </View>
        </Animated.View>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#fff' }}>
      <Animated.View 
        style={[
          { flex: 1 },
          {
            transform: [
              { translateY: slideAnim }
            ],
            opacity: fadeAnim,
          }
        ]}
      >
        <View style={styles.cartHeadingContainer}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleBackPress}
          >
            <Ionicons name="arrow-back" size={24} color={Colors[colorScheme].text} />
          </TouchableOpacity>
          <Text style={[styles.cartHeading, { color: Colors[colorScheme].text }]}>Favourites</Text>
        </View>
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { color: Colors[colorScheme].text }]}>Saved Vendors</Text>
      </View>
      <FlatList
        data={favourites}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <FavouriteItem
            item={item}
            onRemove={() => removeFavourite(item.id)}
            onPress={() => router.push(`/(tabs)/restaurant/${item.id}?from=favourites`)}
          />
        )}
      />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  cartHeadingContainer: {
    paddingHorizontal: 20,
    paddingTop: 80,
    paddingBottom: 0,
    backgroundColor: '#fff',
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    marginRight: 16,
    padding: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  cartHeading: {
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: -1,
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  restaurantCard: {
    width: width * 0.9,
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  restaurantImageContainer: {
    position: 'relative',
  },
  restaurantImage: {
    width: '100%',
    height: 160,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  ratingBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.8)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  ratingText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 2,
  },
  restaurantInfo: {
    padding: 16,
  },
  restaurantName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 4,
  },
  restaurantCuisine: {
    fontSize: 14,
    color: '#666',
  },
  restaurantDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  deliveryTime: {
    fontSize: 14,
    color: '#666',
  },
  deliveryFee: {
    fontSize: 14,
    color: '#666',
  },
  emptyContent: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    marginTop: -50, // Move content higher
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 17, // Set spacing to 17px between text and button to match orders page
  },
  browseButton: {
    backgroundColor: '#000',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  trashButton: {
    backgroundColor: '#e11d48',
    justifyContent: 'center',
    alignItems: 'center',
    width: 64,
    height: '90%',
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
    marginTop: 8,
    marginBottom: 8,
  },
}); 