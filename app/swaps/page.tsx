'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import DashboardLayout from '@/components/DashboardLayout';

export default function Swaps() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeSwaps, setActiveSwaps] = useState<any[]>([]);
  const [pendingSwaps, setPendingSwaps] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        // Fetch user's swaps
        try {
          // Fetch active swaps
          const activeSwapsQuery = query(
            collection(db, 'swaps'),
            where('status', '==', 'active'),
            where('participants', 'array-contains', currentUser.uid)
          );
          
          const activeSwapsSnapshot = await getDocs(activeSwapsQuery);
          const activeSwapsData = activeSwapsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setActiveSwaps(activeSwapsData);
          
          // Fetch pending swaps
          const pendingSwapsQuery = query(
            collection(db, 'swaps'),
            where('status', '==', 'pending'),
            where('participants', 'array-contains', currentUser.uid)
          );
          
          const pendingSwapsSnapshot = await getDocs(pendingSwapsQuery);
          const pendingSwapsData = pendingSwapsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setPendingSwaps(pendingSwapsData);
        } catch (error) {
          console.error('Error fetching swaps:', error);
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
      <DashboardLayout>
        <div className="flex items-center justify-center h-full py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">My Swaps</h1>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {/* Tabs */}
          <div className="mt-6 border-b border-gray-200">
            <div className="sm:flex sm:items-baseline">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Skill Exchanges
              </h3>
              <div className="mt-4 sm:mt-0 sm:ml-10">
                <nav className="-mb-px flex space-x-8">
                  <Link
                    href="/swaps"
                    className="border-primary-500 text-primary-600 whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm"
                  >
                    All Swaps
                  </Link>
                  <Link
                    href="/swaps/active"
                    className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm"
                  >
                    Active
                  </Link>
                  <Link
                    href="/swaps/pending"
                    className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm"
                  >
                    Pending
                  </Link>
                  <Link
                    href="/swaps/completed"
                    className="border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm"
                  >
                    Completed
                  </Link>
                </nav>
              </div>
            </div>
          </div>

          {/* Active Swaps */}
          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900">Active Swaps</h2>
            <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-md">
              {activeSwaps.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {activeSwaps.map((swap) => (
                    <li key={swap.id}>
                      <Link href={`/swaps/${swap.id}`} className="block hover:bg-gray-50">
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-primary-600 truncate">
                              {swap.title || 'Skill Exchange'}
                            </p>
                            <div className="ml-2 flex-shrink-0 flex">
                              <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                Active
                              </p>
                            </div>
                          </div>
                          <div className="mt-2 sm:flex sm:justify-between">
                            <div className="sm:flex">
                              <p className="flex items-center text-sm text-gray-500">
                                Started: {new Date(swap.startDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-4 py-6 text-center text-sm text-gray-500">
                  <p>You don't have any active swaps at the moment.</p>
                  <Link href="/skills/browse" className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                    Browse Skills
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Pending Swaps */}
          <div className="mt-8">
            <h2 className="text-lg font-medium text-gray-900">Pending Requests</h2>
            <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-md">
              {pendingSwaps.length > 0 ? (
                <ul className="divide-y divide-gray-200">
                  {pendingSwaps.map((swap) => (
                    <li key={swap.id}>
                      <Link href={`/swaps/${swap.id}`} className="block hover:bg-gray-50">
                        <div className="px-4 py-4 sm:px-6">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-primary-600 truncate">
                              {swap.title || 'Skill Exchange Request'}
                            </p>
                            <div className="ml-2 flex-shrink-0 flex">
                              <p className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                Pending
                              </p>
                            </div>
                          </div>
                          <div className="mt-2 sm:flex sm:justify-between">
                            <div className="sm:flex">
                              <p className="flex items-center text-sm text-gray-500">
                                Requested: {new Date(swap.requestDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="px-4 py-6 text-center text-sm text-gray-500">
                  <p>You don't have any pending swap requests.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
