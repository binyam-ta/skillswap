'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  addDoc, 
  updateDoc, 
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import DashboardLayout from '@/components/DashboardLayout';

export default function Conversation({ params }: { params: { userId: string } }) {
  const { userId } = params;
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/auth/login');
        return;
      }

      setCurrentUser(user);

      try {
        // Get other user's data
        const userDocRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          setOtherUser(userDoc.data());
        } else {
          console.error('User not found');
          router.push('/messages');
          return;
        }

        // Find existing conversation or create a new one
        const conversationsRef = collection(db, 'conversations');
        const q = query(
          conversationsRef,
          where('participants', 'array-contains', user.uid)
        );
        const querySnapshot = await getDocs(q);
        
        let existingConversation = null;
        
        querySnapshot.forEach(doc => {
          const data = doc.data();
          if (data.participants.includes(userId)) {
            existingConversation = { id: doc.id, ...data };
          }
        });
        
        if (existingConversation) {
          setConversationId(existingConversation.id);
          
          // Set up real-time listener for messages
          const messagesRef = collection(db, 'conversations', existingConversation.id, 'messages');
          const messagesQuery = query(messagesRef, orderBy('timestamp', 'asc'));
          
          const unsubscribeMessages = onSnapshot(messagesQuery, (snapshot) => {
            const messagesData = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            setMessages(messagesData);
            scrollToBottom();
          });
          
          // Update unread count
          if (existingConversation.lastSender !== user.uid && existingConversation.unreadCount > 0) {
            await updateDoc(doc(db, 'conversations', existingConversation.id), {
              unreadCount: 0
            });
          }
          
          return () => unsubscribeMessages();
        } else {
          // We'll create a new conversation when the first message is sent
          setMessages([]);
        }
      } catch (error) {
        console.error('Error fetching conversation:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [userId, router]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !currentUser || sending) return;
    
    setSending(true);
    
    try {
      if (!conversationId) {
        // Create a new conversation
        const newConversationRef = await addDoc(collection(db, 'conversations'), {
          participants: [currentUser.uid, userId],
          lastMessage: newMessage,
          lastMessageAt: serverTimestamp(),
          lastSender: currentUser.uid,
          unreadCount: 1
        });
        
        setConversationId(newConversationRef.id);
        
        // Add first message
        await addDoc(collection(db, 'conversations', newConversationRef.id, 'messages'), {
          text: newMessage,
          senderId: currentUser.uid,
          timestamp: serverTimestamp()
        });
        
        // Set up real-time listener for messages
        const messagesRef = collection(db, 'conversations', newConversationRef.id, 'messages');
        const messagesQuery = query(messagesRef, orderBy('timestamp', 'asc'));
        
        onSnapshot(messagesQuery, (snapshot) => {
          const messagesData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setMessages(messagesData);
          scrollToBottom();
        });
      } else {
        // Add message to existing conversation
        await addDoc(collection(db, 'conversations', conversationId, 'messages'), {
          text: newMessage,
          senderId: currentUser.uid,
          timestamp: serverTimestamp()
        });
        
        // Update conversation metadata
        await updateDoc(doc(db, 'conversations', conversationId), {
          lastMessage: newMessage,
          lastMessageAt: serverTimestamp(),
          lastSender: currentUser.uid,
          unreadCount: 1
        });
      }
      
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg flex flex-col h-[calc(100vh-12rem)]">
            {/* Conversation header */}
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center">
                <Link href="/messages" className="mr-4 text-gray-400 hover:text-gray-500">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                </Link>
                <div className="flex items-center">
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                    {otherUser?.photoURL ? (
                      <img
                        className="h-10 w-10 rounded-full"
                        src={otherUser.photoURL}
                        alt={otherUser.displayName}
                      />
                    ) : (
                      <span className="text-gray-600 font-medium">
                        {otherUser?.displayName?.charAt(0) || otherUser?.email?.charAt(0) || 'U'}
                      </span>
                    )}
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">
                      {otherUser?.displayName || 'Unknown User'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {otherUser?.location || 'Location not specified'}
                    </div>
                  </div>
                </div>
              </div>
              <Link
                href={`/profile/${userId}`}
                className="text-sm text-primary-600 hover:text-primary-700"
              >
                View Profile
              </Link>
            </div>
            
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <svg className="h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No messages yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Start the conversation by sending a message.
                  </p>
                </div>
              ) : (
                messages.map((message) => {
                  const isCurrentUser = message.senderId === currentUser?.uid;
                  
                  return (
                    <div key={message.id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-xs sm:max-w-md px-4 py-2 rounded-lg ${
                        isCurrentUser ? 'bg-primary-100 text-primary-900' : 'bg-gray-100 text-gray-900'
                      }`}>
                        <p className="text-sm">{message.text}</p>
                        <p className={`text-xs mt-1 ${isCurrentUser ? 'text-primary-500' : 'text-gray-500'}`}>
                          {formatTimestamp(message.timestamp)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
            
            {/* Message input */}
            <div className="border-t border-gray-200 p-4">
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="flex-1 focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim() || sending}
                  className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                    !newMessage.trim() || sending
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500'
                  }`}
                >
                  {sending ? (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="-ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  )}
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
