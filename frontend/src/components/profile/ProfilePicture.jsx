import React, { useState, useRef } from 'react';
import { CameraIcon, UserIcon } from '@heroicons/react/24/outline';
import { authAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const ProfilePicture = ({ user, size = 'large', editable = false, onUpdate }) => {
  const { user: currentUser, updateUser } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const sizeClasses = {
    small: 'w-8 h-8',
    medium: 'w-12 h-12',
    large: 'w-20 h-20',
    xlarge: 'w-32 h-32'
  };

  const iconSizes = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8',
    xlarge: 'w-12 h-12'
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleUpload = async (file) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('profilePicture', file);

      const response = await authAPI.uploadProfilePicture(formData);
      
      if (response.data.success) {
        // Update the user context with new profile picture
        if (updateUser) {
          updateUser(response.data.user);
        }
        
        // Call onUpdate callback if provided
        if (onUpdate) {
          onUpdate(response.data.user);
        }

        console.log('Profile picture updated successfully');
      }
    } catch (error) {
      console.error('Error uploading profile picture:', error);
      setError(error.response?.data?.message || 'Failed to upload profile picture');
    } finally {
      setUploading(false);
    }
  };

  const handleClick = () => {
    if (editable && !uploading) {
      fileInputRef.current?.click();
    }
  };

  const displayUser = user || currentUser;
  const isEditable = editable && currentUser?.id === displayUser?.id;

  return (
    <div className="relative inline-block">
      <div
        className={`${sizeClasses[size]} rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center shadow-lg ${
          isEditable ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''
        } ${uploading ? 'opacity-50' : ''}`}
        onClick={handleClick}
      >
        {displayUser?.profilePicture ? (
          <img
            src={displayUser.profilePicture}
            alt={`${displayUser.username}'s profile`}
            className="w-full h-full object-cover"
          />
        ) : (
          <UserIcon className={`${iconSizes[size]} text-white`} />
        )}
        
        {/* Upload overlay */}
        {isEditable && (
          <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
            <CameraIcon className="w-6 h-6 text-white opacity-0 hover:opacity-100 transition-opacity" />
          </div>
        )}
        
        {/* Loading overlay */}
        {uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
          </div>
        )}
      </div>

      {/* Camera icon for editable profiles */}
      {isEditable && !uploading && (
        <button
          onClick={handleClick}
          className="absolute -bottom-1 -right-1 bg-purple-500 hover:bg-purple-600 text-white rounded-full p-2 shadow-lg transition-colors"
        >
          <CameraIcon className="w-4 h-4" />
        </button>
      )}

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Error message */}
      {error && (
        <div className="absolute top-full left-0 mt-2 bg-red-100 border border-red-400 text-red-700 px-3 py-2 rounded text-sm whitespace-nowrap z-10">
          {error}
        </div>
      )}
    </div>
  );
};

export default ProfilePicture;
