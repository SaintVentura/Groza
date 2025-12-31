import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  updateProfile,
  sendPasswordResetEmail,
  updatePassword,
  sendEmailVerification,
  GoogleAuthProvider,
  OAuthProvider,
  signInWithCredential
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { Platform, Linking } from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { auth, db } from './firebase';
import { User } from '../store/useStore';

// Complete auth session for better UX
WebBrowser.maybeCompleteAuthSession();

// Check if username is unique
export const checkUsernameAvailability = async (username: string): Promise<boolean> => {
  try {
    const usernameLower = username.trim().toLowerCase();
    const q = query(collection(db, 'usernames'), where('username', '==', usernameLower));
    const querySnapshot = await getDocs(q);
    return querySnapshot.empty; // Returns true if username is available
  } catch (error: any) {
    throw new Error('Error checking username availability');
  }
};

// Check if email is already registered
export const checkEmailExists = async (email: string): Promise<boolean> => {
  try {
    const emailLower = email.trim().toLowerCase();
    const q = query(collection(db, 'users'), where('email', '==', emailLower));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty; // Returns true if email exists
  } catch (error: any) {
    throw new Error('Error checking email availability');
  }
};

// Generate OTP code
const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send OTP via email (mock implementation - replace with actual email service)
export const sendOTP = async (email: string): Promise<string> => {
  try {
    const otp = generateOTP();
    const otpData = {
      email: email.toLowerCase(),
      otp,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      used: false,
    };
    
    // Store OTP in Firestore
    await setDoc(doc(db, 'otps', email.toLowerCase()), otpData);
    
    // In production, send email via email service (SendGrid, AWS SES, etc.)
    // For development, log the OTP to console
    console.log('OTP for', email, ':', otp);
    // TODO: Integrate with email service to send OTP to user's email
    
    return otp;
  } catch (error: any) {
    throw new Error('Failed to send OTP. Please try again.');
  }
};

// Verify OTP
export const verifyOTP = async (email: string, otp: string): Promise<boolean> => {
  try {
    const otpDoc = await getDoc(doc(db, 'otps', email));
    if (!otpDoc.exists()) {
      return false;
    }
    
    const otpData = otpDoc.data();
    const now = new Date();
    const expiresAt = otpData.expiresAt.toDate();
    
    if (now > expiresAt) {
      throw new Error('OTP has expired. Please request a new one.');
    }
    
    return otpData.otp === otp;
  } catch (error: any) {
    throw new Error(error.message || 'Invalid OTP');
  }
};

export const signUp = async (
  email: string, 
  password: string, 
  name: string,
  username: string,
  phone: string,
  newsletterSubscription: boolean = false,
  role: 'customer' | 'driver' | 'restaurant' | 'admin' = 'customer'
): Promise<User> => {
  try {
    // Check username availability
    const usernameLower = username.trim().toLowerCase();
    const isAvailable = await checkUsernameAvailability(usernameLower);
    if (!isAvailable) {
      throw new Error('Username is taken');
    }

    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
    const firebaseUser = userCredential.user;

    // Update profile with display name
    await updateProfile(firebaseUser, { displayName: name });

    // Create user document in Firestore
    const userData: User = {
      id: firebaseUser.uid,
      email: firebaseUser.email!,
      name: name.trim(),
      username: usernameLower,
      phone: phone.trim(),
      role,
      newsletterSubscription,
    };

    await setDoc(doc(db, 'users', firebaseUser.uid), userData);
    
    // Store username mapping for uniqueness checking
    await setDoc(doc(db, 'usernames', usernameLower), {
      username: usernameLower,
      userId: firebaseUser.uid,
      createdAt: new Date(),
    });

    return userData;
  } catch (error: any) {
    // Handle Firebase auth errors
    if (error.code === 'auth/email-already-in-use') {
      throw new Error('Email is already registered. Please sign in instead.');
    } else if (error.code === 'auth/weak-password') {
      throw new Error('Password should be at least 6 characters.');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Invalid email address.');
    }
    throw new Error(error.message);
  }
};

// Find user by username or email
const findUserByUsernameOrEmail = async (usernameOrEmail: string): Promise<string | null> => {
  try {
    const input = usernameOrEmail.trim().toLowerCase();
    
    // Check if it's an email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (emailRegex.test(input)) {
      // It's an email, return as-is
      return input;
    }
    
    // It's a username, find the user by username
    const q = query(collection(db, 'usernames'), where('username', '==', input));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const usernameDoc = querySnapshot.docs[0].data();
      // Get the user document to get email
      const userDoc = await getDoc(doc(db, 'users', usernameDoc.userId));
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        return userData.email;
      }
    }
    
    return null;
  } catch (error: any) {
    console.error('Error finding user by username/email:', error);
    // Re-throw the error so it can be handled properly in signIn
    throw new Error(error.message || 'Failed to find user. Please check your connection and try again.');
  }
};

export const signIn = async (usernameOrEmail: string, password: string): Promise<User> => {
  try {
    // Find the email associated with username or use email directly
    let email: string | null;
    try {
      email = await findUserByUsernameOrEmail(usernameOrEmail);
    } catch (findError: any) {
      // If findUserByUsernameOrEmail throws an error, re-throw it
      throw findError;
    }
    
    if (!email) {
      throw new Error('User not found. Please check your username/email.');
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const firebaseUser = userCredential.user;

    // Get user data from Firestore
    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    
    if (!userDoc.exists()) {
      throw new Error('User data not found');
    }

    return userDoc.data() as User;
  } catch (error: any) {
    // If error is already a user-friendly message, throw it as-is
    if (error.message && !error.code) {
      throw error;
    }
    
    if (error.code === 'auth/invalid-credential') {
      // Invalid credential can mean wrong password or user doesn't exist
      // Use generic message for security (don't reveal if username exists)
      throw new Error('Incorrect username or password. Please try again.');
    } else if (error.code === 'auth/user-not-found') {
      throw new Error('Incorrect username or password. Please try again.');
    } else if (error.code === 'auth/wrong-password') {
      throw new Error('Incorrect username or password. Please try again.');
    } else if (error.code === 'auth/invalid-email') {
      throw new Error('Invalid email address.');
    } else if (error.code === 'auth/user-disabled') {
      throw new Error('This account has been disabled.');
    } else if (error.code === 'auth/network-request-failed') {
      throw new Error('Network error. Please check your connection and try again.');
    } else if (error.code === 'auth/too-many-requests') {
      throw new Error('Too many failed attempts. Please try again later.');
    }
    throw new Error(error.message || 'Sign in failed. Please try again.');
  }
};

export const signOutUser = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Request password reset with OTP
export const requestPasswordReset = async (usernameOrEmail: string): Promise<string> => {
  try {
    const email = await findUserByUsernameOrEmail(usernameOrEmail);
    if (!email) {
      throw new Error('User not found. Please check your username/email.');
    }
    
    // Send OTP
    const otp = await sendOTP(email);
    return email; // Return email for the reset process
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Reset password after OTP verification
export const resetPassword = async (email: string, newPassword: string): Promise<void> => {
  try {
    // Find user by email
    const q = query(collection(db, 'users'), where('email', '==', email.toLowerCase()));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      throw new Error('User not found');
    }
    
    // Sign in the user temporarily to update password
    // Note: In production, you'd use a secure token-based approach
    // For now, we'll use Firebase Admin SDK on backend or email link
    // This is a simplified version - you should implement this securely on your backend
    
    // Use sendPasswordResetEmail for now as a workaround
    await sendPasswordResetEmail(auth, email);
    throw new Error('Password reset link sent to your email. Please use the link to reset your password.');
  } catch (error: any) {
    if (error.code === 'auth/user-not-found') {
      throw new Error('User not found.');
    }
    throw new Error(error.message);
  }
};

// Store verified reset token after OTP verification
export const storePasswordResetToken = async (email: string): Promise<string> => {
  try {
    const resetToken = generateOTP() + Date.now().toString(); // Simple token generation
    const resetTokenData = {
      email: email.toLowerCase(),
      token: resetToken,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
      verified: true,
    };
    
    await setDoc(doc(db, 'passwordResetTokens', email), resetTokenData);
    return resetToken;
  } catch (error: any) {
    throw new Error('Failed to create reset token');
  }
};

// Verify password reset token
export const verifyPasswordResetToken = async (email: string, token: string): Promise<boolean> => {
  try {
    const tokenDoc = await getDoc(doc(db, 'passwordResetTokens', email));
    if (!tokenDoc.exists()) {
      return false;
    }
    
    const tokenData = tokenDoc.data();
    const now = new Date();
    const expiresAt = tokenData.expiresAt.toDate();
    
    if (now > expiresAt) {
      throw new Error('Reset token has expired. Please start the recovery process again.');
    }
    
    return tokenData.token === token && tokenData.verified === true;
  } catch (error: any) {
    throw new Error(error.message || 'Invalid reset token');
  }
};

// Reset password with OTP verification
// Note: Firebase client SDK requires authentication to update passwords directly.
// For production, implement a backend endpoint using Firebase Admin SDK.
// This implementation verifies OTP and sends a password reset email as a secure alternative.
export const resetPasswordWithOTP = async (email: string, otp: string, newPassword: string): Promise<void> => {
  try {
    // Verify OTP first
    const isValidOTP = await verifyOTP(email, otp);
    if (!isValidOTP) {
      throw new Error('Invalid or expired OTP. Please start the recovery process again.');
    }
    
    // Mark OTP as used
    await setDoc(doc(db, 'otps', email.toLowerCase()), { used: true }, { merge: true });
    
    // Store the new password temporarily for backend processing
    // In production, this should be handled by your backend using Firebase Admin SDK
    // The backend can verify the OTP and update the password securely
    await setDoc(doc(db, 'pendingPasswordResets', email.toLowerCase()), {
      email: email.toLowerCase(),
      newPassword: newPassword, // TODO: Encrypt this in production or handle via backend
      otpVerified: true,
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
    });
    
    // Send password reset email as a secure method
    // This uses Firebase's built-in secure password reset flow
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (emailError: any) {
      // If email sending fails, still allow the process to continue
      // The backend can retrieve the pending reset from Firestore
      console.error('Failed to send password reset email:', emailError);
    }
    
    // Note: For direct password reset without email link, implement a backend endpoint
    // that uses Firebase Admin SDK to update the password after verifying the OTP
    // throw new Error('Password reset link sent to your email...');
    
    // For now, we'll indicate success - the backend should process the pending reset
    return;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser) return null;

    const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
    if (!userDoc.exists()) return null;

    return userDoc.data() as User;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Complete sign-up for users who authenticated with Google/Apple (no password needed)
export const completeSocialSignUp = async (
  name: string,
  username: string,
  phone: string,
  newsletterSubscription: boolean = false,
  role: 'customer' | 'driver' | 'restaurant' | 'admin' = 'customer'
): Promise<User> => {
  try {
    const firebaseUser = auth.currentUser;
    if (!firebaseUser || !firebaseUser.email) {
      throw new Error('No authenticated user found');
    }

    // Check username availability
    const usernameLower = username.trim().toLowerCase();
    const isAvailable = await checkUsernameAvailability(usernameLower);
    if (!isAvailable) {
      throw new Error('Username is taken');
    }

    // Update Firebase profile with name
    await updateProfile(firebaseUser, { displayName: name.trim() });

    // Create user document in Firestore
    const userData: User = {
      id: firebaseUser.uid,
      email: firebaseUser.email,
      name: name.trim(),
      username: usernameLower,
      phone: phone.trim(),
      role,
      newsletterSubscription,
    };

    await setDoc(doc(db, 'users', firebaseUser.uid), userData);
    
    // Store username mapping for uniqueness checking
    await setDoc(doc(db, 'usernames', usernameLower), {
      username: usernameLower,
      userId: firebaseUser.uid,
      createdAt: new Date(),
    });

    return userData;
  } catch (error: any) {
    throw new Error(error.message);
  }
};

// Sign in with Google or Apple - returns user if exists, or email/name for sign-up if new user
export const signInWithGoogle = async (): Promise<{ user: User } | { email: string; name: string; isNewUser: true }> => {
  try {
    if (Platform.OS === 'web') {
      // Web: Use popup method
      const { signInWithPopup } = await import('firebase/auth');
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      if (!firebaseUser.email) {
        await signOut(auth);
        throw new Error('Email is required for sign-in');
      }

      // Check if user exists in Firestore
      const emailLower = firebaseUser.email.toLowerCase();
      const q = query(collection(db, 'users'), where('email', '==', emailLower));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data() as User;
        return { user: userData };
      } else {
        return {
          email: firebaseUser.email,
          name: firebaseUser.displayName || '',
          isNewUser: true,
        };
      }
    } else {
      // Mobile: Google Sign-In requires native modules not available in Expo Go
      // Users should use email sign-up in Expo Go, or create a development build for full OAuth support
      throw new Error('Google Sign-In is not available in Expo Go. Please use email sign-up instead.');
    }
  } catch (error: any) {
    if (error.message === 'Sign-in cancelled' || error.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign-in cancelled');
    }
    throw new Error(error.message || 'Failed to sign in with Google');
  }
};

export const signInWithApple = async (): Promise<{ user: User } | { email: string; name: string; isNewUser: true }> => {
  try {
    if (Platform.OS === 'web') {
      // Web: Use popup method
      const { signInWithPopup } = await import('firebase/auth');
      const provider = new OAuthProvider('apple.com');
      const result = await signInWithPopup(auth, provider);
      const firebaseUser = result.user;

      if (!firebaseUser.email) {
        await signOut(auth);
        throw new Error('Email is required for sign-in');
      }

      // Check if user exists in Firestore
      const emailLower = firebaseUser.email.toLowerCase();
      const q = query(collection(db, 'users'), where('email', '==', emailLower));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data() as User;
        return { user: userData };
      } else {
        return {
          email: firebaseUser.email,
          name: firebaseUser.displayName || '',
          isNewUser: true,
        };
      }
    } else if (Platform.OS === 'ios') {
      // iOS: Apple Sign-In requires native modules not available in Expo Go
      // Users should use email sign-up in Expo Go, or create a development build for full OAuth support
      throw new Error('Apple Sign-In is not available in Expo Go. Please use email sign-up instead.');
    } else {
      // Android doesn't support Apple Sign-In
      throw new Error('Apple Sign-In is only available on iOS and web. Please use email sign-up on Android.');
    }
  } catch (error: any) {
    if (error.message === 'Sign-in cancelled' || error.code === 'auth/popup-closed-by-user') {
      throw new Error('Sign-in cancelled');
    }
    throw new Error(error.message || 'Failed to sign in with Apple');
  }
}; 