'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

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

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const router = useRouter();

  // User profile data
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [availability, setAvailability] = useState('');
  const [skillsOffered, setSkillsOffered] = useState<string[]>([]);
  const [skillsWanted, setSkillsWanted] = useState<string[]>([]);
  const [newSkillOffered, setNewSkillOffered] = useState('');
  const [newSkillWanted, setNewSkillWanted] = useState('');
  const [skillCategory, setSkillCategory] = useState(SKILL_CATEGORIES[0]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        // Redirect to login if not authenticated
        router.push('/auth/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  const handleAddSkillOffered = () => {
    if (newSkillOffered.trim() !== '') {
      setSkillsOffered([...skillsOffered, `${skillCategory}: ${newSkillOffered.trim()}`]);
      setNewSkillOffered('');
    }
  };

  const handleAddSkillWanted = () => {
    if (newSkillWanted.trim() !== '') {
      setSkillsWanted([...skillsWanted, `${skillCategory}: ${newSkillWanted.trim()}`]);
      setNewSkillWanted('');
    }
  };

  const handleRemoveSkillOffered = (index: number) => {
    setSkillsOffered(skillsOffered.filter((_, i) => i !== index));
  };

  const handleRemoveSkillWanted = (index: number) => {
    setSkillsWanted(skillsWanted.filter((_, i) => i !== index));
  };

  const handleNextStep = () => {
    setCurrentStep(currentStep + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
  };

  const handleSubmit = async () => {
    if (!userId) return;
    
    setLoading(true);
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        bio,
        location,
        availability,
        skillsOffered,
        skillsWanted,
        onboardingCompleted: true
      });
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h1 className="text-2xl font-bold text-gray-900 text-center mb-8">
              Complete Your Profile
            </h1>
            
            {/* Progress bar */}
            <div className="w-full bg-gray-200 rounded-full h-2.5 mb-10">
              <div 
                className="bg-primary-600 h-2.5 rounded-full transition-all duration-300" 
                style={{ width: `${(currentStep / 3) * 100}%` }}
              ></div>
            </div>

            {/* Step 1: Basic Information */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Tell us about yourself</h2>
                
                <div>
                  <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
                    Bio
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="bio"
                      name="bio"
                      rows={4}
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Tell others about yourself, your background, and your interests..."
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700">
                    Location
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      name="location"
                      id="location"
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="City, Country"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="availability" className="block text-sm font-medium text-gray-700">
                    Availability
                  </label>
                  <div className="mt-1">
                    <select
                      id="availability"
                      name="availability"
                      className="shadow-sm focus:ring-primary-500 focus:border-primary-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      value={availability}
                      onChange={(e) => setAvailability(e.target.value)}
                    >
                      <option value="">Select your availability</option>
                      <option value="Weekdays">Weekdays</option>
                      <option value="Weekends">Weekends</option>
                      <option value="Evenings">Evenings</option>
                      <option value="Flexible">Flexible</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Skills Offered */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Skills you can offer</h2>
                <p className="text-sm text-gray-500">
                  Add skills that you can teach or share with others.
                </p>
                
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label htmlFor="skill-category" className="block text-sm font-medium text-gray-700">
                      Category
                    </label>
                    <select
                      id="skill-category"
                      name="skill-category"
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                      value={skillCategory}
                      onChange={(e) => setSkillCategory(e.target.value)}
                    >
                      {SKILL_CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="sm:col-span-3">
                    <label htmlFor="skill-offered" className="block text-sm font-medium text-gray-700">
                      Skill
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <input
                        type="text"
                        name="skill-offered"
                        id="skill-offered"
                        className="focus:ring-primary-500 focus:border-primary-500 flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300"
                        placeholder="e.g., JavaScript, Piano, Spanish"
                        value={newSkillOffered}
                        onChange={(e) => setNewSkillOffered(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddSkillOffered()}
                      />
                      <button
                        type="button"
                        onClick={handleAddSkillOffered}
                        className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-500 rounded-r-md hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Display added skills */}
                {skillsOffered.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-700">Your skills:</h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {skillsOffered.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-primary-100 text-primary-800"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => handleRemoveSkillOffered(index)}
                            className="ml-1.5 inline-flex items-center justify-center h-5 w-5 rounded-full bg-primary-200 text-primary-500 hover:bg-primary-300 focus:outline-none"
                          >
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Skills Wanted */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-xl font-semibold text-gray-900">Skills you want to learn</h2>
                <p className="text-sm text-gray-500">
                  Add skills that you're interested in learning from others.
                </p>
                
                <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
                  <div className="sm:col-span-3">
                    <label htmlFor="skill-category" className="block text-sm font-medium text-gray-700">
                      Category
                    </label>
                    <select
                      id="skill-category"
                      name="skill-category"
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm rounded-md"
                      value={skillCategory}
                      onChange={(e) => setSkillCategory(e.target.value)}
                    >
                      {SKILL_CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="sm:col-span-3">
                    <label htmlFor="skill-wanted" className="block text-sm font-medium text-gray-700">
                      Skill
                    </label>
                    <div className="mt-1 flex rounded-md shadow-sm">
                      <input
                        type="text"
                        name="skill-wanted"
                        id="skill-wanted"
                        className="focus:ring-primary-500 focus:border-primary-500 flex-1 block w-full rounded-none rounded-l-md sm:text-sm border-gray-300"
                        placeholder="e.g., Python, Guitar, French"
                        value={newSkillWanted}
                        onChange={(e) => setNewSkillWanted(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleAddSkillWanted()}
                      />
                      <button
                        type="button"
                        onClick={handleAddSkillWanted}
                        className="inline-flex items-center px-3 py-2 border border-l-0 border-gray-300 bg-gray-50 text-gray-500 rounded-r-md hover:bg-gray-100 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
                
                {/* Display added skills */}
                {skillsWanted.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-sm font-medium text-gray-700">Skills you want to learn:</h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {skillsWanted.map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-secondary-100 text-secondary-800"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => handleRemoveSkillWanted(index)}
                            className="ml-1.5 inline-flex items-center justify-center h-5 w-5 rounded-full bg-secondary-200 text-secondary-500 hover:bg-secondary-300 focus:outline-none"
                          >
                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                  >
                    {loading ? 'Saving...' : 'Complete Profile'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
