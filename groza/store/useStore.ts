import { create } from 'zustand';

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
  addAddress: (address: Address) => void;
  updateAddress: (addressId: string, updates: Partial<Address>) => void;
  removeAddress: (addressId: string) => void;
  setDefaultAddress: (addressId: string) => void;
  // Payment method actions
  addPaymentMethod: (method: PaymentMethod) => void;
  updatePaymentMethod: (methodId: string, updates: Partial<PaymentMethod>) => void;
  removePaymentMethod: (methodId: string) => void;
  setDefaultPaymentMethod: (methodId: string) => void;
  // Rating actions
  addProductRating: (rating: ProductRating) => void;
  updateProductRating: (productId: string, customerId: string, newRating: number) => void;
  getProductRating: (productId: string) => number; // Returns average rating
  hasRatedProduct: (productId: string, customerId: string) => boolean;
  canRateProduct: (productId: string, customerId: string, orders: Order[]) => boolean;
  getVendorRating: (vendorId: string, productIds: string[]) => number; // Calculate vendor rating from products
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

  // Actions
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setAuthenticated: (isAuthenticated) => set({ isAuthenticated }),
  
  addToCart: (item) => {
    const { cart } = get();
    const existingItem = cart.find(cartItem => cartItem.id === item.id);
    
    if (existingItem) {
      const updatedCart = cart.map(cartItem =>
        cartItem.id === item.id
          ? { ...cartItem, quantity: cartItem.quantity + item.quantity }
          : cartItem
      );
      const cartTotal = updatedCart.reduce((total, item) => total + (item.price * item.quantity), 0);
      set({ cart: updatedCart, cartTotal });
    } else {
      const updatedCart = [...cart, item];
      const cartTotal = updatedCart.reduce((total, item) => total + (item.price * item.quantity), 0);
      set({ cart: updatedCart, cartTotal });
    }
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
  addAddress: (address) => {
    const { addresses } = get();
    const newAddress = {
      ...address,
      isDefault: addresses.length === 0, // First address is default
    };
    set({ addresses: [...addresses, newAddress] });
  },
  updateAddress: (addressId, updates) => {
    const { addresses } = get();
    const updatedAddresses = addresses.map((addr) =>
      addr.id === addressId ? { ...addr, ...updates } : addr
    );
    set({ addresses: updatedAddresses });
  },
  removeAddress: (addressId) => {
    const { addresses } = get();
    const updatedAddresses = addresses.filter((addr) => addr.id !== addressId);
    // If we removed the default address, make the first one default
    if (updatedAddresses.length > 0 && addresses.find((a) => a.id === addressId)?.isDefault) {
      updatedAddresses[0].isDefault = true;
    }
    set({ addresses: updatedAddresses });
  },
  setDefaultAddress: (addressId) => {
    const { addresses } = get();
    const updatedAddresses = addresses.map((addr) => ({
      ...addr,
      isDefault: addr.id === addressId,
    }));
    set({ addresses: updatedAddresses });
  },
  // Payment method actions
  addPaymentMethod: (method) => {
    const { paymentMethods } = get();
    const newMethod = {
      ...method,
      isDefault: paymentMethods.length === 0,
    };
    set({ paymentMethods: [...paymentMethods, newMethod] });
  },
  updatePaymentMethod: (methodId, updates) => {
    const { paymentMethods } = get();
    const updatedMethods = paymentMethods.map((method) =>
      method.id === methodId ? { ...method, ...updates } : method
    );
    set({ paymentMethods: updatedMethods });
  },
  removePaymentMethod: (methodId) => {
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
  },
  setDefaultPaymentMethod: (methodId) => {
    const { paymentMethods } = get();
    const updatedMethods = paymentMethods.map((method) => ({
      ...method,
      isDefault: method.id === methodId,
    }));
    set({ paymentMethods: updatedMethods });
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
    if (ratings.length === 0) return 0;
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
    const { productRatings } = get();
    // Get all ratings for products from this vendor
    const relevantRatings = productRatings.filter((r) => productIds.includes(r.productId));
    if (relevantRatings.length === 0) return 0;
    const sum = relevantRatings.reduce((acc, r) => acc + r.rating, 0);
    return sum / relevantRatings.length;
  },
})); 