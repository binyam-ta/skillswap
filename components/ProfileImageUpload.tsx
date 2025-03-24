"use client";

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import FileUpload from './FileUpload';
import { uploadProfileImage } from '@/lib/storage';

interface ProfileImageUploadProps {
  onComplete?: () => void;
}

const ProfileImageUpload: React.FC<ProfileImageUploadProps> = ({ onComplete }) => {
  const { currentUser, userData, updateUserData } = useApp();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  if (!currentUser) {
    return null;
  }
  
  const handleUploadComplete = async (url: string) => {
    try {
      setIsUpdating(true);
      setError(null);
      
      // Update user data with new profile image URL
      await updateUserData({
        photoURL: url
      });
      
      // Call the onComplete callback if provided
      if (onComplete) {
        onComplete();
      }
    } catch (error: any) {
      setError(`Failed to update profile: ${error.message}`);
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleUploadError = (error: Error) => {
    setError(`Upload failed: ${error.message}`);
  };
  
  const generatePath = (file: File) => {
    return `profiles/${currentUser.uid}/${Date.now()}.${file.name.split('.').pop()}`;
  };
  
  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Current profile image */}
      <div className="relative">
        <div className="h-24 w-24 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
          {userData?.photoURL ? (
            <img 
              src={userData.photoURL} 
              alt={userData.displayName || 'Profile'} 
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-gray-500 text-2xl font-medium">
              {userData?.displayName?.charAt(0) || currentUser.email?.charAt(0) || 'U'}
            </span>
          )}
        </div>
      </div>
      
      {/* Upload button */}
      <FileUpload
        onUploadComplete={handleUploadComplete}
        onUploadError={handleUploadError}
        generatePath={generatePath}
        allowedTypes={['image/jpeg', 'image/png', 'image/gif']}
        maxSizeMB={2}
        buttonText="Change Profile Picture"
        className="mt-2"
      />
      
      {/* Error message */}
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      
      {/* Loading state */}
      {isUpdating && (
        <p className="text-sm text-gray-500">Updating profile...</p>
      )}
    </div>
  );
};

export default ProfileImageUpload;
