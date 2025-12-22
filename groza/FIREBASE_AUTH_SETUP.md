# Fix Firebase Authentication Error

## The Problem
You're seeing: `auth/configuration-not-found`

This means **Firebase Authentication hasn't been enabled** in your Firebase project yet.

## Solution: Enable Firebase Authentication

### Step 1: Go to Firebase Console
1. Visit: https://console.firebase.google.com/
2. Select your project: **groza-delivery**

### Step 2: Enable Authentication
1. In the left sidebar, click **"Authentication"** (or "Build" > "Authentication")
2. If you see **"Get started"** button, click it
3. If you see the Authentication dashboard, proceed to Step 3

### Step 3: Enable Email/Password Sign-in Method
1. Click on the **"Sign-in method"** tab (top of the page)
2. Find **"Email/Password"** in the list of providers
3. Click on **"Email/Password"**
4. Toggle the **"Enable"** switch to **ON** (for Email/Password)
5. Optionally, you can also enable **"Email link (passwordless sign-in)"** if you want that feature
6. Click **"Save"**

### Step 4: Verify
After enabling Email/Password:
1. You should see a green checkmark or "Enabled" status next to Email/Password
2. The sign-in method should appear in your list

### Step 5: Test Your App
1. Restart your Expo app if it's running
2. Try signing up again - the error should be gone!

## Additional Sign-in Methods (Optional)

If you want to add other sign-in methods later, you can enable them from the same "Sign-in method" tab:
- **Phone** - For phone number authentication
- **Google** - For Google sign-in
- **Apple** - For Apple sign-in (iOS)

For now, **Email/Password** is all you need.

## Common Issues

### "Authentication is not enabled"
- Make sure you clicked "Get started" on the Authentication page
- Wait a few seconds after enabling and refresh the page

### Still seeing errors
1. Check that you're using the correct Firebase project (`groza-delivery`)
2. Verify your `firebaseConfig` in `groza/services/firebase.ts` matches your Firebase project
3. Clear app cache and restart: `npx expo start --clear`

## What This Enables

After enabling Email/Password authentication, your app can:
- ✅ Sign up new users with email and password
- ✅ Sign in existing users
- ✅ Reset passwords
- ✅ Manage user accounts

