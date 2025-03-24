"use client";

import { useState, useCallback } from 'react';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';

interface FileUploadState {
  progress: number;
  url: string | null;
  error: Error | null;
  isUploading: boolean;
}

interface UseFileUploadReturn extends FileUploadState {
  uploadFile: (file: File, path: string) => Promise<string>;
  cancelUpload: () => void;
  resetState: () => void;
}

/**
 * Custom hook for handling file uploads to Firebase Storage
 * with progress tracking
 */
export const useFileUpload = (): UseFileUploadReturn => {
  const [state, setState] = useState<FileUploadState>({
    progress: 0,
    url: null,
    error: null,
    isUploading: false
  });
  
  // Reference to the current upload task
  const [uploadTask, setUploadTask] = useState<any>(null);
  
  // Reset the state
  const resetState = useCallback(() => {
    setState({
      progress: 0,
      url: null,
      error: null,
      isUploading: false
    });
    setUploadTask(null);
  }, []);
  
  // Cancel the current upload
  const cancelUpload = useCallback(() => {
    if (uploadTask) {
      uploadTask.cancel();
      resetState();
    }
  }, [uploadTask, resetState]);
  
  // Upload a file to Firebase Storage
  const uploadFile = useCallback(async (file: File, path: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      try {
        // Reset state before starting a new upload
        setState(prev => ({
          ...prev,
          progress: 0,
          url: null,
          error: null,
          isUploading: true
        }));
        
        // Create a storage reference
        const storageRef = ref(storage, path);
        
        // Start the upload
        const task = uploadBytesResumable(storageRef, file);
        setUploadTask(task);
        
        // Listen for state changes
        task.on(
          'state_changed',
          // Progress observer
          (snapshot) => {
            const progress = Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            );
            setState(prev => ({ ...prev, progress }));
          },
          // Error observer
          (error) => {
            setState(prev => ({ 
              ...prev, 
              error, 
              isUploading: false 
            }));
            reject(error);
          },
          // Completion observer
          async () => {
            try {
              // Get the download URL
              const downloadURL = await getDownloadURL(task.snapshot.ref);
              setState(prev => ({ 
                ...prev, 
                url: downloadURL, 
                isUploading: false 
              }));
              resolve(downloadURL);
            } catch (error: any) {
              setState(prev => ({ 
                ...prev, 
                error, 
                isUploading: false 
              }));
              reject(error);
            }
          }
        );
      } catch (error: any) {
        setState(prev => ({ 
          ...prev, 
          error, 
          isUploading: false 
        }));
        reject(error);
      }
    });
  }, []);
  
  return {
    ...state,
    uploadFile,
    cancelUpload,
    resetState
  };
};

export default useFileUpload;
