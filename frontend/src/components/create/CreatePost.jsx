import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PhotoIcon, XMarkIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';
import { postAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const CreatePost = () => {
  const { user } = useAuth();
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    console.log('📝 Form submission started');
    console.log('📷 Selected file:', selectedFile);
    console.log('📝 Caption:', caption);
    
    if (!selectedFile) {
      console.log('❌ No file selected');
      setError('Please select an image to upload');
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);
      formData.append('caption', caption || '');
      
      console.log('📦 FormData created with:');
      console.log('  - Image file:', selectedFile.name, selectedFile.size, 'bytes');
      console.log('  - Caption:', caption || '(empty)');

      const response = await postAPI.addPost(formData);
      
      if (response.data.success) {
        // Navigate to feed after successful post creation
        navigate('/feed');
      } else {
        setError('Failed to create post. Please try again.');
      }
    } catch (error) {
      console.error('Error creating post:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      
      let errorMessage = 'Failed to create post. Please try again.';
      
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid request. Please check your image and caption.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Please log in to create a post.';
      } else if (error.response?.status === 413) {
        errorMessage = 'Image file is too large. Please choose a smaller image.';
      } else if (error.message.includes('Network Error')) {
        errorMessage = 'Network error. Please check your connection.';
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const clearSelection = () => {
    setSelectedFile(null);
    setPreview(null);
    setCaption('');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/feed')}
                className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeftIcon className="w-5 h-5" />
              </button>
              <h1 className="text-2xl font-bold text-gray-900">Create New Post</h1>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white font-semibold text-sm">
                  {user?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-sm font-medium text-gray-700">{user?.username}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto py-8 px-4">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200">
          {error && (
            <div className="p-4 bg-red-50 border-b border-red-200">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          {!preview ? (
            <div className="p-12">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full flex items-center justify-center">
                  <PhotoIcon className="h-12 w-12 text-purple-500" />
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">Share Your Moment</h3>
                <p className="text-gray-600 mb-6">Upload a photo to share with your followers</p>
                <label className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all duration-200 cursor-pointer transform hover:scale-105">
                  <PhotoIcon className="w-5 h-5 mr-2" />
                  Choose Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="relative">
                <img 
                  src={preview} 
                  alt="Preview" 
                  className="w-full aspect-square object-cover rounded-t-2xl"
                />
                <button
                  type="button"
                  onClick={clearSelection}
                  className="absolute top-4 right-4 bg-black bg-opacity-50 text-white rounded-full p-2 hover:bg-opacity-70 transition-all"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="flex items-start space-x-4 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-semibold text-sm">
                      {user?.username?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{user?.username}</p>
                    <textarea
                      placeholder="Write a caption..."
                      value={caption}
                      onChange={(e) => setCaption(e.target.value)}
                      className="w-full mt-2 border-none outline-none resize-none text-gray-700 placeholder-gray-500"
                      rows="4"
                    />
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={clearSelection}
                    className="px-6 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-8 py-2 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-xl hover:from-purple-600 hover:to-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {loading && (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    )}
                    <span>{loading ? 'Sharing...' : 'Share Post'}</span>
                  </button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreatePost;
