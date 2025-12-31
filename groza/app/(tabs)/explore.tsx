import React, { useState, useRef, useCallback, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Image,
  FlatList,
  StyleSheet,
  Dimensions,
  Animated,
  Modal,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useColorScheme } from 'react-native';
import { vendors } from '@/constants/Vendors';
import { useFocusEffect } from '@react-navigation/native';
import { useStore } from '@/store/useStore';
import { LinearGradient } from 'expo-linear-gradient';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Audio } from 'expo-audio';

const { width } = Dimensions.get('window');
const COLUMN_COUNT = 2;
const ITEM_MARGIN = 4;
const ITEM_WIDTH = (width - (ITEM_MARGIN * (COLUMN_COUNT + 1))) / COLUMN_COUNT;

// Video URLs mapped to product categories - using free stock videos from Pexels
const VIDEO_MAPPING: Record<string, string[]> = {
  'Fruits': [
    'https://videos.pexels.com/video-files/3045163/3045163-uhd_2560_1440_25fps.mp4', // Fresh fruits
    'https://videos.pexels.com/video-files/1409899/1409899-uhd_2560_1440_25fps.mp4', // Fruits in basket
    'https://videos.pexels.com/video-files/3298680/3298680-uhd_2560_1440_30fps.mp4', // Colorful fruits
    'https://videos.pexels.com/video-files/3044083/3044083-uhd_2560_1440_25fps.mp4', // Fresh berries
  ],
  'Vegetables': [
    'https://videos.pexels.com/video-files/3045165/3045165-uhd_2560_1440_25fps.mp4', // Fresh vegetables
    'https://videos.pexels.com/video-files/3045164/3045164-uhd_2560_1440_25fps.mp4', // Leafy greens
    'https://videos.pexels.com/video-files/3045254/3045254-uhd_2560_1440_25fps.mp4', // Colorful vegetables
    'https://videos.pexels.com/video-files/2491284/2491284-uhd_2560_1440_25fps.mp4', // Fresh produce
  ],
  'Combos': [
    'https://videos.pexels.com/video-files/2491284/2491284-uhd_2560_1440_25fps.mp4', // Mixed produce
    'https://videos.pexels.com/video-files/3045254/3045254-uhd_2560_1440_25fps.mp4', // Assorted fruits and vegetables
    'https://videos.pexels.com/video-files/3298680/3298680-uhd_2560_1440_30fps.mp4', // Fresh market produce
    'https://videos.pexels.com/video-files/1409899/1409899-uhd_2560_1440_25fps.mp4', // Variety pack
  ],
};

// Helper function to get a video URL based on product categories
const getVideoForCategories = (categories: ('Fruits' | 'Vegetables' | 'Combos')[]): string | undefined => {
  // Prefer videos for primary category, fallback to combos
  if (categories.includes('Fruits')) {
    const videos = VIDEO_MAPPING['Fruits'];
    return videos[Math.floor(Math.random() * videos.length)];
  }
  if (categories.includes('Vegetables')) {
    const videos = VIDEO_MAPPING['Vegetables'];
    return videos[Math.floor(Math.random() * videos.length)];
  }
  if (categories.includes('Combos')) {
    const videos = VIDEO_MAPPING['Combos'];
    return videos[Math.floor(Math.random() * videos.length)];
  }
  return undefined;
};

// Generate posts from vendors (each vendor can have multiple posts)
interface ExplorePost {
  id: string;
  vendorId: string;
  vendorName: string;
  image: string;
  video?: string; // For future video support
  productNames: string[]; // Product names in the post
  categories: ('Fruits' | 'Vegetables' | 'Combos')[];
  deliveryType: 'pickup' | 'delivery' | 'both';
  tags: string[]; // Searchable tags
}

// Generate posts from vendors
const generatePosts = (): ExplorePost[] => {
  const posts: ExplorePost[] = [];
  vendors.forEach((vendor) => {
    // Create multiple posts per vendor (2-4 posts)
    const postCount = Math.floor(Math.random() * 3) + 2;
    for (let i = 0; i < postCount; i++) {
      const randomProducts = vendor.products
        .sort(() => 0.5 - Math.random())
        .slice(0, Math.floor(Math.random() * 3) + 1);
      
      const categories = [...new Set(randomProducts.map(p => p.category))] as ('Fruits' | 'Vegetables' | 'Combos')[];
      // Only assign videos to ~40% of posts to improve performance
      const videoUrl = Math.random() < 0.4 ? getVideoForCategories(categories) : undefined;
      
      posts.push({
        id: `${vendor.id}-post-${i}`,
        vendorId: vendor.id,
        vendorName: vendor.name,
        image: randomProducts[0]?.image || vendor.image,
        video: videoUrl, // Assign video based on product categories (only 40% of posts)
        productNames: randomProducts.map(p => p.name),
        categories: categories,
        deliveryType: vendor.offersPickup && vendor.offersDelivery ? 'both' : vendor.offersPickup ? 'pickup' : 'delivery',
        tags: [
          ...randomProducts.map(p => p.name.toLowerCase()),
          ...randomProducts.map(p => p.category.toLowerCase()),
          vendor.name.toLowerCase(),
          vendor.tagline.toLowerCase(),
        ],
      });
    }
  });
  return posts;
};

export default function ExploreScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeliveryType, setSelectedDeliveryType] = useState<'pickup' | 'delivery' | null>(null);
  const [selectedGroceryTypes, setSelectedGroceryTypes] = useState<Array<'fruits' | 'vegetables'>>([]);
  const [selectedSorts, setSelectedSorts] = useState<Array<{type: string, direction: 'asc' | 'desc'}>>([]);
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [allPosts] = useState<ExplorePost[]>(generatePosts());
  const colorSchemeRaw = useColorScheme();
  const colorScheme = colorSchemeRaw === 'dark' ? 'dark' : 'light';
  const { user, addresses, isAuthenticated } = useStore();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(100)).current;
  const dropdownAnim = useRef(new Animated.Value(0)).current;
  const isFirstLoad = useRef(true);
  const scrollViewRef = useRef<ScrollView>(null);

  // Videos are already muted so they won't interrupt background music

  useFocusEffect(
    React.useCallback(() => {
      slideAnim.setValue(100);
      fadeAnim.setValue(0);
      if (isFirstLoad.current) {
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
        ]).start(() => {
          isFirstLoad.current = false;
        });
      } else {
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

      return () => {
        slideAnim.setValue(100);
        fadeAnim.setValue(0);
      };
    }, [slideAnim, fadeAnim])
  );

  // Animate dropdown
  useEffect(() => {
    Animated.timing(dropdownAnim, {
      toValue: showFilterDropdown ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [showFilterDropdown]);

  // Filter and sort posts
  const filteredPosts = useMemo(() => {
    let filtered = [...allPosts];

    // Search filter - search in tags, product names, vendor names
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(post =>
        post.tags.some(tag => tag.includes(query)) ||
        post.productNames.some(name => name.toLowerCase().includes(query)) ||
        post.vendorName.toLowerCase().includes(query)
      );
    }

    // Delivery type filter
    if (selectedDeliveryType) {
      filtered = filtered.filter(post =>
        post.deliveryType === selectedDeliveryType || post.deliveryType === 'both'
      );
    }

    // Grocery type filter
    if (selectedGroceryTypes.length > 0) {
      filtered = filtered.filter(post => {
        const postCategories = post.categories.map(c => c.toLowerCase());
        if (selectedGroceryTypes.length === 1) {
          return postCategories.includes(selectedGroceryTypes[0]);
      } else {
          return selectedGroceryTypes.every(type => postCategories.includes(type));
        }
      });
    }

    // Sort - apply multiple sorts in sequence
    // Filter out time and distance sorts if not authenticated
    const activeSorts = isAuthenticated 
      ? selectedSorts 
      : selectedSorts.filter(s => s.type !== 'time' && s.type !== 'distance');
    
    if (activeSorts.length > 0) {
      filtered = [...filtered].sort((a, b) => {
        const vendorA = vendors.find(v => v.id === a.vendorId);
        const vendorB = vendors.find(v => v.id === b.vendorId);
        if (!vendorA || !vendorB) return 0;

        for (const sort of activeSorts) {
          let comparison = 0;

          if (sort.type === 'rating') {
            comparison = sort.direction === 'asc'
              ? vendorA.rating - vendorB.rating
              : vendorB.rating - vendorA.rating;
          } else if (sort.type === 'distance') {
            const distA = parseFloat(vendorA.distance.replace(' km', ''));
            const distB = parseFloat(vendorB.distance.replace(' km', ''));
            comparison = sort.direction === 'asc' ? distA - distB : distB - distA;
          } else if (sort.type === 'time') {
            const timeA = parseInt(vendorA.deliveryEstimate.split('–')[0]);
            const timeB = parseInt(vendorB.deliveryEstimate.split('–')[0]);
            comparison = sort.direction === 'asc' ? timeA - timeB : timeB - timeA;
          }

          // If this sort criteria shows a difference, return it
          // Otherwise continue to next sort criteria
          if (comparison !== 0) {
            return comparison;
          }
        }
        return 0; // All sort criteria are equal
      });
    }

    return filtered;
  }, [allPosts, searchQuery, selectedDeliveryType, selectedGroceryTypes, selectedSorts]);

  // Organize posts into columns for masonry layout
  const columns = useMemo(() => {
    const cols: ExplorePost[][] = Array(COLUMN_COUNT).fill(null).map(() => []);
    filteredPosts.forEach((post, index) => {
      cols[index % COLUMN_COUNT].push(post);
    });
    return cols;
  }, [filteredPosts]);

  const handleSortToggle = (type: string) => {
    setSelectedSorts((prev) => {
      const existingIndex = prev.findIndex(sort => sort.type === type);
      
      if (existingIndex >= 0) {
        // For rating, distance, and time, just toggle off (on/off behavior)
        return prev.filter((_, idx) => idx !== existingIndex);
      } else {
        // Add new sort with default direction
        // Rating: desc (best to worst), Distance and Time: asc (shortest to most)
        const direction = type === 'distance' || type === 'time' ? 'asc' : 'desc';
        return [...prev, { type, direction }];
      }
    });
  };

  const PostItem = React.memo(({ post, vendor, height, shouldHighlight, firstProduct }: {
    post: ExplorePost;
    vendor: any;
    height: number;
    shouldHighlight: boolean;
    firstProduct: any;
  }) => {
    const [isVideoLoading, setIsVideoLoading] = useState(true);
    
    // Always create player (hooks must be called unconditionally)
    // Initialize with video URL directly for faster loading
    const player = useVideoPlayer(post.video || '', (player) => {
      if (post.video) {
        player.loop = true;
        player.muted = true;
      }
    });
    
    // Play video when ready and track loading state
    useEffect(() => {
      if (!post.video) {
        setIsVideoLoading(false);
        return;
      }
      
      // Listen for status changes to detect when video is ready
      const unsubscribe = player.addListener('statusChange', (status) => {
        if (status.status === 'readyToPlay') {
          setIsVideoLoading(false);
          player.play();
        }
      });
      
      // Try to play immediately
      player.play();
      
      return () => {
        unsubscribe.remove();
        // Safely pause player - may already be destroyed
        try {
          player.pause();
        } catch (error) {
          // Player already destroyed or invalid, ignore
        }
      };
    }, [post.video, player]);
    
    return (
      <TouchableOpacity
        style={[styles.postContainer, { width: ITEM_WIDTH, marginBottom: ITEM_MARGIN }]}
        onPress={() => {
          // Only navigate with productId if post has exactly one product
          if (shouldHighlight && firstProduct) {
            router.push(`/restaurant/${post.vendorId}?from=explore&productId=${firstProduct.id}`);
          } else {
            router.push(`/restaurant/${post.vendorId}?from=explore`);
          }
        }}
        activeOpacity={0.85}
      >
          {post.video ? (
            <View style={[styles.postImage, { height }]}>
              <VideoView
                player={player}
                style={StyleSheet.absoluteFill}
                contentFit="cover"
                nativeControls={false}
                allowsPictureInPicture={false}
              />
              {isVideoLoading && (
                <View style={styles.videoLoadingOverlay}>
                  <ActivityIndicator size="large" color="#fff" />
                </View>
              )}
            </View>
          ) : (
            <Image
              source={{ uri: post.image }}
              style={[styles.postImage, { height }]}
              resizeMode="cover"
            />
          )}
        {vendor && (
          <View style={styles.ratingBadge}>
            <Ionicons name="star" size={12} color="#FFD700" />
            <Text style={styles.ratingText}>{vendor.rating}</Text>
          </View>
        )}
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.8)']}
          style={styles.postOverlay}
        >
          <View style={styles.postInfo}>
            <Text style={styles.vendorName} numberOfLines={1}>{post.vendorName}</Text>
            {post.productNames.length > 0 && (
              <Text style={styles.productNames} numberOfLines={2}>
                {post.productNames.slice(0, 2).join(', ')}
                {post.productNames.length > 2 && '...'}
              </Text>
            )}
          </View>
        </LinearGradient>
      </TouchableOpacity>
    );
  });

  const renderPost = (post: ExplorePost, index: number) => {
    const vendor = vendors.find(v => v.id === post.vendorId);
    const height = 200 + (Math.random() * 100); // Varying heights for masonry effect
    
    // Only highlight if post has exactly one product
    const shouldHighlight = post.productNames.length === 1;
    const firstProduct = shouldHighlight ? vendor?.products.find(p => 
      post.productNames.some(name => p.name.toLowerCase() === name.toLowerCase())
    ) : null;
    
    return (
      <PostItem 
        key={post.id}
        post={post}
        vendor={vendor}
        height={height}
        shouldHighlight={shouldHighlight}
        firstProduct={firstProduct}
      />
    );
  };

  const renderColumn = (columnPosts: ExplorePost[], columnIndex: number) => {
    return (
      <View key={columnIndex} style={styles.column}>
        {columnPosts.map((post, index) => renderPost(post, index))}
      </View>
    );
  };

  const dropdownHeight = dropdownAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 400],
  });


  return (
    <Animated.View style={{ flex: 1, opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}>
      <View style={styles.container}>
        {/* Header with Search and Filter */}
        <View style={styles.header}>
          <Text style={styles.title}>Explore</Text>
          <View style={styles.searchRow}>
        <View style={styles.searchContainer}>
              <Ionicons name="search" size={20} color="#666" />
          <TextInput
                style={styles.searchInput}
                placeholder="Search fruits, vegetables..."
                placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
      </View>
            <TouchableOpacity
              style={[
                styles.filterButton,
                showFilterDropdown && styles.filterButtonActive,
              ]}
              onPress={() => setShowFilterDropdown(!showFilterDropdown)}
            >
              <Ionicons 
                name={showFilterDropdown ? "close" : "options"} 
                size={24} 
                color={showFilterDropdown ? "#fff" : "#000"} 
              />
              {(selectedDeliveryType || selectedGroceryTypes.length > 0 || selectedSorts.length > 0) && (
                <View style={styles.filterBadge} />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Filter Dropdown */}
        <Animated.View
          style={[
            styles.filterDropdown,
            {
              maxHeight: dropdownHeight,
              opacity: dropdownAnim,
            },
          ]}
        >
          <ScrollView style={styles.filterContent} showsVerticalScrollIndicator={false}>
            {/* Delivery Type */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Delivery Type</Text>
              <View style={styles.filterOptions}>
            <TouchableOpacity
              style={[
                    styles.filterOption,
                    selectedDeliveryType === 'pickup' && styles.filterOptionActive,
                  ]}
                  onPress={() => setSelectedDeliveryType(selectedDeliveryType === 'pickup' ? null : 'pickup')}
                >
                  <Ionicons
                    name="bag-outline"
                    size={18}
                    color={selectedDeliveryType === 'pickup' ? '#fff' : '#000'}
                  />
                  <Text
                    style={[
                      styles.filterOptionText,
                      selectedDeliveryType === 'pickup' && styles.filterOptionTextActive,
                    ]}
                  >
                    Pickup
                  </Text>
            </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.filterOption,
                    selectedDeliveryType === 'delivery' && styles.filterOptionActive,
                  ]}
                  onPress={() => setSelectedDeliveryType(selectedDeliveryType === 'delivery' ? null : 'delivery')}
                >
                  <Ionicons
                    name="bicycle-outline"
                    size={18}
                    color={selectedDeliveryType === 'delivery' ? '#fff' : '#000'}
                  />
                  <Text
                    style={[
                      styles.filterOptionText,
                      selectedDeliveryType === 'delivery' && styles.filterOptionTextActive,
                    ]}
                  >
                    Delivery
                  </Text>
                </TouchableOpacity>
      </View>
            </View>

            {/* Grocery Types */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Grocery Type</Text>
              <View style={styles.filterOptions}>
            <TouchableOpacity
              style={[
                    styles.filterOption,
                    selectedGroceryTypes.includes('fruits') && styles.filterOptionActive,
              ]}
              onPress={() => {
                    setSelectedGroceryTypes(prev =>
                      prev.includes('fruits')
                        ? prev.filter(t => t !== 'fruits')
                        : [...prev, 'fruits']
                    );
                  }}
                >
                  <Ionicons
                    name="nutrition-outline"
                    size={18}
                    color={selectedGroceryTypes.includes('fruits') ? '#fff' : '#000'}
                  />
                  <Text
                    style={[
                      styles.filterOptionText,
                      selectedGroceryTypes.includes('fruits') && styles.filterOptionTextActive,
                    ]}
                  >
                    Fruits
                  </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                    styles.filterOption,
                    selectedGroceryTypes.includes('vegetables') && styles.filterOptionActive,
              ]}
              onPress={() => {
                    setSelectedGroceryTypes(prev =>
                      prev.includes('vegetables')
                        ? prev.filter(t => t !== 'vegetables')
                        : [...prev, 'vegetables']
                    );
                  }}
                >
                  <Ionicons
                    name="leaf-outline"
                    size={18}
                    color={selectedGroceryTypes.includes('vegetables') ? '#fff' : '#000'}
                  />
                  <Text
                    style={[
                      styles.filterOptionText,
                      selectedGroceryTypes.includes('vegetables') && styles.filterOptionTextActive,
                    ]}
                  >
                    Vegetables
                  </Text>
            </TouchableOpacity>
        </View>
        </View>

            {/* Sort By */}
            <View style={styles.filterSection}>
              <Text style={styles.filterSectionTitle}>Sort By</Text>
              <View style={styles.sortOptions}>
                <TouchableOpacity
                  style={[
                    styles.sortOption,
                    selectedSorts.some(s => s.type === 'rating') && styles.filterOptionActive,
                  ]}
                  onPress={() => handleSortToggle('rating')}
                >
                  <Ionicons
                    name="star-outline"
                    size={16}
                    color={selectedSorts.some(s => s.type === 'rating') ? '#fff' : '#000'}
                  />
                  <Text
                    style={[
                      styles.filterOptionText,
                      selectedSorts.some(s => s.type === 'rating') && styles.filterOptionTextActive,
                    ]}
                    numberOfLines={1}
                  >
                    Rating
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.sortOption,
                    selectedSorts.some(s => s.type === 'distance') && styles.filterOptionActive,
                    !isAuthenticated && styles.sortOptionDisabled,
                  ]}
                  onPress={() => {
                    if (isAuthenticated) {
                      handleSortToggle('distance');
                    }
                  }}
                  disabled={!isAuthenticated}
                >
                  <Ionicons
                    name="location-outline"
                    size={16}
                    color={
                      !isAuthenticated 
                        ? '#ccc' 
                        : selectedSorts.some(s => s.type === 'distance') ? '#fff' : '#000'
                    }
                  />
                  <Text
                    style={[
                      styles.filterOptionText,
                      selectedSorts.some(s => s.type === 'distance') && styles.filterOptionTextActive,
                      !isAuthenticated && styles.filterOptionTextDisabled,
                    ]}
                    numberOfLines={1}
                  >
                    Distance
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.sortOption,
                    selectedSorts.some(s => s.type === 'time') && styles.filterOptionActive,
                    !isAuthenticated && styles.sortOptionDisabled,
                  ]}
                  onPress={() => {
                    if (isAuthenticated) {
                      handleSortToggle('time');
                    }
                  }}
                  disabled={!isAuthenticated}
                >
                  <Ionicons
                    name="time-outline"
                    size={16}
                    color={
                      !isAuthenticated 
                        ? '#ccc' 
                        : selectedSorts.some(s => s.type === 'time') ? '#fff' : '#000'
                    }
                  />
                  <Text
                    style={[
                      styles.filterOptionText,
                      selectedSorts.some(s => s.type === 'time') && styles.filterOptionTextActive,
                      !isAuthenticated && styles.filterOptionTextDisabled,
                    ]}
                    numberOfLines={1}
                  >
                    Time
                  </Text>
                </TouchableOpacity>
      </View>
            </View>

            {/* Clear Filters */}
            {(selectedDeliveryType || selectedGroceryTypes.length > 0 || selectedSorts.length > 0) && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => {
                  setSelectedDeliveryType(null);
                  setSelectedGroceryTypes([]);
                  setSelectedSorts([]);
                }}
              >
                <Text style={styles.clearButtonText}>Clear All Filters</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </Animated.View>

        {/* Masonry Grid */}
        {filteredPosts.length > 0 ? (
          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={styles.gridContainer}
            showsVerticalScrollIndicator={false}
            scrollEventThrottle={16}
          >
            <View style={styles.columnsContainer}>
              {columns.map((columnPosts, index) => renderColumn(columnPosts, index))}
            </View>
          </ScrollView>
        ) : (
    <View style={styles.emptyContainer}>
      <Ionicons name="search-outline" size={64} color="#ccc" />
            <Text style={styles.emptyText}>No posts match your filters</Text>
            <Text style={styles.emptySubtext}>Try adjusting your search or filters</Text>
    </View>
        )}
      </View>
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
    paddingTop: Platform.OS === 'ios' ? 50 : 20,
    paddingBottom: 20,
    paddingHorizontal: 20,
    marginBottom: 20, // Space under header
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  title: {
    fontSize: 42,
    fontWeight: '800',
    color: '#000',
    letterSpacing: -1,
    marginTop: 20,
    marginBottom: 11,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#000',
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#f8f9fa',
    borderWidth: 1,
    borderColor: '#e9ecef',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  filterButtonActive: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  filterBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF3B30',
  },
  filterDropdown: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    overflow: 'hidden',
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  sortOptions: {
    flexDirection: 'row',
    flexWrap: 'nowrap',
    gap: 8,
  },
  filterOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#000',
    backgroundColor: '#fff',
    gap: 8,
  },
  sortOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#000',
    backgroundColor: '#fff',
    gap: 8,
  },
  filterOptionActive: {
    backgroundColor: '#000',
    borderColor: '#000',
  },
  filterOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  filterOptionTextActive: {
    color: '#fff',
  },
  sortOptionDisabled: {
    opacity: 0.5,
    borderColor: '#ccc',
    backgroundColor: '#f5f5f5',
  },
  filterOptionTextDisabled: {
    color: '#ccc',
  },
  clearButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    marginTop: 8,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  scrollView: {
    flex: 1,
  },
  gridContainer: {
    padding: ITEM_MARGIN,
    paddingTop: 0, // No extra padding, header is part of page flow
  },
  columnsContainer: {
    flexDirection: 'row',
    gap: ITEM_MARGIN,
  },
  column: {
    flex: 1,
  },
  postContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
  },
  postImage: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
  },
  videoLoadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  postOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 12,
  },
  postInfo: {
    marginBottom: 8,
  },
  vendorName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  productNames: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.9,
  },
  ratingBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  ratingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#fff',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#666',
    marginTop: 16,
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: 16,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
  },
});
