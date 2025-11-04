import { create } from 'zustand';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'customer' | 'driver' | 'restaurant' | 'admin';
  phone?: string;
  avatar?: string;
  username?: string;
  newsletterSubscription?: boolean;
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
  
  // Add favourites state
  favourites: any[]; // Assuming 'any' for now, as the type is not defined in the original file
  
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
  // Add favourite actions
  addFavourite: (vendor: any) => void; // Assuming 'any' for now
  removeFavourite: (vendorId: string) => void;
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
  // Add favourites state
  favourites: [],

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
})); 