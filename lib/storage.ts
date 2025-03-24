import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

/**
 * Upload a file to Firebase Storage
 * @param file The file to upload
 * @param path The path in storage where the file should be saved
 * @returns Promise with the download URL
 */
export const uploadFile = async (file: File, path: string): Promise<string> => {
  try {
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(snapshot.ref);
    return downloadURL;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

/**
 * Delete a file from Firebase Storage
 * @param path The path to the file in storage
 */
export const deleteFile = async (path: string): Promise<void> => {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};

/**
 * Generate a unique file path for storage
 * @param userId The user ID
 * @param fileName The original file name
 * @param folder The folder to store the file in
 * @returns A unique storage path
 */
export const generateFilePath = (userId: string, fileName: string, folder: string = 'uploads'): string => {
  const extension = fileName.split('.').pop();
  const timestamp = Date.now();
  return `${folder}/${userId}/${timestamp}.${extension}`;
};

/**
 * Upload a profile image
 * @param userId The user ID
 * @param file The image file
 * @returns Promise with the download URL
 */
export const uploadProfileImage = async (userId: string, file: File): Promise<string> => {
  const path = `profiles/${userId}/${Date.now()}.${file.name.split('.').pop()}`;
  return uploadFile(file, path);
};

/**
 * Upload a swap attachment
 * @param swapId The swap ID
 * @param userId The user ID
 * @param file The file to upload
 * @returns Promise with the download URL
 */
export const uploadSwapAttachment = async (swapId: string, userId: string, file: File): Promise<string> => {
  const path = `swaps/${swapId}/attachments/${userId}/${Date.now()}.${file.name.split('.').pop()}`;
  return uploadFile(file, path);
};

/**
 * Upload a message attachment
 * @param conversationId The conversation ID
 * @param userId The user ID
 * @param file The file to upload
 * @returns Promise with the download URL
 */
export const uploadMessageAttachment = async (conversationId: string, userId: string, file: File): Promise<string> => {
  const path = `messages/${conversationId}/${userId}/${Date.now()}.${file.name.split('.').pop()}`;
  return uploadFile(file, path);
};
