import React, { useState, useEffect } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import CreateStory from './CreateStory';
import { storyAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const Stories = () => {
  const [storyGroups, setStoryGroups] = useState([]);
  const [selectedStory, setSelectedStory] = useState(null);
  const [showCreateStory, setShowCreateStory] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await storyAPI.getAllStories();
      setStoryGroups(response.data.storyGroups || []);
    } catch (error) {
      console.error('Error fetching stories:', error);
      setError('Failed to load stories');
      setStoryGroups([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStoryCreated = (newStory) => {
    // Refresh stories after creating a new one
    fetchStories();
  };

  const markStoryAsViewed = async (storyId) => {
    try {
      await storyAPI.markAsViewed(storyId);
    } catch (error) {
      console.error('Error marking story as viewed:', error);
    }
  };

  const StoryViewer = ({ story, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
      const currentStory = story.stories[currentIndex];
      if (currentStory && !currentStory.isViewed) {
        markStoryAsViewed(currentStory.id);
      }
      
      const timer = setTimeout(() => {
        if (currentIndex < story.stories.length - 1) {
          setCurrentIndex(currentIndex + 1);
        } else {
          onClose();
        }
      }, 5000);

      return () => clearTimeout(timer);
    }, [currentIndex, story.stories.length, onClose]);

    if (!story.stories[currentIndex]) return null;

    return (
      <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
        <div className="relative w-full max-w-sm h-full bg-black">
          {/* Progress bars */}
          <div className="absolute top-4 left-4 right-4 flex space-x-1 z-10">
            {story.stories.map((_, index) => (
              <div key={index} className="flex-1 h-1 bg-gray-600 rounded">
                <div 
                  className={`h-full bg-white rounded transition-all duration-300 ${
                    index < currentIndex ? 'w-full' : index === currentIndex ? 'w-1/2' : 'w-0'
                  }`}
                />
              </div>
            ))}
          </div>

          {/* Header */}
          <div className="absolute top-8 left-4 right-4 flex items-center justify-between z-10 mt-4">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-semibold">
                  {story.user.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-white text-sm font-semibold">{story.user.username}</span>
              <span className="text-gray-300 text-xs">
                {new Date(story.stories[currentIndex].createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <button onClick={onClose} className="text-white text-xl">×</button>
          </div>

          {/* Story content */}
          {story.stories[currentIndex].mediaType === 'text' ? (
            <div className="w-full h-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center p-8">
              <p className="text-white text-2xl font-bold text-center">
                {story.stories[currentIndex].text}
              </p>
            </div>
          ) : (
            <img 
              src={story.stories[currentIndex].mediaUrl} 
              alt="Story" 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = '/placeholder-image.jpg';
              }}
            />
          )}

          {/* Navigation */}
          <div className="absolute inset-0 flex">
            <div 
              className="w-1/2 h-full cursor-pointer"
              onClick={() => currentIndex > 0 && setCurrentIndex(currentIndex - 1)}
            />
            <div 
              className="w-1/2 h-full cursor-pointer"
              onClick={() => {
                if (currentIndex < story.stories.length - 1) {
                  setCurrentIndex(currentIndex + 1);
                } else {
                  onClose();
                }
              }}
            />
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex space-x-4 p-4 bg-white border-b border-gray-200 overflow-x-auto">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex-shrink-0">
            <div className="w-16 h-16 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="w-12 h-3 bg-gray-200 rounded mt-1 mx-auto animate-pulse"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-white border-b border-gray-200 text-center">
        <p className="text-red-500 text-sm">{error}</p>
        <button 
          onClick={fetchStories}
          className="mt-2 px-3 py-1 bg-purple-500 text-white text-xs rounded hover:bg-purple-600"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <>
      <div className="flex space-x-4 p-4 bg-white border-b border-gray-200 overflow-x-auto">
        {/* Add Story Button (always first) */}
        <div className="flex-shrink-0">
          <div 
            className="relative cursor-pointer w-16 h-16"
            onClick={() => setShowCreateStory(true)}
          >
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center border-2 border-dashed border-gray-400 hover:bg-gray-300 transition-colors">
              <PlusIcon className="w-6 h-6 text-gray-600" />
            </div>
          </div>
          <p className="text-xs text-center mt-1 text-gray-600 truncate w-16">
            Your story
          </p>
        </div>
        
        {/* Story Groups */}
        {storyGroups.map((storyGroup) => (
          <div key={storyGroup.user.id} className="flex-shrink-0">
            <div 
              className="relative cursor-pointer w-16 h-16"
              onClick={() => {
                if (storyGroup.stories.length > 0) {
                  setSelectedStory(storyGroup);
                }
              }}
            >
              <div className={`w-16 h-16 rounded-full p-0.5 ${
                storyGroup.hasUnviewed 
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                  : 'bg-gray-300'
              }`}>
                <div className="w-full h-full bg-white rounded-full flex items-center justify-center">
                  {storyGroup.user.profilePicture ? (
                    <img 
                      src={storyGroup.user.profilePicture} 
                      alt={storyGroup.user.username}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-semibold text-gray-700">
                      {storyGroup.user.username.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
              </div>
            </div>
            <p className="text-xs text-center mt-1 text-gray-600 truncate w-16">
              {storyGroup.user.username}
            </p>
          </div>
        ))}
        
        {storyGroups.length === 0 && (
          <div className="flex-1 text-center py-4 text-gray-500">
            <p className="text-sm">No stories available</p>
          </div>
        )}
      </div>

      {selectedStory && (
        <StoryViewer 
          story={selectedStory} 
          onClose={() => setSelectedStory(null)} 
        />
      )}

      {showCreateStory && (
        <CreateStory
          onClose={() => setShowCreateStory(false)}
          onStoryCreated={handleStoryCreated}
        />
      )}
    </>
  );
};

export default Stories;
