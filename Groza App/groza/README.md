# 🍽️ Groza - Street Vendor Delivery App

A modern food delivery app built with React Native, Expo, and Firebase that connects customers with local street vendors and restaurants.

## ✨ Features

### 🧑‍💼 Customer Features
- **User Authentication**: Sign up/login with email and password
- **Restaurant Discovery**: Browse restaurants by cuisine, rating, and proximity
- **Smart Search**: Search for restaurants and dishes
- **Menu Browsing**: View detailed menus with images and descriptions
- **Shopping Cart**: Add items, modify quantities, and manage cart
- **Order Management**: Place orders, track delivery, and view order history
- **Payment Integration**: Multiple payment methods (card, cash on delivery)
- **Real-time Tracking**: Track your order from preparation to delivery
- **User Profile**: Manage personal information and preferences

### 🏪 Restaurant/Vendor Features
- **Vendor Registration**: Register as a food vendor
- **Menu Management**: Add, edit, and manage menu items
- **Order Management**: Receive and manage incoming orders
- **Real-time Updates**: Update order status in real-time

### 🚚 Driver Features
- **Driver Registration**: Register as a delivery driver
- **Order Acceptance**: Accept and manage delivery requests
- **Route Optimization**: Get optimized delivery routes
- **Earnings Tracking**: Track delivery earnings

## 🛠️ Tech Stack

- **Frontend**: React Native with Expo
- **Navigation**: Expo Router
- **State Management**: Zustand
- **Styling**: NativeWind (Tailwind CSS for React Native)
- **Backend**: Firebase
  - Authentication
  - Firestore Database
  - Cloud Storage
  - Cloud Functions
- **Maps**: React Native Maps
- **Icons**: Expo Vector Icons

## 📱 Screenshots

The app includes the following main screens:
- Authentication (Login/Signup)
- Home with featured restaurants
- Restaurant listings with search and filters
- Restaurant detail with menu
- Shopping cart
- Checkout process
- Order tracking
- User profile

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI
- iOS Simulator (for iOS development)
- Android Studio (for Android development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd groza
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Firebase**
   - Create a new Firebase project
   - Enable Authentication, Firestore, and Storage
   - Update the Firebase configuration in `services/firebase.ts`

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Run on device/simulator**
   ```bash
   # For iOS
   npm run ios
   
   # For Android
   npm run android
   
   # For web
   npm run web
   ```

## 📁 Project Structure

```
groza/
├── app/                    # Expo Router app directory
│   ├── (auth)/            # Authentication screens
│   ├── (tabs)/            # Main tab navigation
│   ├── restaurant/        # Restaurant detail screens
│   └── _layout.tsx        # Root layout
├── components/            # Reusable components
├── services/              # API and service functions
│   ├── firebase.ts        # Firebase configuration
│   └── auth.ts            # Authentication service
├── store/                 # State management
│   └── useStore.ts        # Zustand store
├── hooks/                 # Custom React hooks
├── constants/             # App constants
└── assets/                # Images, fonts, etc.
```

## 🔧 Configuration

### Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable the following services:
   - Authentication (Email/Password)
   - Firestore Database
   - Storage
3. Update the configuration in `services/firebase.ts`:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "your-sender-id",
  appId: "your-app-id"
};
```

### Environment Variables

Create a `.env` file in the root directory:

```env
EXPO_PUBLIC_FIREBASE_API_KEY=your-api-key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
```

## 📱 App Features

### Authentication Flow
- Email/password registration and login
- Role-based user accounts (Customer, Driver, Restaurant)
- Persistent authentication state

### Restaurant Discovery
- Browse restaurants by category
- Search functionality
- Filter by rating, distance, delivery time
- Sort options (rating, distance, delivery time)

### Order Management
- Add items to cart
- Modify quantities
- Checkout process
- Order tracking
- Order history

### User Experience
- Modern, intuitive UI design
- Responsive layout
- Dark/light mode support
- Smooth animations
- Offline support for basic functionality

## 🔒 Security

- Firebase Authentication for user management
- Firestore security rules for data protection
- Input validation and sanitization
- Secure payment processing

## 📊 Performance

- Optimized image loading
- Efficient state management
- Lazy loading for better performance
- Minimal bundle size

## 🧪 Testing

```bash
# Run tests
npm test

# Run linting
npm run lint
```

## 📦 Building for Production

### iOS
```bash
eas build --platform ios
```

### Android
```bash
eas build --platform android
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support, email support@groza.com or create an issue in the repository.

## 🔮 Roadmap

- [ ] Push notifications
- [ ] Real-time chat support
- [ ] AI-powered recommendations
- [ ] Multi-language support
- [ ] Advanced analytics dashboard
- [ ] Social features (reviews, ratings)
- [ ] Loyalty program
- [ ] Subscription plans

---

Built with ❤️ using React Native and Expo
