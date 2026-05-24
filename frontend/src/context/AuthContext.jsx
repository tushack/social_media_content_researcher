import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
} from "firebase/auth";

import { auth, googleProvider } from "../lib/firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [authModalOpen, setAuthModalOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser || null);
      setAuthLoading(false);

      if (currentUser) {
        setAuthModalOpen(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    setUser(result.user);
    setAuthModalOpen(false);
    return result.user;
  };

  const signOut = async () => {
    await firebaseSignOut(auth);
    setUser(null);
  };

  const requireAuth = () => {
    if (!user) {
      setAuthModalOpen(true);
      return false;
    }

    return true;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        authLoading,
        authModalOpen,
        setAuthModalOpen,
        signInWithGoogle,
        signOut,
        requireAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}