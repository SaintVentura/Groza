# 📄 requirements.md  
**Project Name:** AI-Powered Food Delivery App  
**Tech Stack:** Expo + Firebase + Cursor AI + DeepSeek AI  
**Target Platforms:** iOS & Android  

---

## 🧩 1. Functional Requirements

### 1.1 User Roles
- **Customer**
- **Delivery Driver**
- **Restaurant Owner**
- **Platform Admin**

### 1.2 Customer Features
- Sign up / Login with Firebase Authentication
- Cursor AI-powered food assistant (search & recommendation)
- Browse restaurants by cuisine, rating, proximity
- View restaurant details and menus
- Add dishes to cart, customize orders
- Checkout & payment (Stripe or Flutterwave)
- Real-time order tracking
- Order history & quick reorder
- Chat support using Cursor AI
- Push notifications (order updates, promotions)

### 1.3 Restaurant Owner Features
- Register/login with Firebase
- Dashboard to manage orders
- Edit and manage menus
- Real-time order updates
- View customer feedback & ratings

### 1.4 Delivery Driver Features
- Login with Firebase
- View & accept delivery requests
- Live customer & restaurant map view
- Order status updates: picked, en route, delivered
- Track earnings

### 1.5 Admin Features
- Firebase-based admin access control
- View/manage all orders, users, restaurants
- Resolve disputes and moderate content

---

## ⚙️ 2. Technical Requirements

### 2.1 Frontend (Expo + Cursor AI)
- **Framework:** React Native (via Expo SDK)
- **Navigation:** React Navigation
- **State Management:** Zustand or Redux Toolkit
- **UI Components:** NativeBase or Tailwind with NativeWind
- **AI Interface:** Cursor AI for smart UI (chat, autocomplete, prompts)
- **Maps/Location:** Expo Location + Google Maps API

### 2.2 Backend Logic (DeepSeek AI API)
- Use DeepSeek AI APIs to:
  - Analyze customer food preferences
  - Handle order routing and optimization logic
  - Generate dynamic recommendations
  - Moderate reviews or categorize menu items
- Integrate via HTTPS requests using Axios or Fetch from frontend

### 2.3 Authentication & Storage
- **Auth:** Firebase Authentication (email/password, phone, social login)
- **Database:** Firebase Firestore (NoSQL)
- **File Storage:** Firebase Storage (for menu images, profile pics)
- **Realtime Updates:** Firebase Cloud Functions or Firestore triggers

### 2.4 Notifications
- **Push:** Firebase Cloud Messaging (via Expo Notifications)
- **Order Updates:** Realtime updates with Firestore subscriptions

---

## 🧠 3. AI Integration Overview

### 3.1 Cursor AI (Frontend)
- Use in-app chat and UI widgets for:
  - Smart search queries ("Find vegan pizza under R100")
  - Conversational ordering
  - Order FAQs and app support

### 3.2 DeepSeek AI (Backend API)
- Backend logic powered by DeepSeek for:
  - Menu classification
  - Order recommendation
  - Driver route suggestion
  - Review summarization

---

## 🧪 4. Non-Functional Requirements

- **Performance:** Under 1.2s latency for UI actions
- **Security:** Firebase rules + HTTPS + JWT tokens
- **Accessibility:** Follow WCAG 2.1 AA
- **Scalability:** Firebase auto-scaling for traffic spikes
- **Offline Handling:** Local caching for menu, cart, and previous orders
- **Responsiveness:** Support all modern screen sizes

---

## 📁 5. Project Structure (Frontend)

\`\`\`bash
.
├── assets/
├── components/
├── screens/
│   ├── Customer/
│   ├── Driver/
│   └── Restaurant/
├── navigation/
├── services/
│   ├── firebase/
│   ├── deepseek/
│   └── cursor/
├── utils/
├── store/
└── App.js
\`\`\`

---

## 🚀 6. Milestones

| Milestone | Feature Set | Duration |
|-----------|-------------|----------|
| M1        | Firebase Auth + Onboarding Screens | 3 days |
| M2        | Restaurant & Menu UI | 4 days |
| M3        | Cart + Checkout + Payment Gateway | 5 days |
| M4        | Order Tracking + Maps + Notifications | 5 days |
| M5        | AI Features (Cursor Chat + DeepSeek API) | 7 days |
| M6        | Testing + Launch Prep | 4 days |

---

## 📚 7. Dependencies

- **expo**
- **firebase**
- **react-native-maps**
- **axios**
- **zustand** or **redux-toolkit**
- **cursor-ai SDK (or API integration)**  
- **deepseek.ai REST integration**
- **stripe / flutterwave-react-native**

---
