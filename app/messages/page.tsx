'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import DashboardLayout from '@/components/DashboardLayout';

export default function Messages() {
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/auth/login');
        return;
      }

      setCurrentUser(user);

      try {
        // Fetch all conversations where the current user is a participant
        const conversationsRef = collection(db, 'conversations');
        const q = query(
          conversationsRef,
          where('participants', 'array-contains', user.uid),
          orderBy('lastMessageAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        
        const conversationsData = await Promise.all(querySnapshot.docs.map(async (doc) => {
          const data = doc.data();
          
          // Get the other participant's user data
          const otherUserId = data.participants.find((id: string) => id !== user.uid);
          const userDocRef = await getDocs(query(collection(db, 'users'), where('uid', '==', otherUserId)));
          let userData = null;
          
          if (!userDocRef.empty) {
            userData = userDocRef.docs[0].data();
          }
          
          return {
            id: doc.id,
            ...data,
            otherUser: userData
          };
        }));
        
        setConversations(conversationsData);
      } catch (error) {
        console.error('Error fetching conversations:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return date.toLocaleDateString([], { weekday: 'short' });
    } else {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }
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
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">Messages</h1>
          </div>
          
          <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
            {conversations.length > 0 ? (
              <ul className="divide-y divide-gray-200">
                {conversations.map((conversation) => (
                  <li key={conversation.id}>
                    <Link href={`/messages/${conversation.otherUser?.uid}`} className="block hover:bg-gray-50">
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              {conversation.otherUser?.photoURL ? (
                                <img
                                  className="h-10 w-10 rounded-full"
                                  src={conversation.otherUser.photoURL}
                                  alt={conversation.otherUser.displayName}
                                />
                              ) : (
                                <span className="text-gray-600 font-medium">
                                  {conversation.otherUser?.displayName?.charAt(0) || 
                                   conversation.otherUser?.email?.charAt(0) || 'U'}
                                </span>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {conversation.otherUser?.displayName || 'Unknown User'}
                              </div>
                              <div className="text-sm text-gray-500 truncate max-w-xs">
                                {conversation.lastMessage || 'No messages yet'}
                              </div>
                            </div>
                          </div>
                          <div className="ml-2 flex-shrink-0 flex flex-col items-end">
                            <div className="text-sm text-gray-500">
                              {formatTimestamp(conversation.lastMessageAt)}
                            </div>
                            {conversation.unreadCount > 0 && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                                {conversation.unreadCount}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-5 sm:p-6 text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">No messages yet</h3>
                <p className="mt-1 text-sm text-gray-500">
                  Start a conversation by browsing skills and connecting with other users.
                </p>
                <div className="mt-6">
                  <Link
                    href="/skills/browse"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Browse Skills
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
