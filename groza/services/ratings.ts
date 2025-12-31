import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { ProductRating } from '../store/useStore';

// Save product rating to Firestore
export const saveProductRating = async (rating: ProductRating): Promise<void> => {
  try {
    const ratingId = `${rating.productId}_${rating.customerId}`;
    await setDoc(doc(db, 'productRatings', ratingId), {
      ...rating,
      createdAt: rating.createdAt || new Date(),
    });
  } catch (error: any) {
    throw new Error('Failed to save rating: ' + error.message);
  }
};

// Get all ratings for a product
export const getProductRatings = async (productId: string): Promise<ProductRating[]> => {
  try {
    const q = query(collection(db, 'productRatings'), where('productId', '==', productId));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => ({
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate(),
    })) as ProductRating[];
  } catch (error: any) {
    throw new Error('Failed to get ratings: ' + error.message);
  }
};

// Get average rating for a product
export const getAverageProductRating = async (productId: string): Promise<number> => {
  try {
    const ratings = await getProductRatings(productId);
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
    return sum / ratings.length;
  } catch (error: any) {
    throw new Error('Failed to get average rating: ' + error.message);
  }
};

// Get all ratings for products from a vendor (to calculate vendor rating)
export const getVendorProductRatings = async (productIds: string[]): Promise<ProductRating[]> => {
  try {
    // Firestore 'in' query supports up to 10 items, so we need to batch if more
    const allRatings: ProductRating[] = [];
    for (let i = 0; i < productIds.length; i += 10) {
      const batch = productIds.slice(i, i + 10);
      const q = query(collection(db, 'productRatings'), where('productId', 'in', batch));
      const querySnapshot = await getDocs(q);
      const ratings = querySnapshot.docs.map((doc) => ({
        ...doc.data(),
        createdAt: doc.data().createdAt.toDate(),
      })) as ProductRating[];
      allRatings.push(...ratings);
    }
    return allRatings;
  } catch (error: any) {
    throw new Error('Failed to get vendor ratings: ' + error.message);
  }
};

// Calculate vendor rating from all product ratings
export const calculateVendorRating = async (productIds: string[]): Promise<number> => {
  try {
    const ratings = await getVendorProductRatings(productIds);
    if (ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
    return sum / ratings.length;
  } catch (error: any) {
    throw new Error('Failed to calculate vendor rating: ' + error.message);
  }
};




