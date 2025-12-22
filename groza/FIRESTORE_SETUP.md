# Fix Firestore Connection Error

## The Problem
You're seeing: `Could not reach Cloud Firestore backend`

This means Firestore database hasn't been created in your Firebase project yet.

## Solution: Enable & Create Firestore Database

### Step 1: Go to Firebase Console
1. Visit: https://console.firebase.google.com/
2. Select your project: **groza-delivery**

### Step 2: Create Firestore Database
1. In the left sidebar, click **"Firestore Database"**
2. If you see "Create database" button, click it
3. If not, the database might already exist - proceed to Step 3

### Step 3: Choose Database Mode
- Select **"Start in test mode"** (we have security rules already)
- Click **Next**

### Step 4: Choose Location
- Select **"africa-south1"** (South Africa - matches your firebase.json config)
- Or choose the closest region to your users
- Click **"Enable"**

### Step 5: Wait for Database Creation
- Firebase will create your database (takes 1-2 minutes)

### Step 6: Deploy Security Rules
After the database is created, deploy your security rules:

```bash
cd groza
firebase deploy --only firestore:rules
```

## Verify It's Working

After completing the steps above:
1. Restart your Expo app (`npx expo start --clear`)
2. The Firestore connection error should disappear
3. You should see "Connected to Firestore" or no errors

## If You Still See Errors

1. **Check your internet connection** - Firestore needs internet access
2. **Verify Firebase project** - Make sure you're using the correct project ID: `groza-delivery`
3. **Check Firebase Console** - Go to Firestore Database and verify it shows collections/documents area
4. **Redeploy rules** - Run `firebase deploy --only firestore:rules` again

## Database Location Note

Your `firebase.json` shows location `africa-south1`. Make sure the location you choose in Step 4 matches this, or update `firebase.json` to match your chosen location.

