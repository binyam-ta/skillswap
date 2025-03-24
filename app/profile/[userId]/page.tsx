'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, getDoc, collection, query, where, getDocs, DocumentData } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import DashboardLayout from '@/components/DashboardLayout';

// Define proper interfaces for data types
interface Swap {
  id: string;
  participants: string[];
  status: string;
  createdAt: any;
  updatedAt: any;
  skillOffered: string;
  skillRequested: string;
  [key: string]: any; // For any other properties
}

interface UserProfile {
  displayName?: string;
  email?: string;
  photoURL?: string;
  bio?: string;
  skills?: string[];
  location?: string;
  ratings?: number[];
  skillsOffered?: string[];
  skillsWanted?: string[];
  availability?: string;
  createdAt?: any;
  [key: string]: any; // For any other properties
}

export default function UserProfile({ params }: { params: { userId: string } }) {
  const { userId } = params;
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState('');
  const [swapRequests, setSwapRequests] = useState<Swap[]>([]);
  const [isOwnProfile, setIsOwnProfile] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push('/auth/login');
        return;
      }

      setCurrentUser(user);
      setIsOwnProfile(user.uid === userId);

      try {
        // Fetch user profile
        const userDocRef = doc(db, 'users', userId);
        const userDoc = await getDoc(userDocRef);
        
        if (userDoc.exists()) {
          setUserProfile(userDoc.data() as UserProfile);
        } else {
          setError('User not found');
        }

        // Fetch swap requests between current user and profile user
        const swapsRef = collection(db, 'swaps');
        const q = query(
          swapsRef, 
          where('participants', 'array-contains', user.uid)
        );
        const swapsSnapshot = await getDocs(q);
        
        const relevantSwaps = swapsSnapshot.docs
          .map(doc => ({ 
            id: doc.id, 
            ...doc.data() 
          } as Swap))
          .filter(swap => 
            swap.participants.includes(userId) && 
            swap.participants.includes(user.uid)
          );
        
        setSwapRequests(relevantSwaps);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [userId, router]);

  const handleSendMessage = () => {
    router.push(`/messages/${userId}`);
  };

  const handleProposeSwap = () => {
    router.push(`/swaps/propose?userId=${userId}`);
  };

  const calculateAverageRating = (ratings: number[] | undefined) => {
    if (!ratings || ratings.length === 0) return 0;
    const sum = ratings.reduce((total, rating) => total + rating, 0);
    return (sum / ratings.length).toFixed(1);
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

  if (error) {
    return (
      <DashboardLayout>
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6">
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">{error}</h3>
                <p className="mt-1 text-sm text-gray-500">
                  We couldn't find the user you're looking for.
                </p>
                <div className="mt-6">
                  <button
                    type="button"
                    onClick={() => router.push('/skills/browse')}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Browse Other Users
                  </button>
                </div>
              </div>
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
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            {/* Profile header */}
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  User Profile
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  {isOwnProfile ? 'This is your profile' : 'View user details and skills'}
                </p>
              </div>
              {!isOwnProfile && (
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={handleSendMessage}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <svg className="-ml-1 mr-2 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    Message
                  </button>
                  <button
                    type="button"
                    onClick={handleProposeSwap}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    <svg className="-ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    Propose Swap
                  </button>
                </div>
              )}
            </div>
            
            {/* User info */}
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <div className="flex items-center">
                <div className="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center">
                  {userProfile?.photoURL ? (
                    <img
                      className="h-20 w-20 rounded-full"
                      src={userProfile.photoURL}
                      alt={userProfile.displayName}
                    />
                  ) : (
                    <span className="text-gray-600 font-medium text-2xl">
                      {userProfile?.displayName?.charAt(0) || userProfile?.email?.charAt(0) || 'U'}
                    </span>
                  )}
                </div>
                <div className="ml-6">
                  <h2 className="text-xl font-bold text-gray-900">{userProfile?.displayName}</h2>
                  <div className="mt-1 flex items-center">
                    <svg className="text-yellow-400 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118l-2.8-2.034c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="ml-1 text-sm text-gray-500">
                      {calculateAverageRating(userProfile?.ratings)} ({userProfile?.ratings?.length || 0} ratings)
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Member since {new Date(userProfile?.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              
              {/* Location and availability */}
              <dl className="mt-6 grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Location</dt>
                  <dd className="mt-1 text-sm text-gray-900">{userProfile?.location || 'Not specified'}</dd>
                </div>
                <div className="sm:col-span-1">
                  <dt className="text-sm font-medium text-gray-500">Availability</dt>
                  <dd className="mt-1 text-sm text-gray-900">{userProfile?.availability || 'Not specified'}</dd>
                </div>
              </dl>
              
              {/* Bio */}
              <div className="mt-6">
                <dt className="text-sm font-medium text-gray-500">Bio</dt>
                <dd className="mt-1 text-sm text-gray-900 whitespace-pre-line">
                  {userProfile?.bio || 'No bio provided'}
                </dd>
              </div>
            </div>
            
            {/* Skills */}
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 gap-x-6">
                {/* Skills Offered */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Skills Offered</h3>
                  <div className="mt-4">
                    {userProfile?.skillsOffered && userProfile.skillsOffered.length > 0 ? (
                      <ul className="divide-y divide-gray-200">
                        {userProfile.skillsOffered.map((skill: string, index: number) => (
                          <li key={index} className="py-3">
                            <div className="flex items-center">
                              <span className="text-sm font-medium text-gray-900">{skill}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">No skills offered</p>
                    )}
                  </div>
                </div>
                
                {/* Skills Wanted */}
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Skills Wanted</h3>
                  <div className="mt-4">
                    {userProfile?.skillsWanted && userProfile.skillsWanted.length > 0 ? (
                      <ul className="divide-y divide-gray-200">
                        {userProfile.skillsWanted.map((skill: string, index: number) => (
                          <li key={index} className="py-3">
                            <div className="flex items-center">
                              <span className="text-sm font-medium text-gray-900">{skill}</span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="text-sm text-gray-500">No skills wanted</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Swap History */}
            {swapRequests.length > 0 && (
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <h3 className="text-lg font-medium text-gray-900">Swap History</h3>
                <div className="mt-4">
                  <ul className="divide-y divide-gray-200">
                    {swapRequests.map((swap) => (
                      <li key={swap.id} className="py-3">
                        <div className="flex justify-between">
                          <div>
                            <span className="text-sm font-medium text-gray-900">
                              {swap.skillOffered} ↔ {swap.skillRequested}
                            </span>
                            <p className="text-sm text-gray-500 mt-1">
                              Status: <span className={`font-medium ${
                                swap.status === 'completed' ? 'text-green-600' : 
                                swap.status === 'pending' ? 'text-yellow-600' : 
                                'text-blue-600'
                              }`}>
                                {swap.status.charAt(0).toUpperCase() + swap.status.slice(1)}
                              </span>
                            </p>
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(swap.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
