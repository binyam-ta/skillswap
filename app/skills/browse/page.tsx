'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import DashboardLayout from '@/components/DashboardLayout';

// Predefined skill categories
const SKILL_CATEGORIES = [
  'All Categories',
  'Programming & Development',
  'Design & Creative',
  'Language Learning',
  'Music & Instruments',
  'Cooking & Baking',
  'Fitness & Sports',
  'Academic Subjects',
  'Business & Finance',
  'Arts & Crafts',
  'Photography & Videography',
  'Writing & Editing',
  'Public Speaking',
  'DIY & Home Improvement',
  'Gardening',
  'Other'
];

export default function BrowseSkills() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<any[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [skillType, setSkillType] = useState('offered'); // 'offered' or 'wanted'
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'rating', 'name'
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        router.push('/auth/login');
        return;
      }

      // Fetch users with skills
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, limit(50)); // Limit to 50 users for performance
        const querySnapshot = await getDocs(q);
        
        const usersData = querySnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() }))
          .filter(user => user.id !== currentUser.uid); // Exclude current user
        
        setUsers(usersData);
        setFilteredUsers(usersData);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Apply filters when search term, category, or skill type changes
  useEffect(() => {
    let result = [...users];
    
    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(user => {
        const skills = skillType === 'offered' ? user.skillsOffered : user.skillsWanted;
        return skills && skills.some((skill: string) => skill.toLowerCase().includes(term));
      });
    }
    
    // Filter by category
    if (selectedCategory !== 'All Categories') {
      result = result.filter(user => {
        const skills = skillType === 'offered' ? user.skillsOffered : user.skillsWanted;
        return skills && skills.some((skill: string) => skill.startsWith(selectedCategory));
      });
    }
    
    // Apply sorting
    result = sortUsers(result, sortBy);
    
    setFilteredUsers(result);
  }, [searchTerm, selectedCategory, skillType, sortBy, users]);

  const sortUsers = (usersToSort: any[], sortOption: string) => {
    switch (sortOption) {
      case 'newest':
        return [...usersToSort].sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      case 'rating':
        return [...usersToSort].sort((a, b) => {
          const aRating = a.ratings && a.ratings.length > 0 
            ? a.ratings.reduce((sum: number, rating: number) => sum + rating, 0) / a.ratings.length 
            : 0;
          const bRating = b.ratings && b.ratings.length > 0 
            ? b.ratings.reduce((sum: number, rating: number) => sum + rating, 0) / b.ratings.length 
            : 0;
          return bRating - aRating;
        });
      case 'name':
        return [...usersToSort].sort((a, b) => 
          (a.displayName || '').localeCompare(b.displayName || '')
        );
      default:
        return usersToSort;
    }
  };

  const handleViewProfile = (userId: string) => {
    router.push(`/profile/${userId}`);
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
          <h1 className="text-2xl font-semibold text-gray-900">Browse Skills</h1>
          
          {/* Search and Filter Section */}
          <div className="bg-white shadow rounded-lg p-6 mt-6">
            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
              {/* Search */}
              <div className="col-span-1 md:col-span-2">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700">
                  Search Skills
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    name="search"
                    id="search"
                    className="focus:ring-primary-500 focus:border-primary-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
                    placeholder="JavaScript, Piano, Spanish..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              
              {/* Category Filter */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  id="category"
                  name="category"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  {SKILL_CATEGORIES.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Sort By */}
              <div>
                <label htmlFor="sort" className="block text-sm font-medium text-gray-700">
                  Sort By
                </label>
                <select
                  id="sort"
                  name="sort"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  <option value="newest">Newest</option>
                  <option value="rating">Highest Rated</option>
                  <option value="name">Name</option>
                </select>
              </div>
            </div>
            
            {/* Skill Type Toggle */}
            <div className="mt-6">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-700 mr-3">I'm looking for people who:</span>
                <div className="flex items-center space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio text-primary-600 h-4 w-4"
                      name="skillType"
                      value="offered"
                      checked={skillType === 'offered'}
                      onChange={() => setSkillType('offered')}
                    />
                    <span className="ml-2 text-sm text-gray-700">Offer skills</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      className="form-radio text-primary-600 h-4 w-4"
                      name="skillType"
                      value="wanted"
                      checked={skillType === 'wanted'}
                      onChange={() => setSkillType('wanted')}
                    />
                    <span className="ml-2 text-sm text-gray-700">Want to learn skills</span>
                  </label>
                </div>
              </div>
            </div>
          </div>
          
          {/* Results Section */}
          <div className="mt-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              {filteredUsers.length} {filteredUsers.length === 1 ? 'user' : 'users'} found
            </h2>
            
            {filteredUsers.length > 0 ? (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredUsers.map((user) => (
                  <div key={user.id} className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-6">
                      <div className="flex items-center">
                        <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                          {user.photoURL ? (
                            <img
                              className="h-12 w-12 rounded-full"
                              src={user.photoURL}
                              alt={user.displayName}
                            />
                          ) : (
                            <span className="text-gray-600 font-medium text-lg">
                              {user.displayName?.charAt(0) || user.email?.charAt(0) || 'U'}
                            </span>
                          )}
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-gray-900">{user.displayName}</h3>
                          <p className="text-sm text-gray-500">{user.location || 'Location not specified'}</p>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700">
                          {skillType === 'offered' ? 'Skills Offered:' : 'Skills Wanted:'}
                        </h4>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {skillType === 'offered' ? (
                            user.skillsOffered && user.skillsOffered.length > 0 ? (
                              user.skillsOffered.slice(0, 3).map((skill: string, index: number) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                                >
                                  {skill}
                                </span>
                              ))
                            ) : (
                              <span className="text-sm text-gray-500">No skills offered</span>
                            )
                          ) : (
                            user.skillsWanted && user.skillsWanted.length > 0 ? (
                              user.skillsWanted.slice(0, 3).map((skill: string, index: number) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary-100 text-secondary-800"
                                >
                                  {skill}
                                </span>
                              ))
                            ) : (
                              <span className="text-sm text-gray-500">No skills wanted</span>
                            )
                          )}
                          {((skillType === 'offered' && user.skillsOffered?.length > 3) || 
                            (skillType === 'wanted' && user.skillsWanted?.length > 3)) && (
                            <span className="text-xs text-gray-500">+more</span>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-6">
                        <button
                          type="button"
                          onClick={() => handleViewProfile(user.id)}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                        >
                          View Profile
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-white overflow-hidden shadow rounded-lg">
                <div className="p-6 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Try adjusting your search or filter to find what you're looking for.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
