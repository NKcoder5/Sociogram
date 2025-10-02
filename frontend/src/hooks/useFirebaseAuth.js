import { useState, useEffect } from 'react';
import { useFirebase } from '../context/FirebaseContext';
import { useAuth } from '../context/AuthContext';
import { signInWithEmail, signUpWithEmail, signOutUser } from '../services/firebase/auth';

export const useFirebaseAuth = () => {
  const { firebaseUser } = useFirebase();
  const { user, login, logout } = useAuth();
  const [syncing, setSyncing] = useState(false);

  // Sync Firebase user with your existing auth system
  useEffect(() => {
    const syncUsers = async () => {
      if (syncing) return;
      
      setSyncing(true);
      
      try {
        // If Firebase user exists but no local user, sync them
        if (firebaseUser && !user) {
          console.log('🔄 Syncing Firebase user to local auth...');
          
          // You can call your existing login API with Firebase token
          const idToken = await firebaseUser.getIdToken();
          
          // Example: Call your backend to create/login user with Firebase token
          // await login({ firebaseToken: idToken });
        }
        
        // If local user exists but no Firebase user, you might want to sign them out
        if (!firebaseUser && user) {
          console.log('🔄 Firebase user signed out, syncing local auth...');
          // await logout();
        }
      } catch (error) {
        console.error('❌ Error syncing auth states:', error);
      } finally {
        setSyncing(false);
      }
    };

    syncUsers();
  }, [firebaseUser, user, syncing]);

  // Enhanced login that works with both systems
  const enhancedLogin = async (email, password) => {
    try {
      // First, sign in with Firebase
      const firebaseResult = await signInWithEmail(email, password);
      
      if (firebaseResult.success) {
        // Then sync with your existing system
        const idToken = await firebaseResult.user.getIdToken();
        
        // Call your existing login with Firebase token
        // const localResult = await login({ 
        //   email, 
        //   firebaseToken: idToken 
        // });
        
        return {
          success: true,
          user: firebaseResult.user,
          message: 'Signed in successfully!'
        };
      }
      
      return firebaseResult;
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  };

  // Enhanced signup that works with both systems
  const enhancedSignup = async (email, password, username) => {
    try {
      // First, create Firebase user
      const firebaseResult = await signUpWithEmail(email, password, username);
      
      if (firebaseResult.success) {
        // Then create user in your system
        const idToken = await firebaseResult.user.getIdToken();
        
        // Call your existing register API with Firebase token
        // const localResult = await register({
        //   email,
        //   username,
        //   firebaseToken: idToken
        // });
        
        return {
          success: true,
          user: firebaseResult.user,
          message: 'Account created successfully!'
        };
      }
      
      return firebaseResult;
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  };

  // Enhanced logout that works with both systems
  const enhancedLogout = async () => {
    try {
      // Sign out from Firebase
      await signOutUser();
      
      // Sign out from your existing system
      // await logout();
      
      return {
        success: true,
        message: 'Signed out successfully!'
      };
    } catch (error) {
      return {
        success: false,
        message: error.message
      };
    }
  };

  return {
    firebaseUser,
    localUser: user,
    syncing,
    enhancedLogin,
    enhancedSignup,
    enhancedLogout,
    isAuthenticated: !!firebaseUser || !!user
  };
};
