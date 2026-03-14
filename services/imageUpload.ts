import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

export const uploadImage = async (file: File): Promise<string> => {
  const timestamp = Date.now();
  // Sanitize file name to avoid issues with special characters
  const safeFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
  const fileName = `uploads/${timestamp}_${safeFileName}`;
  const storageRef = ref(storage, fileName);

  try {
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    return downloadURL;
  } catch (error) {
    console.error('Firebase Storage Upload Error:', error);
    throw new Error('Failed to upload image. Please try again.');
  }
};
