import { 
  doc, 
  collection, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  DocumentData,
  QueryConstraint,
  Unsubscribe
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * Subscribe to a single document in real-time
 * @param collectionName The collection name
 * @param documentId The document ID
 * @param callback Function to call with the document data
 * @returns Unsubscribe function
 */
export const subscribeToDocument = (
  collectionName: string,
  documentId: string,
  callback: (data: DocumentData | null) => void
): Unsubscribe => {
  const docRef = doc(db, collectionName, documentId);
  
  return onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      callback({ id: docSnap.id, ...docSnap.data() });
    } else {
      callback(null);
    }
  }, (error) => {
    console.error(`Error subscribing to document ${documentId}:`, error);
    callback(null);
  });
};

/**
 * Subscribe to a collection with optional query constraints
 * @param collectionName The collection name
 * @param constraints Array of query constraints (where, orderBy, etc.)
 * @param callback Function to call with the collection data
 * @returns Unsubscribe function
 */
export const subscribeToCollection = (
  collectionName: string,
  constraints: QueryConstraint[] = [],
  callback: (data: DocumentData[]) => void
): Unsubscribe => {
  const collectionRef = collection(db, collectionName);
  const queryRef = constraints.length > 0 ? query(collectionRef, ...constraints) : query(collectionRef);
  
  return onSnapshot(queryRef, (querySnapshot) => {
    const documents = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(documents);
  }, (error) => {
    console.error(`Error subscribing to collection ${collectionName}:`, error);
    callback([]);
  });
};

/**
 * Subscribe to user's swaps
 * @param userId The user ID
 * @param callback Function to call with the swaps data
 * @returns Unsubscribe function
 */
export const subscribeToUserSwaps = (
  userId: string,
  callback: (data: { active: DocumentData[], pending: DocumentData[], completed: DocumentData[] }) => void
): Unsubscribe[] => {
  const unsubscribers: Unsubscribe[] = [];
  
  // Active swaps
  const activeUnsubscribe = subscribeToCollection(
    'swaps',
    [
      where('participants', 'array-contains', userId),
      where('status', '==', 'active'),
      orderBy('startDate', 'desc')
    ],
    (activeSwaps) => {
      callback({ 
        active: activeSwaps, 
        pending: [], 
        completed: [] 
      });
    }
  );
  unsubscribers.push(activeUnsubscribe);
  
  // Pending swaps
  const pendingUnsubscribe = subscribeToCollection(
    'swaps',
    [
      where('participants', 'array-contains', userId),
      where('status', '==', 'pending'),
      orderBy('requestDate', 'desc')
    ],
    (pendingSwaps) => {
      callback({ 
        active: [], 
        pending: pendingSwaps, 
        completed: [] 
      });
    }
  );
  unsubscribers.push(pendingUnsubscribe);
  
  // Completed swaps
  const completedUnsubscribe = subscribeToCollection(
    'swaps',
    [
      where('participants', 'array-contains', userId),
      where('status', '==', 'completed'),
      orderBy('completionDate', 'desc')
    ],
    (completedSwaps) => {
      callback({ 
        active: [], 
        pending: [], 
        completed: completedSwaps 
      });
    }
  );
  unsubscribers.push(completedUnsubscribe);
  
  return unsubscribers;
};

/**
 * Subscribe to user's messages
 * @param userId The user ID
 * @param callback Function to call with the conversations data
 * @returns Unsubscribe function
 */
export const subscribeToUserConversations = (
  userId: string,
  callback: (data: DocumentData[]) => void
): Unsubscribe => {
  return subscribeToCollection(
    'conversations',
    [
      where('participants', 'array-contains', userId),
      orderBy('lastMessageAt', 'desc')
    ],
    callback
  );
};

/**
 * Subscribe to messages in a conversation
 * @param conversationId The conversation ID
 * @param callback Function to call with the messages data
 * @returns Unsubscribe function
 */
export const subscribeToConversationMessages = (
  conversationId: string,
  callback: (data: DocumentData[]) => void
): Unsubscribe => {
  return subscribeToCollection(
    `conversations/${conversationId}/messages`,
    [orderBy('timestamp', 'asc')],
    callback
  );
};
