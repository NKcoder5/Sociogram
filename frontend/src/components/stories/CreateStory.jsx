import React, { useState, useRef } from 'react';
import { XMarkIcon, PhotoIcon, VideoCameraIcon } from '@heroicons/react/24/outline';

const CreateStory = ({ onClose, onStoryCreated }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleCreateStory = async () => {
    if (!selectedFile) return;

    setIsUploading(true);
    try {
      // In a real app, upload to server
      const newStory = {
        id: Date.now(),
        image: preview,
        caption,
        timestamp: new Date(),
        viewed: false
      };

      onStoryCreated(newStory);
      onClose();
    } catch (error) {
      console.error('Error creating story:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Create Story</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4">
          {!selectedFile ? (
            <div className="text-center py-12">
              <div className="mb-4">
                <PhotoIcon className="w-16 h-16 mx-auto text-gray-400" />
              </div>
              <p className="text-gray-600 mb-4">Select a photo or video for your story</p>
              <div className="space-y-2">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full bg-instagram-blue text-white py-2 px-4 rounded-lg hover:bg-blue-700"
                >
                  Choose from Gallery
                </button>
                <button className="w-full border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50">
                  Take Photo
                </button>
              </div>
            </div>
          ) : (
            <div>
              {/* Preview */}
              <div className="mb-4">
                <img
                  src={preview}
                  alt="Story preview"
                  className="w-full h-64 object-cover rounded-lg"
                />
              </div>

              {/* Caption */}
              <div className="mb-4">
                <textarea
                  placeholder="Add a caption..."
                  value={caption}
                  onChange={(e) => setCaption(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                  rows="3"
                />
              </div>

              {/* Actions */}
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setPreview(null);
                    setCaption('');
                  }}
                  className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  onClick={handleCreateStory}
                  disabled={isUploading}
                  className="flex-1 bg-instagram-blue text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {isUploading ? 'Sharing...' : 'Share Story'}
                </button>
              </div>
            </div>
          )}
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default CreateStory;
