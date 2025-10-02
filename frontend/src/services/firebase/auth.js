import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult
} from 'firebase/auth';
import { auth } from '../../config/firebase';

// Sign up with email and password
export const signUpWithEmail = async (email, password, displayName) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    // Update user profile with display name
    if (displayName) {
      await updateProfile(userCredential.user, {
        displayName: displayName
      });
    }
    
    return {
      success: true,
      user: userCredential.user,
      message: 'Account created successfully!'
    };
  } catch (error) {
    return {
      success: false,
      error: error.code,
      message: getFirebaseErrorMessage(error.code)
    };
  }
};

// Sign in with email and password
export const signInWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return {
      success: true,
      user: userCredential.user,
      message: 'Signed in successfully!'
    };
  } catch (error) {
    return {
      success: false,
      error: error.code,
      message: getFirebaseErrorMessage(error.code)
    };
  }
};

// Sign in with Google (using popup with fallback to redirect)
export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    provider.addScope('email');
    provider.addScope('profile');
    
    // Try popup first, fallback to redirect if it fails
    try {
      const userCredential = await signInWithPopup(auth, provider);
      return {
        success: true,
        user: userCredential.user,
        message: 'Signed in with Google successfully!'
      };
    } catch (popupError) {
      // If popup fails due to CORS or other issues, use redirect
      if (popupError.code === 'auth/popup-blocked' || 
          popupError.code === 'auth/popup-closed-by-user' ||
          popupError.message.includes('Cross-Origin-Opener-Policy')) {
        
        console.log('Popup blocked, using redirect method...');
        await signInWithRedirect(auth, provider);
        // The redirect will handle the rest
        return {
          success: true,
          user: null, // Will be handled by redirect result
          message: 'Redirecting to Google...'
        };
      }
      throw popupError;
    }
  } catch (error) {
    return {
      success: false,
      error: error.code,
      message: getFirebaseErrorMessage(error.code)
    };
  }
};

// Handle redirect result (call this on app initialization)
export const handleGoogleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      return {
        success: true,
        user: result.user,
        message: 'Signed in with Google successfully!'
      };
    }
    return null;
  } catch (error) {
    return {
      success: false,
      error: error.code,
      message: getFirebaseErrorMessage(error.code)
    };
  }
};

// Sign out
export const signOutUser = async () => {
  try {
    await signOut(auth);
    return {
      success: true,
      message: 'Signed out successfully!'
    };
  } catch (error) {
    return {
      success: false,
      error: error.code,
      message: 'Failed to sign out'
    };
  }
};

// Reset password
export const resetPassword = async (email) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return {
      success: true,
      message: 'Password reset email sent!'
    };
  } catch (error) {
    return {
      success: false,
      error: error.code,
      message: getFirebaseErrorMessage(error.code)
    };
  }
};

// Listen to auth state changes
export const onAuthStateChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Helper function to get user-friendly error messages
const getFirebaseErrorMessage = (errorCode) => {
  switch (errorCode) {
    case 'auth/user-not-found':
      return 'No account found with this email address.';
    case 'auth/wrong-password':
      return 'Incorrect password.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/invalid-email':
      return 'Invalid email address.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection.';
    default:
      return 'An error occurred. Please try again.';
  }
};
