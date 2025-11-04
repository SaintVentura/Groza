
import React, { useState, useRef, useCallback, memo, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  FlatList,
  Alert,
  StyleSheet,
  Dimensions,
  Platform,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { vendors } from '@/constants/Vendors';
import { useFocusEffect } from '@react-navigation/native';
import { useScrollPreservation } from '../../hooks/useScrollPreservation';

const { width } = Dimensions.get('window');

const getVendorImage = () =>
  Platform.OS === 'web'
    ? { uri: '/assets/images/home-logo.png' }
    : require('../../assets/images/home-logo.png');

// Add categories from home screen
const categories = [
  { id: '1', name: 'Mangos', icon: '🥭', color: '#FFA500' },
  { id: '2', name: 'Broccoli', icon: '🥦', color: '#228B22' },
  { id: '3', name: 'Grapes', icon: '🍇', color: '#6F2DA8' },
  { id: '4', name: 'Onions', icon: '🧅', color: '#8B4513' },
  { id: '5', name: 'Strawberries', icon: '🍓', color: '#FC5A8D' },
  { id: '6', name: 'Cucumbers', icon: '🥒', color: '#228B22' },
  { id: '7', name: 'Tomatoes', icon: '🍅', color: '#FF6347' },
  { id: '8', name: 'Avocados', icon: '🥑', color: '#228B22' },
  { id: '9', name: 'Bananas', icon: '🍌', color: '#FFE135' },
  { id: '10', name: 'Peppers', icon: '🫑', color: '#228B22' },
  { id: '11', name: 'Pineapples', icon: '🍍', color: '#FFD700' },
  { id: '12', name: 'Carrots', icon: '🥕', color: '#FFA500' },
  { id: '13', name: 'Apples', icon: '🍎', color: '#DC143C' },
  { id: '14', name: 'Spinach', icon: '🥬', color: '#228B22' },
  { id: '15', name: 'Oranges', icon: '🍊', color: '#FF8C00' },
  { id: '16', name: 'Potatoes', icon: '🥔', color: '#8B4513' },
];

// Add DemoPill component (copied from index.tsx)
type DemoPillPosition = 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight' | 'centerTop' | 'centerBottom';
function DemoPill({ position = 'topRight' }: { position?: DemoPillPosition }) {
  let style: any = { position: 'absolute', zIndex: 10, backgroundColor: 'red', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 };
  if (position === 'topLeft') style = { ...style, top: 12, left: 12 };
  if (position === 'topRight') style = { ...style, top: 12, right: 12 };
  if (position === 'bottomLeft') style = { ...style, bottom: 12, left: 12 };
  if (position === 'bottomRight') style = { ...style, bottom: 12, right: 12 };
  if (position === 'centerTop') style = { ...style, top: 12, left: '50%', transform: [{ translateX: -32 }] };
  if (position === 'centerBottom') style = { ...style, bottom: 12, left: '50%', transform: [{ translateX: -32 }] };
  return (
    <View style={style}>
      <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 12 }}>DEMO</Text>
    </View>
  );
}

// Add at the top of the file, outside the component
let lastExploreScrollPosition = 0;

export default function ExploreScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSorts, setSelectedSorts] = useState<Array<{type: string, direction: 'asc' | 'desc'}>>([]);
  const [selectedDeliveryType, setSelectedDeliveryType] = useState<'pickup' | 'delivery' | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const colorSchemeRaw = useColorScheme();
  const colorScheme = colorSchemeRaw === 'dark' ? 'dark' : 'light';
  const categoriesListRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const mainScrollRef = useRef<ScrollView | null>(null);
  const flatListRef = useRef<FlatList | null>(null);
  const [scrollPosition, setScrollPosition] = useState(0);
  const savedScrollPosition = useRef(0);
  const isScrolling = useRef(false);
  const shouldRestoreScroll = useRef(false);
  const lastScrollPosition = useRef(0);
  
  // Add scroll preservation for explore screen
  const { scrollViewRef, handleScroll: handleScrollPreservation } = useScrollPreservation('explore');

  useFocusEffect(
    React.useCallback(() => {
      fadeAnim.setValue(0);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }, [fadeAnim])
  );

  // Save scroll position before category changes
  const handleCategoryChange = (categoryId: string) => {
    if (flatListRef.current) {
      savedScrollPosition.current = scrollPosition;
      shouldRestoreScroll.current = true;
    }
    
    setSelectedCategories((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter(id => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  // Save scroll position on every scroll event
  const handleScroll = (event: any) => {
    const currentPosition = event.nativeEvent.contentOffset.y;
    lastScrollPosition.current = currentPosition;
    setScrollPosition(currentPosition);
    lastExploreScrollPosition = currentPosition; // Save globally
    
    // Also call the scroll preservation handler
    handleScrollPreservation(event);
  };

  // Copy renderQuickAction, renderCategoryCard, renderSortButton from home
  const renderQuickAction = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.quickActionCard}
      onPress={() => Alert.alert('Coming Soon', `${item.title} will be available soon!`)}
    >
      <Text style={styles.quickActionTitle}>{item.title}</Text>
    </TouchableOpacity>
  );

  const CategoryCard = memo(({ item, isSelected, onPress }: { item: any, isSelected: boolean, onPress: () => void }) => (
    <TouchableOpacity
      style={[
        styles.categoryCardPlain,
        {
          backgroundColor: isSelected ? '#000' : 'transparent',
          borderWidth: isSelected ? 0 : 0,
          borderRadius: 12,
          borderColor: 'transparent',
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Text style={[styles.categoryIconPlain, { fontSize: 36, color: isSelected ? '#fff' : '#000' }]}>{item.icon}</Text>
      <Text style={[styles.categoryNamePlain, { fontSize: 12, color: isSelected ? '#fff' : '#333' }]}>{item.name}</Text>
    </TouchableOpacity>
  ));

  const renderCategoryCard = useCallback(
    ({ item }: { item: any }) => {
      const isSelected = selectedCategories.includes(item.id);
      const handlePress = () => {
        if (isSelected) {
          setSelectedCategories((prev) => prev.filter(id => id !== item.id));
        } else {
          setSelectedCategories((prev) => [...prev, item.id]);
        }
      };
      return <CategoryCard item={item} isSelected={isSelected} onPress={handlePress} />;
    }, [selectedCategories]
  );

  const handleSortToggle = (type: string) => {
    const existingIndex = selectedSorts.findIndex(sort => sort.type === type);
    if (existingIndex >= 0) {
      // Deselect if already selected
      setSelectedSorts(selectedSorts.filter((_, idx) => idx !== existingIndex));
    } else {
      // Add new sort criteria with correct direction
      let direction: 'asc' | 'desc' = 'asc';
      if (type === 'rating') direction = 'desc';
      setSelectedSorts([...selectedSorts, { type, direction }]);
    }
  };

  const renderSortButton = (type: string, label: string) => {
    const selectedSort = selectedSorts.find(sort => sort.type === type);
    const isSelected = !!selectedSort;
    return (
      <TouchableOpacity
        style={[
          styles.sortButton,
          isSelected && styles.sortButtonActive
        ]}
        onPress={() => handleSortToggle(type)}
      >
        <Text style={[styles.sortButtonText, isSelected && styles.sortButtonTextActive]}>{label}</Text>
      </TouchableOpacity>
    );
  };

  // Sort vendors based on multiple criteria
  const getSortedVendors = () => {
    const sortedVendors = [...vendors];
    
    if (selectedSorts.length === 0) {
      return sortedVendors;
    }

    sortedVendors.sort((a, b) => {
      for (const sort of selectedSorts) {
        let comparison = 0;
        
        switch (sort.type) {
          case 'rating':
            comparison = a.rating - b.rating;
            break;
          case 'distance':
            const aDistance = parseFloat(a.distance.replace(' km', ''));
            const bDistance = parseFloat(b.distance.replace(' km', ''));
            comparison = aDistance - bDistance;
            break;
          case 'delivery':
            const aTime = parseInt(a.deliveryEstimate.split('-')[0]);
            const bTime = parseInt(b.deliveryEstimate.split('-')[0]);
            comparison = aTime - bTime;
            break;
        }
        
        if (comparison !== 0) {
          return sort.direction === 'asc' ? comparison : -comparison;
        }
      }
      return 0;
    });
    
    return sortedVendors;
  };

  // Add quickActions array
  const quickActions = [
    { id: '1', title: 'PICKUP' },
    { id: '2', title: 'DELIVERY' },
  ];

  const renderVendorCard = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.restaurantCard}
      onPress={() => {
        lastExploreScrollPosition = scrollPosition; // Save before navigating
        router.push(`/restaurant/${item.id}?from=explore`);
      }}
    >
      <View style={styles.restaurantImageContainer}>
        <DemoPill position="topLeft" />
        <Image
          source={{ uri: item.image || 'https://images.unsplash.com/photo-1502741338009-cac2772e18bc?auto=format&fit=crop&w=400&q=80' }}
          style={styles.restaurantImage}
          resizeMode="cover"
        />
        <View style={[styles.restaurantBadge, { flexDirection: 'row', alignItems: 'center' }]}>
          <Ionicons name="star" size={12} color="#FFD700" style={{ marginRight: 2 }} />
          <Text style={styles.restaurantBadgeText}>{item.rating}</Text>
        </View>
      </View>
      <View style={styles.restaurantInfo}>
        <Text style={styles.restaurantName}>{item.name}</Text>
        <Text style={styles.restaurantCuisine}>{item.tagline}</Text>
        <View style={styles.restaurantDetails}>
          <Text style={styles.deliveryTime}>{item.deliveryEstimate}</Text>
          <Text style={styles.deliveryFee}>{item.deliveryFee}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const ListHeader = () => (
    <>
      {/* Header */}
      <Text style={[styles.modernLogo, { marginTop: 80 }]}>Explore</Text>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={Colors[colorScheme].icon} />
          <TextInput
            style={[styles.searchInput, { color: Colors[colorScheme].text }]}
            placeholder="Search street vendors, groceries..."
            placeholderTextColor={colorScheme === 'dark' ? '#888' : '#999'}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
      </View>
      {/* Quick Actions */}
      <Text style={[styles.selectOneText, { marginTop: 32 }]}>SELECT ONE</Text>
        <View style={styles.quickActionsRow}>
          <TouchableOpacity
            style={[
              styles.quickActionCard, 
              { marginRight: 6 },
              selectedDeliveryType === 'pickup' && styles.quickActionCardSelected
            ]}
            onPress={() => setSelectedDeliveryType(selectedDeliveryType === 'pickup' ? null : 'pickup')}
          >
            <Text style={[
              styles.quickActionTitle,
              selectedDeliveryType === 'pickup' && styles.quickActionTitleSelected
            ]}>PICKUP</Text>
          </TouchableOpacity>
          <View style={styles.orContainer}>
            <Text style={styles.orText}>OR</Text>
          </View>
          <TouchableOpacity
            style={[
              styles.quickActionCard, 
              { marginLeft: 6 },
              selectedDeliveryType === 'delivery' && styles.quickActionCardSelected
            ]}
            onPress={() => setSelectedDeliveryType(selectedDeliveryType === 'delivery' ? null : 'delivery')}
          >
            <Text style={[
              styles.quickActionTitle,
              selectedDeliveryType === 'delivery' && styles.quickActionTitleSelected
            ]}>DELIVERY</Text>
          </TouchableOpacity>
      </View>
      {/* Categories + Sort By (in one section) */}
      <Text style={[styles.selectOneText, { marginTop: 32 }]}>WHICH GROCERIES ARE YOU LOOKING FOR?</Text>
        <View style={{ position: 'relative', width: '100%' }}>
          {/* Left Fade + Arrow */}
          <LinearGradient
            colors={['#fff', 'rgba(255,255,255,0)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 40, zIndex: 2, justifyContent: 'center', alignItems: 'flex-start' }}
            pointerEvents="none"
          />
        <Ionicons name="chevron-back" size={22} color="#000" style={{ position: 'absolute', left: -6, top: '50%', zIndex: 3, transform: [{ translateY: -11 }] }} pointerEvents="none" />
          {/* Categories ScrollView */}
          <ScrollView
            ref={mainScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[styles.categoriesContainer, { paddingLeft: 24, paddingRight: 24 }]}
            style={{ zIndex: 1 }}
          >
            {categories.map((item) => {
              const isSelected = selectedCategories.includes(item.id);
              const handlePress = () => handleCategoryChange(item.id);
              return (
                <CategoryCard key={item.id} item={item} isSelected={isSelected} onPress={handlePress} />
              );
            })}
          </ScrollView>
          {/* Right Fade + Arrow */}
          <LinearGradient
            colors={['rgba(255,255,255,0)', '#fff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 40, zIndex: 2, justifyContent: 'center', alignItems: 'flex-end' }}
            pointerEvents="none"
          />
        <Ionicons name="chevron-forward" size={22} color="#000" style={{ position: 'absolute', right: -6, top: '50%', zIndex: 3, transform: [{ translateY: -11 }] }} pointerEvents="none" />
        </View>
        {/* Sort Options */}
        <View style={styles.sortContainer}>
          <Text style={styles.sortLabel}>Sort by:</Text>
          <View style={styles.sortButtons}>
            {renderSortButton('rating', 'Rating')}
            {renderSortButton('distance', 'Distance')}
            {renderSortButton('delivery', 'Time')}
        </View>
      </View>
    </>
  );

  // Helper: Get all unique product names for category filtering
  const categoryNameMap: { [key: string]: string[] } = {
    'Mangos': ['Mango Pack'],
    'Broccoli': ['Broccoli Head'],
    'Grapes': ['Grape Box'],
    'Onions': ['Onion Bag'],
    'Strawberries': ['Strawberries'],
    'Cucumbers': ['Cucumber Bag'],
    'Tomatoes': ['Tomato Pack'],
    'Avocados': ['Avocado'],
    'Bananas': ['Banana Bunch'],
    'Peppers': ['Pepper'],
    'Pineapples': ['Pineapple'],
    'Carrots': ['Carrot Pack'],
    'Apples': ['Apple Bag'],
    'Spinach': ['Spinach Bag'],
    'Oranges': ['Orange Pack'],
    'Potatoes': ['Potato'],
  };

  // Filtering logic
  let filteredVendors = vendors;

  // Search filter
  if (searchQuery.trim()) {
    const q = searchQuery.trim().toLowerCase();
    filteredVendors = filteredVendors.filter(v =>
      v.name.toLowerCase().includes(q) ||
      v.tagline.toLowerCase().includes(q) ||
      v.products.some(p => p.name.toLowerCase().includes(q))
    );
  }

  // Category filter
  if (selectedCategories.length > 0) {
    filteredVendors = filteredVendors.filter(vendor =>
      vendor.products.some(product =>
        selectedCategories.some(catId => {
          const cat = categories.find(c => c.id === catId);
          if (!cat) return false;
          return categoryNameMap[cat.name]?.some(name => product.name.includes(name));
        })
      )
    );
  }

  // Pickup/Delivery filter
  if (selectedDeliveryType === 'pickup') {
    filteredVendors = filteredVendors.filter(v => v.offersPickup);
  } else if (selectedDeliveryType === 'delivery') {
    filteredVendors = filteredVendors.filter(v => v.offersDelivery);
  }

  // Sort logic
  if (selectedSorts.length > 0) {
    selectedSorts.forEach(sort => {
      if (sort.type === 'rating') {
        filteredVendors = [...filteredVendors].sort((a, b) =>
          sort.direction === 'asc' ? a.rating - b.rating : b.rating - a.rating
        );
      } else if (sort.type === 'distance') {
        filteredVendors = [...filteredVendors].sort((a, b) => {
          const aDist = parseFloat(a.distance);
          const bDist = parseFloat(b.distance);
          return sort.direction === 'asc' ? aDist - bDist : bDist - aDist;
        });
      } else if (sort.type === 'delivery') {
        filteredVendors = [...filteredVendors].sort((a, b) => {
          // Extract min delivery time from string like '12–20 min'
          const aTime = parseInt(a.deliveryEstimate);
          const bTime = parseInt(b.deliveryEstimate);
          return sort.direction === 'asc' ? aTime - bTime : bTime - aTime;
        });
      }
    });
  }

  // Use useMemo to prevent unnecessary re-renders
  const memoizedFilteredVendors = React.useMemo(() => filteredVendors, [filteredVendors]);

  // Restore scroll position after any data change
  React.useEffect(() => {
    if (flatListRef.current && lastExploreScrollPosition > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToOffset({
          offset: lastExploreScrollPosition,
          animated: false
        });
      }, 50);
    }
  }, [memoizedFilteredVendors, selectedCategories, selectedSorts, selectedDeliveryType, searchQuery]);

  // Memoize the ListHeaderComponent to prevent re-renders
  const memoizedListHeader = React.useMemo(() => <ListHeader />, [searchQuery, selectedCategories, selectedSorts, selectedDeliveryType]);

  // Memoize renderItem to prevent re-renders
  const memoizedRenderItem = React.useCallback(renderVendorCard, []);

  // Use a stable data reference that doesn't change when filtering
  const stableVendors = React.useMemo(() => vendors, []);

  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim }}>
      <FlatList
        ref={flatListRef}
        data={stableVendors}
        renderItem={memoizedRenderItem}
        keyExtractor={(item) => item.id}
        horizontal={false}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.featuredVendorsContainer, { backgroundColor: '#fff' }]}
        ListHeaderComponent={memoizedListHeader}
        style={{ backgroundColor: '#fff' }}
        removeClippedSubviews={true}
        maxToRenderPerBatch={10}
        windowSize={10}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
          autoscrollToTopThreshold: 10,
        }}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#fff',
    paddingTop: 80, // Increased from 60 to 80 for more top padding
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
  },
  modernLogo: {
    fontSize: 42,
    fontWeight: '800',
    color: '#000',
    letterSpacing: -1,
    marginTop: 0,
    marginBottom: 11, // 11px space below heading
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 11.9, // Decreased by 0.5px
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginBottom: 0,
    marginTop: 0,
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#000',
  },
  filtersContainer: {
    paddingRight: 20,
  },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: '#000',
  },
  filterChipText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  filterChipTextActive: {
    color: '#fff',
  },
  // Copy styles from home screen
  sortContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 30,
    marginBottom: 40, // Slightly reduced space below sort by section
  },
  sortLabel: {
    fontSize: 16,
    color: '#666',
  },
  sortButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  sortButtonsContainer: {
    flexDirection: 'row',
    gap: 10,
    paddingLeft: 16,
    paddingRight: 20,
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#333',
    minWidth: 64,
    justifyContent: 'center',
  },
  sortButtonActive: {
    backgroundColor: '#000',
    borderColor: 'transparent',
    borderWidth: 2, // Keep border width same as inactive
    minWidth: 64,
    justifyContent: 'center',
  },
  sortButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  sortButtonTextActive: {
    color: '#fff',
  },
  restaurantsList: {
    padding: 20,
  },
  restaurantCard: {
    width: width * 0.9,
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
  closedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#FF3B30',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  closedText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  restaurantInfo: {
    padding: 16,
  },
  restaurantHeader: {
    marginBottom: 12,
  },
  restaurantTitle: {
    flex: 1,
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
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  restaurantFooter: {
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  deliveryInfo: {
    fontSize: 14,
    color: '#666',
  },
  categoryCard: {
    width: 120,
    height: 120,
    borderRadius: 16,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  categoryIcon: {
    fontSize: 40,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  categoryCardPlain: {
    width: 80,
    height: 80,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    backgroundColor: 'transparent',
  },
  categoryIconPlain: {
    fontSize: 24,
    marginBottom: 4,
    color: '#000',
  },
  categoryNamePlain: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    paddingHorizontal: 20,
  },
  categoriesContainer: {
    paddingHorizontal: 20,
    marginTop: 0,
  },
  seeAllText: {
    fontSize: 16,
    color: '#fff',
    fontWeight: '600',
    backgroundColor: '#000',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  selectOneText: {
    fontSize: 12,
    fontWeight: '300',
    color: '#666',
    textAlign: 'center',
    marginTop: 7,
    marginBottom: 30,
    letterSpacing: 1,
    paddingBottom: 2,
  },
  quickActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#000',
  },
  quickActionCardSelected: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  quickActionTitle: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  quickActionTitleSelected: {
    color: '#fff',
  },
  orContainer: {
    paddingHorizontal: 16,
  },
  orText: {
    color: '#666',
    fontWeight: '600',
  },
  restaurantBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: 'rgba(0,0,0,0.8)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  restaurantBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  deliveryTime: {
    fontSize: 14,
    color: '#666',
  },
  deliveryFee: {
    fontSize: 14,
    color: '#666',
  },
  featuredVendorsContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
});
