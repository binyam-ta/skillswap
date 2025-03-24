"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, DocumentData } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { 
  subscribeToDocument, 
  subscribeToUserSwaps, 
  subscribeToUserConversations,
  subscribeToConversationMessages
} from '@/lib/realtimeDb';

// Define the context type
interface AppContextType {
  // Auth
  currentUser: User | null;
  isLoading: boolean;
  
  // User data
  userData: DocumentData | null;
  updateUserData: (data: Partial<DocumentData>) => Promise<void>;
  
  // Swaps
  swaps: {
    active: DocumentData[];
    pending: DocumentData[];
    completed: DocumentData[];
  };
  
  // Messages
  conversations: DocumentData[];
  currentConversation: string | null;
  setCurrentConversation: (conversationId: string | null) => void;
  messages: DocumentData[];
}

// Create the context with default values
const AppContext = createContext<AppContextType>({
  // Auth
  currentUser: null,
  isLoading: true,
  
  // User data
  userData: null,
  updateUserData: async () => {},
  
  // Swaps
  swaps: {
    active: [],
    pending: [],
    completed: []
  },
  
  // Messages
  conversations: [],
  currentConversation: null,
  setCurrentConversation: () => {},
  messages: []
});

// Provider component
export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Auth state
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // User data
  const [userData, setUserData] = useState<DocumentData | null>(null);
  
  // Swaps
  const [swaps, setSwaps] = useState<{
    active: DocumentData[];
    pending: DocumentData[];
    completed: DocumentData[];
  }>({
    active: [],
    pending: [],
    completed: []
  });
  
  // Messages
  const [conversations, setConversations] = useState<DocumentData[]>([]);
  const [currentConversation, setCurrentConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<DocumentData[]>([]);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      
      if (user) {
        // Check if user document exists, create if not
        const userDocRef = doc(db, 'users', user.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists()) {
          // Create user document with basic info
          await setDoc(userDocRef, {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          });
        }
      } else {
        // Reset state when user logs out
        setUserData(null);
        setSwaps({ active: [], pending: [], completed: [] });
        setConversations([]);
        setCurrentConversation(null);
        setMessages([]);
      }
      
      setIsLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  // Subscribe to user data when auth state changes
  useEffect(() => {
    if (!currentUser) return;
    
    const unsubscribe = subscribeToDocument(
      'users',
      currentUser.uid,
      (data) => {
        setUserData(data);
      }
    );
    
    return () => unsubscribe();
  }, [currentUser]);

  // Subscribe to user's swaps
  useEffect(() => {
    if (!currentUser) return;
    
    const unsubscribers = subscribeToUserSwaps(
      currentUser.uid,
      (data) => {
        // Merge the data from different subscriptions
        setSwaps(prevSwaps => ({
          active: data.active.length > 0 ? data.active : prevSwaps.active,
          pending: data.pending.length > 0 ? data.pending : prevSwaps.pending,
          completed: data.completed.length > 0 ? data.completed : prevSwaps.completed
        }));
      }
    );
    
    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [currentUser]);

  // Subscribe to user's conversations
  useEffect(() => {
    if (!currentUser) return;
    
    const unsubscribe = subscribeToUserConversations(
      currentUser.uid,
      (data) => {
        setConversations(data);
      }
    );
    
    return () => unsubscribe();
  }, [currentUser]);

  // Subscribe to messages in current conversation
  useEffect(() => {
    if (!currentConversation) {
      setMessages([]);
      return;
    }
    
    const unsubscribe = subscribeToConversationMessages(
      currentConversation,
      (data) => {
        setMessages(data);
      }
    );
    
    return () => unsubscribe();
  }, [currentConversation]);

  // Update user data
  const updateUserData = async (data: Partial<DocumentData>) => {
    if (!currentUser) return;
    
    const userDocRef = doc(db, 'users', currentUser.uid);
    await updateDoc(userDocRef, {
      ...data,
      updatedAt: new Date().toISOString()
    });
  };

  // Context value
  const value: AppContextType = {
    // Auth
    currentUser,
    isLoading,
    
    // User data
    userData,
    updateUserData,
    
    // Swaps
    swaps,
    
    // Messages
    conversations,
    currentConversation,
    setCurrentConversation,
    messages
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Custom hook to use the context
export const useApp = () => useContext(AppContext);
