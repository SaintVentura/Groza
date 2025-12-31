import { useEffect } from 'react';
import { useStore } from '@/store/useStore';
import { getProductRatings, getVendorProductRatings } from '@/services/ratings';
import { ProductRating } from '@/store/useStore';

// Hook to load all product ratings from Firestore
export const useLoadRatings = (productIds?: string[]) => {
  const { productRatings, addProductRating, user } = useStore();

  useEffect(() => {
    const loadRatings = async () => {
      try {
        if (!productIds || productIds.length === 0) {
          // If no specific product IDs, we can't load all ratings at once
          // In a production app, you might want to load ratings for visible products only
          return;
        }

        // Load ratings for the specified products
        const allRatings: ProductRating[] = [];
        for (const productId of productIds) {
          try {
            const ratings = await getProductRatings(productId);
            allRatings.push(...ratings);
          } catch (error) {
            console.error(`Failed to load ratings for product ${productId}:`, error);
          }
        }

        // Add all ratings to the store (avoid duplicates)
        allRatings.forEach((rating) => {
          const exists = productRatings.some(
            (r) => r.productId === rating.productId && r.customerId === rating.customerId
          );
          if (!exists) {
            addProductRating(rating);
          }
        });
      } catch (error) {
        console.error('Failed to load ratings:', error);
      }
    };

    loadRatings();
  }, [productIds?.join(',')]); // Re-run when productIds change
};

// Hook to load ratings for vendor products
export const useLoadVendorRatings = (vendorProductIds: string[]) => {
  const { addProductRating, productRatings } = useStore();

  useEffect(() => {
    const loadVendorRatings = async () => {
      try {
        if (!vendorProductIds || vendorProductIds.length === 0) return;

        const ratings = await getVendorProductRatings(vendorProductIds);

        // Add all ratings to the store (avoid duplicates)
        ratings.forEach((rating) => {
          const exists = productRatings.some(
            (r) => r.productId === rating.productId && r.customerId === rating.customerId
          );
          if (!exists) {
            addProductRating(rating);
          }
        });
      } catch (error) {
        console.error('Failed to load vendor ratings:', error);
      }
    };

    loadVendorRatings();
  }, [vendorProductIds.join(',')]);
};




