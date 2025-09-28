import React, { useState, useEffect } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import CreateStory from './CreateStory';

const Stories = () => {
  const [stories, setStories] = useState([]);
  const [selectedStory, setSelectedStory] = useState(null);
  const [showCreateStory, setShowCreateStory] = useState(false);

  useEffect(() => {
    // Mock stories data for demo
    setStories([
      {
        id: 1,
        user: { username: 'your_story', profilePicture: null },
        isOwn: true,
        stories: []
      },
      {
        id: 2,
        user: { username: 'john_doe', profilePicture: null },
        stories: [
          { id: 1, image: 'https://picsum.photos/400/600?random=1', timestamp: new Date(), viewed: false },
          { id: 2, image: 'https://picsum.photos/400/600?random=11', timestamp: new Date(), viewed: false }
        ]
      },
      {
        id: 3,
        user: { username: 'jane_smith', profilePicture: null },
        stories: [
          { id: 3, image: 'https://picsum.photos/400/600?random=2', timestamp: new Date(), viewed: false },
          { id: 4, image: 'https://picsum.photos/400/600?random=12', timestamp: new Date(), viewed: false },
          { id: 5, image: 'https://picsum.photos/400/600?random=22', timestamp: new Date(), viewed: false }
        ]
      },
      {
        id: 4,
        user: { username: 'alex_wilson', profilePicture: null },
        stories: [
          { id: 6, image: 'https://picsum.photos/400/600?random=3', timestamp: new Date(), viewed: false }
        ]
      },
      {
        id: 5,
        user: { username: 'sarah_jones', profilePicture: null },
        stories: [
          { id: 7, image: 'https://picsum.photos/400/600?random=4', timestamp: new Date(), viewed: false },
          { id: 8, image: 'https://picsum.photos/400/600?random=14', timestamp: new Date(), viewed: false }
        ]
      },
      {
        id: 6,
        user: { username: 'travel_enthusiast', profilePicture: null },
        stories: [
          { id: 9, image: 'https://picsum.photos/400/600?random=5', timestamp: new Date(), viewed: false },
          { id: 10, image: 'https://picsum.photos/400/600?random=15', timestamp: new Date(), viewed: false },
          { id: 11, image: 'https://picsum.photos/400/600?random=25', timestamp: new Date(), viewed: false }
        ]
      },
      {
        id: 7,
        user: { username: 'food_lover', profilePicture: null },
        stories: [
          { id: 12, image: 'https://picsum.photos/400/600?random=6', timestamp: new Date(), viewed: false }
        ]
      },
      {
        id: 8,
        user: { username: 'fitness_guru', profilePicture: null },
        stories: [
          { id: 13, image: 'https://picsum.photos/400/600?random=7', timestamp: new Date(), viewed: false },
          { id: 14, image: 'https://picsum.photos/400/600?random=17', timestamp: new Date(), viewed: false }
        ]
      }
    ]);
  }, []);

  const handleStoryCreated = (newStory) => {
    setStories(stories.map(story => 
      story.isOwn 
        ? { ...story, stories: [...story.stories, newStory] }
        : story
    ));
  };

  const StoryViewer = ({ story, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
      const timer = setTimeout(() => {
        // Mark current story as viewed
        story.stories[currentIndex].viewed = true;
        
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
              <span className="text-gray-300 text-xs">2h</span>
            </div>
            <button onClick={onClose} className="text-white text-xl">×</button>
          </div>

          {/* Story content */}
          <img 
            src={story.stories[currentIndex].image} 
            alt="Story" 
            className="w-full h-full object-cover"
          />

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

  return (
    <>
      <div className="flex space-x-4 p-4 bg-white border-b border-gray-200 overflow-x-auto">
        {stories.map((story) => (
          <div key={story.id} className="flex-shrink-0">
            <div 
              className={`relative cursor-pointer ${
                story.isOwn ? 'w-16 h-16' : 'w-16 h-16'
              }`}
              onClick={() => {
                if (story.isOwn) {
                  setShowCreateStory(true);
                } else if (story.stories.length > 0) {
                  setSelectedStory(story);
                }
              }}
            >
              {story.isOwn ? (
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center border-2 border-dashed border-gray-400 hover:bg-gray-300 transition-colors">
                  <PlusIcon className="w-6 h-6 text-gray-600" />
                </div>
              ) : (
                <div className={`w-16 h-16 rounded-full p-0.5 ${
                  story.stories.length > 0 ? 'bg-gradient-to-r from-purple-500 to-pink-500' : 'bg-gray-300'
                }`}>
                  <div className="w-full h-full bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-gray-700">
                      {story.user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
              )}
            </div>
            <p className="text-xs text-center mt-1 text-gray-600 truncate w-16">
              {story.isOwn ? 'Your story' : story.user.username}
            </p>
          </div>
        ))}
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
