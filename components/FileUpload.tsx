"use client";

import React, { useState, useRef } from 'react';
import useFileUpload from '@/hooks/useFileUpload';

interface FileUploadProps {
  onUploadComplete: (url: string) => void;
  onUploadError?: (error: Error) => void;
  generatePath: (file: File) => string;
  allowedTypes?: string[];
  maxSizeMB?: number;
  buttonText?: string;
  className?: string;
  multiple?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onUploadComplete,
  onUploadError,
  generatePath,
  allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],
  maxSizeMB = 5,
  buttonText = 'Upload File',
  className = '',
  multiple = false
}) => {
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { progress, isUploading, uploadFile, cancelUpload } = useFileUpload();
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    setError(null);
    
    // Process each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      // Validate file type
      if (!allowedTypes.includes(file.type)) {
        setError(`File type not allowed. Allowed types: ${allowedTypes.join(', ')}`);
        if (onUploadError) onUploadError(new Error('File type not allowed'));
        return;
      }
      
      // Validate file size
      const maxSizeBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxSizeBytes) {
        setError(`File size exceeds the maximum allowed size of ${maxSizeMB}MB`);
        if (onUploadError) onUploadError(new Error('File size exceeds maximum'));
        return;
      }
      
      try {
        // Generate the storage path
        const path = generatePath(file);
        
        // Upload the file
        const url = await uploadFile(file, path);
        
        // Call the callback with the download URL
        onUploadComplete(url);
        
        // Reset the file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error: any) {
        setError(`Upload failed: ${error.message}`);
        if (onUploadError) onUploadError(error);
      }
      
      // If not multiple, only process the first file
      if (!multiple) break;
    }
  };
  
  const handleCancel = () => {
    cancelUpload();
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  return (
    <div className={`w-full ${className}`}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept={allowedTypes.join(',')}
        multiple={multiple}
      />
      
      <div className="flex flex-col space-y-2">
        {!isUploading ? (
          <button
            type="button"
            onClick={handleClick}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            {buttonText}
          </button>
        ) : (
          <div className="space-y-2">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-primary-600 h-2.5 rounded-full" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-500">{progress}% uploaded</span>
              <button
                type="button"
                onClick={handleCancel}
                className="text-sm text-red-600 hover:text-red-800"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
        
        {error && (
          <p className="mt-2 text-sm text-red-600">{error}</p>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
