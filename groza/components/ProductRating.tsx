import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useStore, ProductRating } from '@/store/useStore';
import { saveProductRating } from '@/services/ratings';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from 'react-native';

interface ProductRatingProps {
  productId: string;
  productName: string;
  orderId?: string; // Optional for readonly displays
  onRatingSubmitted?: () => void;
  showLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
  readonly?: boolean;
}

export default function ProductRatingComponent({
  productId,
  productName,
  orderId,
  onRatingSubmitted,
  showLabel = true,
  size = 'medium',
  readonly = false,
}: ProductRatingProps) {
  const { user, productRatings, addProductRating, orders, canRateProduct, hasRatedProduct, getProductRating } = useStore();
  const colorSchemeRaw = useColorScheme();
  const colorScheme = colorSchemeRaw === 'dark' ? 'dark' : 'light';
  
  const existingRating = productRatings.find(
    (r) => r.productId === productId && r.customerId === user?.id
  );
  
  const [selectedRating, setSelectedRating] = useState(existingRating?.rating || 0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const starSize = size === 'small' ? 20 : size === 'large' ? 32 : 24;
  
  const handleStarPress = async (rating: number) => {
    if (readonly || !user) return;
    
    setSelectedRating(rating);
    
    if (!orderId) {
      Alert.alert('Error', 'Order information is required to rate a product.');
      setSelectedRating(0);
      return;
    }
    
    if (!canRateProduct(productId, user.id, orders)) {
      Alert.alert('Cannot Rate', 'You can only rate products after they have been delivered.');
      setSelectedRating(0);
      return;
    }
    
    setIsSubmitting(true);
    try {
      const productRating: ProductRating = {
        productId,
        customerId: user.id,
        rating,
        orderId: orderId!,
        createdAt: new Date(),
      };
      
      // Save to Firestore
      await saveProductRating(productRating);
      
      // Update local store
      addProductRating(productRating);
      
      if (onRatingSubmitted) {
        onRatingSubmitted();
      }
    } catch (error: any) {
      Alert.alert('Error', 'Failed to submit rating. Please try again.');
      console.error('Rating error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // If readonly, show average rating
  if (readonly) {
    const averageRating = getProductRating(productId);
    const fullStars = Math.floor(averageRating);
    const hasHalfStar = averageRating % 1 >= 0.5;
    
    return (
      <View style={styles.container}>
        {showLabel && (
          <Text style={[styles.label, { color: Colors[colorScheme].text }]}>Rating</Text>
        )}
        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Ionicons
              key={star}
              name={star <= fullStars ? 'star' : star === fullStars + 1 && hasHalfStar ? 'star-half' : 'star-outline'}
              size={starSize}
              color="#fbbf24"
              style={styles.star}
            />
          ))}
          {averageRating > 0 && (
            <Text style={[styles.ratingText, { color: Colors[colorScheme].text }]}>
              {averageRating.toFixed(1)}
            </Text>
          )}
        </View>
      </View>
    );
  }
  
  // Interactive rating for users who can rate
  if (!user || !canRateProduct(productId, user.id, orders)) {
    return null; // Don't show rating option if user can't rate
  }
  
  return (
    <View style={styles.container}>
      {showLabel && (
        <Text style={[styles.label, { color: Colors[colorScheme].text }]}>
          Rate {productName}
        </Text>
      )}
      <View style={styles.starsContainer}>
        {[1, 2, 3, 4, 5].map((star) => (
          <TouchableOpacity
            key={star}
            onPress={() => handleStarPress(star)}
            disabled={isSubmitting}
            activeOpacity={0.7}
          >
            <Ionicons
              name={selectedRating >= star ? 'star' : 'star-outline'}
              size={starSize}
              color={selectedRating >= star ? '#fbbf24' : colorScheme === 'dark' ? '#666' : '#ccc'}
              style={styles.star}
            />
          </TouchableOpacity>
        ))}
        {selectedRating > 0 && existingRating && (
          <Text style={[styles.ratedText, { color: Colors[colorScheme].text }]}>Rated</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  star: {
    marginRight: 4,
  },
  ratingText: {
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
  },
  ratedText: {
    marginLeft: 8,
    fontSize: 12,
    fontWeight: '500',
    color: '#22c55e',
  },
});

