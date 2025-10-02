import { 
  ref, 
  uploadBytes, 
  uploadBytesResumable, 
  getDownloadURL, 
  deleteObject,
  listAll 
} from 'firebase/storage';
import { storage } from '../../config/firebase';

// Upload file to Firebase Storage
export const uploadFile = async (file, path, onProgress = null) => {
  try {
    const storageRef = ref(storage, path);
    
    if (onProgress) {
      // Upload with progress tracking
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      return new Promise((resolve, reject) => {
        uploadTask.on(
          'state_changed',
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            onProgress(progress);
          },
          (error) => {
            reject({
              success: false,
              error: error.code,
              message: 'Upload failed'
            });
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve({
                success: true,
                url: downloadURL,
                path: path,
                message: 'File uploaded successfully!'
              });
            } catch (error) {
              reject({
                success: false,
                error: error.code,
                message: 'Failed to get download URL'
              });
            }
          }
        );
      });
    } else {
      // Simple upload without progress
      const snapshot = await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      return {
        success: true,
        url: downloadURL,
        path: path,
        message: 'File uploaded successfully!'
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.code,
      message: 'Upload failed'
    };
  }
};

// Upload profile picture
export const uploadProfilePicture = async (file, userId, onProgress = null) => {
  const path = `profile-pictures/${userId}/${Date.now()}_${file.name}`;
  return uploadFile(file, path, onProgress);
};

// Upload post image
export const uploadPostImage = async (file, userId, onProgress = null) => {
  const path = `posts/${userId}/${Date.now()}_${file.name}`;
  return uploadFile(file, path, onProgress);
};

// Upload story media
export const uploadStoryMedia = async (file, userId, onProgress = null) => {
  const path = `stories/${userId}/${Date.now()}_${file.name}`;
  return uploadFile(file, path, onProgress);
};

// Delete file from Firebase Storage
export const deleteFile = async (path) => {
  try {
    const storageRef = ref(storage, path);
    await deleteObject(storageRef);
    
    return {
      success: true,
      message: 'File deleted successfully!'
    };
  } catch (error) {
    return {
      success: false,
      error: error.code,
      message: 'Failed to delete file'
    };
  }
};

// Get all files in a directory
export const listFiles = async (path) => {
  try {
    const storageRef = ref(storage, path);
    const result = await listAll(storageRef);
    
    const files = await Promise.all(
      result.items.map(async (itemRef) => {
        const url = await getDownloadURL(itemRef);
        return {
          name: itemRef.name,
          path: itemRef.fullPath,
          url: url
        };
      })
    );
    
    return {
      success: true,
      files: files
    };
  } catch (error) {
    return {
      success: false,
      error: error.code,
      message: 'Failed to list files'
    };
  }
};
