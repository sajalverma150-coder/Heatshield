import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from 'firebase/auth';
import {
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  query,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
} from 'firebase/firestore';
import { auth, googleProvider, db } from '../lib/firebase';
import { UserHealthProfile } from '../types';

interface CustomUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  photoURL?: string | null;
  isGuest?: boolean;
}

interface AuthContextType {
  user: User | CustomUser | null;
  loading: boolean;
  authError: string | null;
  clearAuthError: () => void;
  signInWithGoogle: () => Promise<void>;
  signInAsGuest: (name?: string, email?: string) => void;
  signOutUser: () => Promise<void>;
  saveUserProfileToFirestore: (profile: UserHealthProfile) => Promise<void>;
  getUserProfileFromFirestore: () => Promise<UserHealthProfile | null>;
  logHydrationToFirestore: (amountMl: number, dateStr: string) => Promise<void>;
  saveChatMessageToFirestore: (msg: {
    role: 'user' | 'assistant' | 'model';
    text: string;
    model?: string;
    sources?: any[];
  }) => Promise<void>;
  getChatMessagesFromFirestore: () => Promise<any[]>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | CustomUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    // Check local storage for persistent guest session
    const savedGuest = localStorage.getItem('heatshield_guest_user');
    if (savedGuest) {
      try {
        setUser(JSON.parse(savedGuest));
      } catch (e) {
        localStorage.removeItem('heatshield_guest_user');
      }
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        localStorage.removeItem('heatshield_guest_user');
      } else if (!savedGuest) {
        // Only set to null if not using a guest session
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const clearAuthError = () => setAuthError(null);

  const signInAsGuest = (name: string = 'Rajesh Kumar', email: string = 'rajesh.kumar@heatshield.in') => {
    const guestObj: CustomUser = {
      uid: `guest-${Date.now()}`,
      displayName: name,
      email: email,
      isGuest: true,
    };
    setUser(guestObj);
    localStorage.setItem('heatshield_guest_user', JSON.stringify(guestObj));
    setAuthError(null);
  };

  const signInWithGoogle = async () => {
    setAuthError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const signedInUser = result.user;
      if (signedInUser) {
        setUser(signedInUser);
        localStorage.removeItem('heatshield_guest_user');
        const userDocRef = doc(db, 'users', signedInUser.uid);
        await setDoc(
          userDocRef,
          {
            id: signedInUser.uid,
            displayName: signedInUser.displayName || 'HeatShield User',
            email: signedInUser.email,
            photoURL: signedInUser.photoURL || '',
            lastLoginAt: new Date().toISOString(),
          },
          { merge: true }
        );
      }
    } catch (error: any) {
      console.error('Firebase Google Sign-In Error:', error);
      const code = error.code || '';
      if (code === 'auth/popup-blocked') {
        setAuthError('Sign-in popup was blocked by your browser. Please allow popups or open this app in a new browser tab.');
      } else if (code === 'auth/unauthorized-domain') {
        setAuthError('This domain is not yet in the Firebase Authorized Domains list. You can use "Quick Profile" below or open the app on authorized URL.');
      } else if (code === 'auth/popup-closed-by-user') {
        setAuthError('Google sign-in popup was closed before completing.');
      } else {
        setAuthError(error.message || 'Google sign-in could not be completed. You can use Quick Profile instead.');
      }
      throw error;
    }
  };

  const signOutUser = async () => {
    try {
      localStorage.removeItem('heatshield_guest_user');
      await signOut(auth).catch(() => {});
      setUser(null);
      setAuthError(null);
    } catch (error) {
      console.error('Firebase Sign-Out Error:', error);
      setUser(null);
    }
  };

  const saveUserProfileToFirestore = async (profile: UserHealthProfile) => {
    if (!user) return;
    try {
      localStorage.setItem('heatshield_user_profile', JSON.stringify(profile));
      if (!('isGuest' in user && user.isGuest)) {
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(
          userDocRef,
          {
            name: profile.name,
            age: profile.age,
            phone: profile.phone,
            ward: profile.ward,
            occupation: profile.occupation,
            sunExposureHours: profile.sunExposureHours,
            conditions: profile.conditions,
            medications: profile.medications,
            iceContact: profile.iceContact,
            hydrationTodayMl: profile.hydrationTodayMl,
            targetHydrationMl: profile.targetHydrationMl,
            lastWaterLogTime: profile.lastWaterLogTime,
            updatedAt: new Date().toISOString(),
          },
          { merge: true }
        );
      }
    } catch (error) {
      console.error('Error saving user profile:', error);
    }
  };

  const getUserProfileFromFirestore = async (): Promise<UserHealthProfile | null> => {
    if (!user) return null;
    try {
      if (!('isGuest' in user && user.isGuest)) {
        const userDocRef = doc(db, 'users', user.uid);
        const snapshot = await getDoc(userDocRef);
        if (snapshot.exists()) {
          const data = snapshot.data();
          return data as UserHealthProfile;
        }
      }
      const saved = localStorage.getItem('heatshield_user_profile');
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      const saved = localStorage.getItem('heatshield_user_profile');
      return saved ? JSON.parse(saved) : null;
    }
  };

  const logHydrationToFirestore = async (amountMl: number, dateStr: string) => {
    if (!user) return;
    try {
      if (!('isGuest' in user && user.isGuest)) {
        const logsRef = collection(db, 'users', user.uid, 'hydrationLogs');
        await addDoc(logsRef, {
          userId: user.uid,
          amountMl,
          date: dateStr,
          timestamp: new Date().toISOString(),
          createdAt: serverTimestamp(),
        });
      }
    } catch (error) {
      console.error('Error logging hydration to Firestore:', error);
    }
  };

  const saveChatMessageToFirestore = async (msg: {
    role: 'user' | 'assistant' | 'model';
    text: string;
    model?: string;
    sources?: any[];
  }) => {
    if (!user) return;
    try {
      if (!('isGuest' in user && user.isGuest)) {
        const chatRef = collection(db, 'users', user.uid, 'chatMessages');
        await addDoc(chatRef, {
          userId: user.uid,
          role: msg.role,
          text: msg.text,
          model: msg.model || 'gemini-3.5-flash',
          sources: msg.sources || [],
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error('Error saving chat message to Firestore:', error);
    }
  };

  const getChatMessagesFromFirestore = async (): Promise<any[]> => {
    if (!user) return [];
    try {
      if (!('isGuest' in user && user.isGuest)) {
        const chatRef = collection(db, 'users', user.uid, 'chatMessages');
        const q = query(chatRef, orderBy('timestamp', 'asc'), limit(50));
        const querySnapshot = await getDocs(q);
        const messages: any[] = [];
        querySnapshot.forEach((doc) => {
          messages.push({ id: doc.id, ...doc.data() });
        });
        return messages;
      }
      return [];
    } catch (error) {
      console.error('Error loading chat messages from Firestore:', error);
      return [];
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authError,
        clearAuthError,
        signInWithGoogle,
        signInAsGuest,
        signOutUser,
        saveUserProfileToFirestore,
        getUserProfileFromFirestore,
        logHydrationToFirestore,
        saveChatMessageToFirestore,
        getChatMessagesFromFirestore,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
