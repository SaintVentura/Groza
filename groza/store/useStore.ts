import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'driver' | 'restaurant' | 'admin';
  phone: string;
  avatar?: string;
  username?: string;
  newsletterSubscription?: boolean;
  rating?: number;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  restaurantId: string;
  restaurantName: string;
  image?: string;
  customizations?: string[];
}

export interface Order {
  id: string;
  customerId: string;
  restaurantId: string;
  driverId?: string;
  items: CartItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'picked' | 'delivering' | 'delivered' | 'cancelled';
  createdAt: Date;
  estimatedDelivery?: Date;
  deliveryAddress: string;
  paymentStatus: 'pending' | 'paid' | 'failed';
  deliveryFee: number;
  deliveryType: 'pickup' | 'delivery';
}

export interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  postalCode: string;
  isDefault: boolean;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'cash';
  label: string;
  last4?: string;
  expiry?: string;
  isDefault: boolean;
}

export interface ProductRating {
  productId: string;
  customerId: string;
  rating: number; // 1-5
  orderId: string; // The order that contained this product
  createdAt: Date;
}

interface AppState {
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  
  // Cart
  cart: CartItem[];
  cartTotal: number;
  
  // Orders
  orders: Order[];
  currentOrder: Order | null;
  
  // UI State
  isLoading: boolean;
  error: string | null;
  darkModeEnabled: boolean;
  
  // Add favourites state
  favourites: any[]; // Assuming 'any' for now, as the type is not defined in the original file
  
  // Addresses
  addresses: Address[];
  
  // Payment Methods
  paymentMethods: PaymentMethod[];
  
  // Product Ratings
  productRatings: ProductRating[];
  
  // Actions
  setUser: (user: User | null) => void;
  setAuthenticated: (isAuthenticated: boolean) => void;
  addToCart: (item: CartItem) => void;
  removeFromCart: (itemId: string) => void;
  updateCartItemQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  addOrder: (order: Order) => void;
  updateOrder: (orderId: string, updates: Partial<Order>) => void;
  setCurrentOrder: (order: Order | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setDarkModeEnabled: (enabled: boolean) => void;
  // Add favourite actions
  addFavourite: (vendor: any) => void; // Assuming 'any' for now
  removeFavourite: (vendorId: string) => void;
  // Address actions
  addAddress: (address: Address) => Promise<void>;
  updateAddress: (addressId: string, updates: Partial<Address>) => Promise<void>;
  removeAddress: (addressId: string) => Promise<void>;
  setDefaultAddress: (addressId: string) => Promise<void>;
  // Payment method actions
  addPaymentMethod: (method: PaymentMethod) => Promise<void>;
  updatePaymentMethod: (methodId: string, updates: Partial<PaymentMethod>) => Promise<void>;
  removePaymentMethod: (methodId: string) => Promise<void>;
  setDefaultPaymentMethod: (methodId: string) => Promise<void>;
  // Initialization
  loadPersistedData: () => Promise<void>;
  // Rating actions
  addProductRating: (rating: ProductRating) => void;
  updateProductRating: (productId: string, customerId: string, newRating: number) => void;
  getProductRating: (productId: string) => number; // Returns average rating
  hasRatedProduct: (productId: string, customerId: string) => boolean;
  canRateProduct: (productId: string, customerId: string, orders: Order[]) => boolean;
  getVendorRating: (vendorId: string, productIds: string[]) => number; // Calculate vendor rating from products
  showMultiVendorPopup: () => void;
  dismissMultiVendorPopup: () => void;
  getVendorCarts: () => Array<{ restaurantId: string; restaurantName: string; items: CartItem[] }>;
  selectVendorForCheckout: (restaurantId: string) => void;
}

export const useStore = create<AppState>((set, get) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  cart: [],
  cartTotal: 0,
  orders: [],
  currentOrder: null,
  isLoading: false,
  error: null,
  darkModeEnabled: false,
  // Add favourites state
  favourites: [],
  // Addresses - start with empty array for new users
  addresses: [],
  // Payment Methods - start with cash on delivery as default
  paymentMethods: [
    {
      id: 'cash-1',
      type: 'cash',
      label: 'Cash on Delivery',
      isDefault: true,
    },
  ],
  // Product Ratings
  productRatings: [],
  
  // Multi-vendor cart state
  showMultiVendorModal: false,
  selectedVendorId: null,

  // Actions
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  
  addToCart: (item) => {
    const { cart } = get();
    
    // Check if adding from a different vendor
    const existingVendors = [...new Set(cart.map(cartItem => cartItem.restaurantId))];
    const isNewVendor = !existingVendors.includes(item.restaurantId) && cart.length > 0;
    
    // Find existing item in cart
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    
    let updatedCart: CartItem[];
    if (existingItem) {
      // Update quantity of existing item
      updatedCart = cart.map(cartItem =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
          : cartItem
      );
    } else {
      // Add new item
      updatedCart = [...cart, item];
    }
    
    const cartTotal = updatedCart.reduce((total, item) => total + (item.price * item.quantity), 0);
    set({ cart: updatedCart, cartTotal });
    
    // Show popup if adding from a different vendor
    if (isNewVendor) {
      setTimeout(() => {
        get().showMultiVendorPopup();
      }, 100);
    }
  },
  
  showMultiVendorPopup: () => {
    // This will be handled by a callback or global state
    // For now, we'll set a flag that components can listen to
    set({ showMultiVendorModal: true });
  },
  
  dismissMultiVendorPopup: () => {
    set({ showMultiVendorModal: false });
  },
  
  getVendorCarts: () => {
    const { cart } = get();
    const vendorGroups = cart.reduce((acc, item) => {
      if (!acc[item.restaurantId]) {
        acc[item.restaurantId] = {
          restaurantId: item.restaurantId,
          restaurantName: item.restaurantName,
          items: [],
        };
      }
      acc[item.restaurantId].items.push(item);
      return acc;
    }, {} as Record<string, { restaurantId: string; restaurantName: string; items: CartItem[] }>);
    return Object.values(vendorGroups);
  },
  
  selectVendorForCheckout: (restaurantId: string | null) => {
    // Just set the selected vendor ID, don't filter cart
    // The cart screen will filter the display
    set({ selectedVendorId: restaurantId });
  },
  
  removeFromCart: (itemId) => {
    const { cart } = get();
    const updatedCart = cart.filter(item => item.id !== itemId);
    const cartTotal = updatedCart.reduce((total, item) => total + (item.price * item.quantity), 0);
    set({ cart: updatedCart, cartTotal });
  },
  
  updateCartItemQuantity: (itemId, quantity) => {
    const { cart } = get();
    if (quantity <= 0) {
      get().removeFromCart(itemId);
      return;
    }
    
    const updatedCart = cart.map(item =>
      item.id === itemId ? { ...item, quantity } : item
    );
    const cartTotal = updatedCart.reduce((total, item) => total + (item.price * item.quantity), 0);
    set({ cart: updatedCart, cartTotal });
  },
  
  clearCart: () => set({ cart: [], cartTotal: 0 }),
  
  addOrder: (order) => {
    const { orders } = get();
    set({ orders: [order, ...orders] });
  },
  
  updateOrder: (orderId, updates) => {
    const { orders } = get();
    const updatedOrders = orders.map(order =>
      order.id === orderId ? { ...order, ...updates } : order
    );
    set({ orders: updatedOrders });
  },
  
  setCurrentOrder: (order) => set({ currentOrder: order }),
  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error }),
  setDarkModeEnabled: (enabled) => set({ darkModeEnabled: enabled }),
  // Add favourite actions
  addFavourite: (vendor) => {
    const { favourites } = get();
    if (!favourites.find((v) => v.id === vendor.id)) {
      set({ favourites: [...favourites, vendor] });
    }
  },
  removeFavourite: (vendorId) => {
    const { favourites } = get();
    set({ favourites: favourites.filter((v) => v.id !== vendorId) });
  },
  // Address actions
  addAddress: async (address) => {
    const { addresses } = get();
    const newAddress = {
      ...address,
      isDefault: addresses.length === 0, // First address is default
    };
    const updatedAddresses = [...addresses, newAddress];
    set({ addresses: updatedAddresses });
    try {
      await AsyncStorage.setItem('groza_addresses', JSON.stringify(updatedAddresses));
    } catch (error) {
      console.error('Error saving addresses:', error);
    }
  },
  updateAddress: async (addressId, updates) => {
    const { addresses } = get();
    const updatedAddresses = addresses.map((addr) =>
      addr.id === addressId ? { ...addr, ...updates } : addr
    );
    set({ addresses: updatedAddresses });
    try {
      await AsyncStorage.setItem('groza_addresses', JSON.stringify(updatedAddresses));
    } catch (error) {
      console.error('Error saving addresses:', error);
    }
  },
  removeAddress: async (addressId) => {
    const { addresses } = get();
    const updatedAddresses = addresses.filter((addr) => addr.id !== addressId);
    // If we removed the default address, make the first one default
    if (updatedAddresses.length > 0 && addresses.find((a) => a.id === addressId)?.isDefault) {
      updatedAddresses[0].isDefault = true;
    }
    set({ addresses: updatedAddresses });
    try {
      await AsyncStorage.setItem('groza_addresses', JSON.stringify(updatedAddresses));
    } catch (error) {
      console.error('Error saving addresses:', error);
    }
  },
  setDefaultAddress: async (addressId) => {
    const { addresses } = get();
    const updatedAddresses = addresses.map((addr) => ({
      ...addr,
      isDefault: addr.id === addressId,
    }));
    set({ addresses: updatedAddresses });
    try {
      await AsyncStorage.setItem('groza_addresses', JSON.stringify(updatedAddresses));
    } catch (error) {
      console.error('Error saving addresses:', error);
    }
  },
  // Payment method actions
  addPaymentMethod: async (method) => {
    const { paymentMethods } = get();
    const newMethod = {
      ...method,
      isDefault: paymentMethods.length === 0,
    };
    const updatedMethods = [...paymentMethods, newMethod];
    set({ paymentMethods: updatedMethods });
    try {
      await AsyncStorage.setItem('groza_paymentMethods', JSON.stringify(updatedMethods));
    } catch (error) {
      console.error('Error saving payment methods:', error);
    }
  },
  updatePaymentMethod: async (methodId, updates) => {
    const { paymentMethods } = get();
    const updatedMethods = paymentMethods.map((method) =>
      method.id === methodId ? { ...method, ...updates } : method
    );
    set({ paymentMethods: updatedMethods });
    try {
      await AsyncStorage.setItem('groza_paymentMethods', JSON.stringify(updatedMethods));
    } catch (error) {
      console.error('Error saving payment methods:', error);
    }
  },
  removePaymentMethod: async (methodId) => {
    const { paymentMethods } = get();
    // Prevent deletion of cash on delivery payment methods
    const methodToRemove = paymentMethods.find((m) => m.id === methodId);
    if (methodToRemove?.type === 'cash') {
      console.warn('Cannot delete cash on delivery payment method');
      return;
    }
    const updatedMethods = paymentMethods.filter((method) => method.id !== methodId);
    // If we removed the default method, make the first one default
    if (updatedMethods.length > 0 && paymentMethods.find((m) => m.id === methodId)?.isDefault) {
      updatedMethods[0].isDefault = true;
    }
    set({ paymentMethods: updatedMethods });
    try {
      await AsyncStorage.setItem('groza_paymentMethods', JSON.stringify(updatedMethods));
    } catch (error) {
      console.error('Error saving payment methods:', error);
    }
  },
  setDefaultPaymentMethod: async (methodId) => {
    const { paymentMethods } = get();
    const updatedMethods = paymentMethods.map((method) => ({
      ...method,
      isDefault: method.id === methodId,
    }));
    set({ paymentMethods: updatedMethods });
    try {
      await AsyncStorage.setItem('groza_paymentMethods', JSON.stringify(updatedMethods));
    } catch (error) {
      console.error('Error saving payment methods:', error);
    }
  },
  // Rating actions
  addProductRating: (rating) => {
    const { productRatings } = get();
    // Check if customer already rated this product, if so update it
    const existingIndex = productRatings.findIndex(
      (r) => r.productId === rating.productId && r.customerId === rating.customerId
    );
    if (existingIndex >= 0) {
      const updatedRatings = [...productRatings];
      updatedRatings[existingIndex] = rating;
      set({ productRatings: updatedRatings });
    } else {
      set({ productRatings: [...productRatings, rating] });
    }
  },
  updateProductRating: (productId, customerId, newRating) => {
    const { productRatings } = get();
    const updatedRatings = productRatings.map((r) =>
      r.productId === productId && r.customerId === customerId
        ? { ...r, rating: newRating }
        : r
    );
    set({ productRatings: updatedRatings });
  },
  getProductRating: (productId) => {
    const { productRatings } = get();
    const ratings = productRatings.filter((r) => r.productId === productId);
    if (ratings.length === 0) {
      // Generate consistent random rating based on productId (3.5-5.0 range)
      // This ensures products always have realistic ratings
      const hash = productId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const randomRating = 3.5 + (hash % 150) / 100; // Range: 3.5 to 5.0
      return Math.round(randomRating * 10) / 10; // Round to 1 decimal
    }
    const sum = ratings.reduce((acc, r) => acc + r.rating, 0);
    return sum / ratings.length;
  },
  hasRatedProduct: (productId, customerId) => {
    const { productRatings } = get();
    return productRatings.some((r) => r.productId === productId && r.customerId === customerId);
  },
  canRateProduct: (productId, customerId, orders) => {
    // Customer can rate if they have ordered the product (order status is delivered)
    return orders.some(
      (order) =>
        order.customerId === customerId &&
        order.status === 'delivered' &&
        order.items.some((item) => item.id === productId)
    );
  },
  getVendorRating: (vendorId, productIds) => {
    const { productRatings, getProductRating } = get();
    // Get all ratings for products from this vendor
    const relevantRatings = productRatings.filter((r) => productIds.includes(r.productId));
    
    // If no ratings exist, calculate average from default product ratings
    if (relevantRatings.length === 0 && productIds.length > 0) {
      const productRatings = productIds.map(id => getProductRating(id));
      const sum = productRatings.reduce((acc, r) => acc + r, 0);
      return sum / productRatings.length;
    }
    
    if (relevantRatings.length === 0) return 0;
    const sum = relevantRatings.reduce((acc, r) => acc + r.rating, 0);
    return sum / relevantRatings.length;
  },
  // Load persisted data from AsyncStorage
  loadPersistedData: async () => {
    try {
      const [addressesData, paymentMethodsData] = await Promise.all([
        AsyncStorage.getItem('groza_addresses'),
        AsyncStorage.getItem('groza_paymentMethods'),
      ]);

      if (addressesData) {
        const addresses = JSON.parse(addressesData);
        set({ addresses });
      }

      if (paymentMethodsData) {
        const paymentMethods = JSON.parse(paymentMethodsData);
        set({ paymentMethods });
      } else {
        // Set default cash payment method if none exists
        const defaultPaymentMethods = [
          {
            id: 'cash-1',
            type: 'cash',
            label: 'Cash on Delivery',
            isDefault: true,
          },
        ];
        set({ paymentMethods: defaultPaymentMethods });
        await AsyncStorage.setItem('groza_paymentMethods', JSON.stringify(defaultPaymentMethods));
      }
    } catch (error) {
      console.error('Error loading persisted data:', error);
    }
  },
})); 