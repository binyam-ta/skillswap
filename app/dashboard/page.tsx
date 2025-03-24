'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

// Dashboard layout components
import DashboardLayout from '@/components/DashboardLayout';

export default function Dashboard() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [activeSwaps, setActiveSwaps] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        // Fetch user profile data
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            setUserProfile(userDoc.data());
            
            // Check if onboarding is completed
            if (!userDoc.data().onboardingCompleted) {
              router.push('/onboarding');
            }
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        // Redirect to login if not authenticated
        router.push('/auth/login');
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Welcome section */}
          <div className="bg-white shadow rounded-lg p-6 mt-6">
            <h2 className="text-lg font-medium text-gray-900">
              Welcome back, {userProfile?.displayName || user?.displayName || 'User'}!
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Here's what's happening with your skill swaps today.
            </p>
          </div>

          {/* Stats overview */}
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {/* Active Swaps */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-primary-100 rounded-md p-3">
                    <svg className="h-6 w-6 text-primary-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Active Swaps
                      </dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">
                          {activeSwaps.length || 0}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-4 sm:px-6">
                <div className="text-sm">
                  <Link href="/swaps/active" className="font-medium text-primary-600 hover:text-primary-500">
                    View all<span className="sr-only"> active swaps</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Pending Requests */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-yellow-100 rounded-md p-3">
                    <svg className="h-6 w-6 text-yellow-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Pending Requests
                      </dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">
                          {pendingRequests.length || 0}
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-4 sm:px-6">
                <div className="text-sm">
                  <Link href="/swaps/pending" className="font-medium text-primary-600 hover:text-primary-500">
                    View all<span className="sr-only"> pending requests</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Profile Completion */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-green-100 rounded-md p-3">
                    <svg className="h-6 w-6 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Profile Completion
                      </dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">
                          100%
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-4 sm:px-6">
                <div className="text-sm">
                  <Link href="/profile" className="font-medium text-primary-600 hover:text-primary-500">
                    View profile<span className="sr-only"> settings</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Skills overview */}
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* Skills Offered */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Skills You Offer
                </h3>
                <div className="mt-4 max-h-60 overflow-y-auto">
                  {userProfile?.skillsOffered && userProfile.skillsOffered.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                      {userProfile.skillsOffered.map((skill: string, index: number) => (
                        <li key={index} className="py-3 flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-900">{skill}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">You haven't added any skills yet.</p>
                  )}
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-4 sm:px-6">
                <div className="text-sm">
                  <Link href="/profile/skills" className="font-medium text-primary-600 hover:text-primary-500">
                    Manage skills<span className="sr-only"> you offer</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Skills Wanted */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Skills You Want to Learn
                </h3>
                <div className="mt-4 max-h-60 overflow-y-auto">
                  {userProfile?.skillsWanted && userProfile.skillsWanted.length > 0 ? (
                    <ul className="divide-y divide-gray-200">
                      {userProfile.skillsWanted.map((skill: string, index: number) => (
                        <li key={index} className="py-3 flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="text-sm font-medium text-gray-900">{skill}</span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">You haven't added any skills you want to learn yet.</p>
                  )}
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-4 sm:px-6">
                <div className="text-sm">
                  <Link href="/profile/skills" className="font-medium text-primary-600 hover:text-primary-500">
                    Manage skills<span className="sr-only"> you want to learn</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Find a Skill Swap CTA */}
          <div className="mt-6 bg-primary-600 shadow rounded-lg overflow-hidden">
            <div className="px-4 py-5 sm:p-6 text-center">
              <h3 className="text-lg leading-6 font-medium text-white">
                Ready to find your next skill swap?
              </h3>
              <div className="mt-4">
                <Link
                  href="/skills/browse"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-primary-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-primary-600 focus:ring-white"
                >
                  Browse Skills
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
