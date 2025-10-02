import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChange, handleGoogleRedirectResult } from '../services/firebase/auth';

const FirebaseContext = createContext();

export const useFirebase = () => {
  const context = useContext(FirebaseContext);
  if (!context) {
    throw new Error('useFirebase must be used within a FirebaseProvider');
  }
  return context;
};

export const FirebaseProvider = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    console.log('🔥 Initializing Firebase Auth listener...');
    
    // Handle redirect result first
    handleGoogleRedirectResult().then((result) => {
      if (result && result.success) {
        console.log('🔥 Google redirect result:', result.user);
        // User will be set by the auth state change listener
      }
    });
    
    const unsubscribe = onAuthStateChange((user) => {
      console.log('🔥 Firebase Auth state changed:', user ? `User: ${user.email}` : 'No user');
      setFirebaseUser(user);
      setLoading(false);
      setInitialized(true);
    });

    // Cleanup subscription on unmount
    return () => {
      console.log('🔥 Cleaning up Firebase Auth listener');
      unsubscribe();
    };
  }, []);

  const value = {
    firebaseUser,
    loading,
    initialized,
    isAuthenticated: !!firebaseUser
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Initializing Firebase...</p>
        </div>
      </div>
    );
  }

  return (
    <FirebaseContext.Provider value={value}>
      {children}
    </FirebaseContext.Provider>
  );
};
