# Firebase Setup Guide for Groza

## ✅ What You Need (All Free - No Billing Required)

For your React Native/Expo app, you only need these Firebase services:

1. **Firebase Authentication** (Email/Password) - ✅ Free
2. **Firestore Database** - ✅ Free (50K reads, 20K writes/day)
3. **Firebase Storage** - ✅ Free (5GB storage, 1GB/day downloads)

## 🚫 What You DON'T Need

- ❌ **Firebase App Hosting** - Not needed for React Native apps
- ❌ **Billing** - Not required for the services above

## 📋 Firebase Init Steps

When running `firebase init`, select ONLY these features:

```
? Which Firebase features do you want to set up for this directory?
 ❯◉ Firestore: Deploy security rules and create indexes
 ◯ Functions: Configure and deploy Cloud Functions
 ◯ Hosting: Configure files for Firebase Hosting
 ◯ Storage: Deploy Cloud Storage security rules
```

**Select:**
- ✅ **Firestore** (for database security rules)
- ✅ **Storage** (optional, but good to have)

**Skip:**
- ❌ **Functions** (unless you need backend functions)
- ❌ **Hosting** (skip this - you don't need it)

## 🔧 If You Want to Host Web Version Later

If you later build a web version (`expo export:web`), you can deploy it to:

### Option 1: Vercel (Recommended - Easiest)
```bash
npm install -g vercel
vercel
```
- ✅ Free tier
- ✅ Automatic deployments
- ✅ No configuration needed

### Option 2: Netlify
```bash
npm install -g netlify-cli
netlify deploy
```
- ✅ Free tier
- ✅ Easy setup

### Option 3: Render
- ✅ Free tier available
- More setup required

## 🎯 Current Status

Your Firebase config is already set up in `groza/services/firebase.ts` with your credentials.

You can:
1. ✅ Use Firebase Auth (sign up/login)
2. ✅ Use Firestore (database)
3. ✅ Use Firebase Storage (if needed)

All without enabling billing!

## 📝 Next Steps

1. **Skip App Hosting** during Firebase init
2. **Deploy Firestore rules** only:
   ```bash
   firebase deploy --only firestore:rules
   ```
3. **Start using your app** - everything works without billing!

