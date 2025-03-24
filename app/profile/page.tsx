'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import DashboardLayout from '@/components/DashboardLayout';

// Predefined skill categories
const SKILL_CATEGORIES = [
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

export default function Profile() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState<any>({});
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    bio: '',
    location: '',
    skillsOffered: [] as string[],
    skillsWanted: [] as string[],
    newSkillOffered: '',
    newSkillWanted: '',
    selectedCategoryOffered: SKILL_CATEGORIES[0],
    selectedCategoryWanted: SKILL_CATEGORIES[0]
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        // Fetch user data
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUserData(userData);
            
            // Initialize form with user data
            setFormData({
              ...formData,
              displayName: userData.displayName || currentUser.displayName || '',
              bio: userData.bio || '',
              location: userData.location || '',
              skillsOffered: userData.skillsOffered || [],
              skillsWanted: userData.skillsWanted || []
            });
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      } else {
        // Redirect to login if not authenticated
        router.push('/auth/login');
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const addSkill = (type: 'offered' | 'wanted') => {
    const newSkill = type === 'offered' 
      ? `${formData.selectedCategoryOffered}: ${formData.newSkillOffered}`
      : `${formData.selectedCategoryWanted}: ${formData.newSkillWanted}`;
    
    if ((type === 'offered' && formData.newSkillOffered.trim() === '') || 
        (type === 'wanted' && formData.newSkillWanted.trim() === '')) {
      return;
    }
    
    if (type === 'offered') {
      setFormData({
        ...formData,
        skillsOffered: [...formData.skillsOffered, newSkill],
        newSkillOffered: ''
      });
    } else {
      setFormData({
        ...formData,
        skillsWanted: [...formData.skillsWanted, newSkill],
        newSkillWanted: ''
      });
    }
  };

  const removeSkill = (type: 'offered' | 'wanted', index: number) => {
    if (type === 'offered') {
      const updatedSkills = [...formData.skillsOffered];
      updatedSkills.splice(index, 1);
      setFormData({
        ...formData,
        skillsOffered: updatedSkills
      });
    } else {
      const updatedSkills = [...formData.skillsWanted];
      updatedSkills.splice(index, 1);
      setFormData({
        ...formData,
        skillsWanted: updatedSkills
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setIsSaving(true);
    setSaveMessage('');
    
    try {
      const userDocRef = doc(db, 'users', user.uid);
      await updateDoc(userDocRef, {
        displayName: formData.displayName,
        bio: formData.bio,
        location: formData.location,
        skillsOffered: formData.skillsOffered,
        skillsWanted: formData.skillsWanted,
        updatedAt: new Date().toISOString()
      });
      
      setIsEditing(false);
      setSaveMessage('Profile updated successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setSaveMessage('Error updating profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

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
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-semibold text-gray-900">My Profile</h1>
            {!isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          {isEditing ? (
            <form onSubmit={handleSubmit} className="mt-6 space-y-8">
              {/* Basic Information */}
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h2 className="text-lg leading-6 font-medium text-gray-900">Basic Information</h2>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Your personal details and profile information.
                  </p>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
                        Display Name
                      </label>
                      <input
                        type="text"
                        name="displayName"
                        id="displayName"
                        value={formData.displayName}
                        onChange={handleInputChange}
                        className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                        Location
                      </label>
                      <input
                        type="text"
                        name="location"
                        id="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        placeholder="City, Country"
                        className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    
                    <div className="sm:col-span-2">
                      <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                        Bio
                      </label>
                      <textarea
                        id="bio"
                        name="bio"
                        rows={4}
                        value={formData.bio}
                        onChange={handleInputChange}
                        placeholder="Tell others about yourself, your interests, and your experience..."
                        className="mt-1 focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Skills Offered */}
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h2 className="text-lg leading-6 font-medium text-gray-900">Skills I Can Teach</h2>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Skills you can offer to others in exchange.
                  </p>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {formData.skillsOffered.map((skill, index) => (
                        <div key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill('offered', index)}
                            className="ml-2 inline-flex text-primary-500 hover:text-primary-700 focus:outline-none"
                          >
                            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div>
                        <label htmlFor="selectedCategoryOffered" className="sr-only">
                          Category
                        </label>
                        <select
                          id="selectedCategoryOffered"
                          name="selectedCategoryOffered"
                          value={formData.selectedCategoryOffered}
                          onChange={handleInputChange}
                          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                        >
                          {SKILL_CATEGORIES.map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="flex-grow">
                        <label htmlFor="newSkillOffered" className="sr-only">
                          New Skill
                        </label>
                        <input
                          type="text"
                          name="newSkillOffered"
                          id="newSkillOffered"
                          value={formData.newSkillOffered}
                          onChange={handleInputChange}
                          placeholder="Add a skill you can teach..."
                          className="focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => addSkill('offered')}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Skills Wanted */}
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h2 className="text-lg leading-6 font-medium text-gray-900">Skills I Want to Learn</h2>
                  <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    Skills you are interested in learning from others.
                  </p>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                  <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                      {formData.skillsWanted.map((skill, index) => (
                        <div key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {skill}
                          <button
                            type="button"
                            onClick={() => removeSkill('wanted', index)}
                            className="ml-2 inline-flex text-blue-500 hover:text-blue-700 focus:outline-none"
                          >
                            <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <div>
                        <label htmlFor="selectedCategoryWanted" className="sr-only">
                          Category
                        </label>
                        <select
                          id="selectedCategoryWanted"
                          name="selectedCategoryWanted"
                          value={formData.selectedCategoryWanted}
                          onChange={handleInputChange}
                          className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                        >
                          {SKILL_CATEGORIES.map((category) => (
                            <option key={category} value={category}>
                              {category}
                            </option>
                          ))}
                        </select>
                      </div>
                      
                      <div className="flex-grow">
                        <label htmlFor="newSkillWanted" className="sr-only">
                          New Skill
                        </label>
                        <input
                          type="text"
                          name="newSkillWanted"
                          id="newSkillWanted"
                          value={formData.newSkillWanted}
                          onChange={handleInputChange}
                          placeholder="Add a skill you want to learn..."
                          className="focus:ring-primary-500 focus:border-primary-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>
                      
                      <button
                        type="button"
                        onClick={() => addSkill('wanted')}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Save Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  {isSaving ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
              
              {/* Success/Error Message */}
              {saveMessage && (
                <div className={`p-4 rounded-md ${saveMessage.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                  {saveMessage}
                </div>
              )}
            </form>
          ) : (
            <div className="mt-6 space-y-8">
              {/* Profile View */}
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h2 className="text-lg leading-6 font-medium text-gray-900">Profile Information</h2>
                </div>
                <div className="border-t border-gray-200">
                  <dl>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Display Name</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {userData.displayName || user?.displayName || 'Not set'}
                      </dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Email</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {user?.email || 'Not set'}
                      </dd>
                    </div>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Location</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {userData.location || 'Not set'}
                      </dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Bio</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {userData.bio || 'No bio provided'}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>
              
              {/* Skills Offered */}
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h2 className="text-lg leading-6 font-medium text-gray-900">Skills I Can Teach</h2>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                  {userData.skillsOffered && userData.skillsOffered.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {userData.skillsOffered.map((skill: string, index: number) => (
                        <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800">
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No skills added yet.</p>
                  )}
                </div>
              </div>
              
              {/* Skills Wanted */}
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h2 className="text-lg leading-6 font-medium text-gray-900">Skills I Want to Learn</h2>
                </div>
                <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                  {userData.skillsWanted && userData.skillsWanted.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {userData.skillsWanted.map((skill: string, index: number) => (
                        <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                          {skill}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">No skills added yet.</p>
                  )}
                </div>
              </div>
              
              {/* Success Message */}
              {saveMessage && (
                <div className="p-4 rounded-md bg-green-50 text-green-700">
                  {saveMessage}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
