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

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const signedInUser = result.user;
      // Initialize or update user document in Firestore
      if (signedInUser) {
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
      throw error;
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Firebase Sign-Out Error:', error);
      throw error;
    }
  };

  const saveUserProfileToFirestore = async (profile: UserHealthProfile) => {
    if (!user) return;
    try {
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
    } catch (error) {
      console.error('Error saving user profile to Firestore:', error);
    }
  };

  const getUserProfileFromFirestore = async (): Promise<UserHealthProfile | null> => {
    if (!user) return null;
    try {
      const userDocRef = doc(db, 'users', user.uid);
      const snapshot = await getDoc(userDocRef);
      if (snapshot.exists()) {
        const data = snapshot.data();
        return data as UserHealthProfile;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user profile from Firestore:', error);
      return null;
    }
  };

  const logHydrationToFirestore = async (amountMl: number, dateStr: string) => {
    if (!user) return;
    try {
      const logsRef = collection(db, 'users', user.uid, 'hydrationLogs');
      await addDoc(logsRef, {
        userId: user.uid,
        amountMl,
        date: dateStr,
        timestamp: new Date().toISOString(),
        createdAt: serverTimestamp(),
      });
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
      const chatRef = collection(db, 'users', user.uid, 'chatMessages');
      await addDoc(chatRef, {
        userId: user.uid,
        role: msg.role,
        text: msg.text,
        model: msg.model || 'gemini-3.5-flash',
        sources: msg.sources || [],
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error saving chat message to Firestore:', error);
    }
  };

  const getChatMessagesFromFirestore = async (): Promise<any[]> => {
    if (!user) return [];
    try {
      const chatRef = collection(db, 'users', user.uid, 'chatMessages');
      const q = query(chatRef, orderBy('timestamp', 'asc'), limit(50));
      const querySnapshot = await getDocs(q);
      const messages: any[] = [];
      querySnapshot.forEach((doc) => {
        messages.push({ id: doc.id, ...doc.data() });
      });
      return messages;
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
        signInWithGoogle,
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
