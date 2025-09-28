import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';

const PostReactions = ({ postId, initialReactions = [], onReactionUpdate }) => {
  const { user } = useAuth();
  const [reactions, setReactions] = useState({});
  const [userReaction, setUserReaction] = useState(null);
  const [showReactions, setShowReactions] = useState(false);
  const [isAnimating, setIsAnimating] = useState(null);

  const reactionEmojis = [
    { type: 'like', emoji: '❤️', label: 'Love' },
    { type: 'laugh', emoji: '😂', label: 'Laugh' },
    { type: 'wow', emoji: '😮', label: 'Wow' },
    { type: 'sad', emoji: '😢', label: 'Sad' },
    { type: 'thumbs', emoji: '👍', label: 'Like' }
  ];

  useEffect(() => {
    if (initialReactions && initialReactions.length > 0) {
      const reactionCounts = {};
      let currentUserReaction = null;

      initialReactions.forEach(reaction => {
        reactionCounts[reaction.type] = (reactionCounts[reaction.type] || 0) + 1;
        // Handle both populated objects and plain IDs
        const reactionUserId = reaction.userId?._id?.toString() || reaction.userId?.toString() || reaction.userId;
        if (reactionUserId === user?.id) {
          currentUserReaction = reaction.type;
        }
      });

      setReactions(reactionCounts);
      setUserReaction(currentUserReaction);
    }
  }, [initialReactions, user?.id]);

  const handleReaction = async (reactionType) => {
    if (!user) return;

    try {
      setIsAnimating(reactionType);
      
      const response = await axios.post(
        `${process.env.NODE_ENV === 'production' ? '/api/v1' : `${window.location.protocol}//${window.location.hostname}:8000/api/v1`}/post/react/${postId}`,
        { reactionType },
        { withCredentials: true }
      );

      if (response.data.success) {
        const { reactions: updatedReactions, userReaction: newUserReaction } = response.data;
        
        setReactions(updatedReactions);
        setUserReaction(newUserReaction);
        setShowReactions(false);
        
        // Call parent callback if provided
        if (onReactionUpdate) {
          onReactionUpdate(updatedReactions, newUserReaction);
        }
      }
    } catch (error) {
      console.error('Error handling reaction:', error);
    } finally {
      setTimeout(() => setIsAnimating(null), 300);
    }
  };

  const getTotalReactions = () => {
    return Object.values(reactions).reduce((total, count) => total + count, 0);
  };

  const getTopReactions = () => {
    return Object.entries(reactions)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([type]) => reactionEmojis.find(r => r.type === type))
      .filter(Boolean);
  };

  const currentReactionEmoji = userReaction 
    ? reactionEmojis.find(r => r.type === userReaction)?.emoji 
    : '👍';

  return (
    <div className="flex items-center space-x-3">
      {/* Reaction Button */}
      <div className="relative">
        <button
          onClick={() => userReaction ? handleReaction(userReaction) : setShowReactions(!showReactions)}
          onMouseEnter={() => setShowReactions(true)}
          onMouseLeave={() => setTimeout(() => setShowReactions(false), 500)}
          className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 ${
            userReaction 
              ? 'bg-red-50 text-red-600 hover:bg-red-100' 
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          } ${isAnimating === userReaction ? 'transform scale-110' : ''}`}
        >
          <span className="text-lg">{currentReactionEmoji}</span>
          <span className="text-sm font-medium">
            {userReaction ? 'Reacted' : 'React'}
          </span>
        </button>

        {/* Reaction Picker */}
        {showReactions && (
          <div 
            className="absolute bottom-full left-0 mb-2 bg-white rounded-full shadow-lg border border-gray-200 px-3 py-2 z-10 flex space-x-2"
            onMouseEnter={() => setShowReactions(true)}
            onMouseLeave={() => setShowReactions(false)}
          >
            {reactionEmojis.map((reaction) => (
              <button
                key={reaction.type}
                onClick={() => handleReaction(reaction.type)}
                className={`text-2xl hover:transform hover:scale-125 transition-all duration-200 p-1 rounded-full ${
                  isAnimating === reaction.type ? 'animate-bounce' : ''
                } ${userReaction === reaction.type ? 'bg-red-100' : 'hover:bg-gray-100'}`}
                title={reaction.label}
              >
                {reaction.emoji}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Reaction Display */}
      {getTotalReactions() > 0 && (
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <div className="flex -space-x-1">
            {getTopReactions().map((reaction, index) => (
              <span
                key={reaction.type}
                className="w-6 h-6 bg-white rounded-full border border-gray-200 flex items-center justify-center text-xs"
                style={{ zIndex: 10 - index }}
              >
                {reaction.emoji}
              </span>
            ))}
          </div>
          
          <span className="font-medium">
            {getTotalReactions() === 1 
              ? '1 reaction'
              : `${getTotalReactions()} reactions`
            }
          </span>

          {/* Detailed breakdown on hover */}
          <div className="relative group">
            <button className="text-gray-400 hover:text-gray-600 text-xs">
              View all
            </button>
            <div className="absolute top-full left-0 mt-1 bg-white rounded-lg shadow-lg border border-gray-200 p-3 z-20 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 min-w-[200px]">
              <div className="space-y-2">
                {Object.entries(reactions)
                  .sort(([, a], [, b]) => b - a)
                  .map(([type, count]) => {
                    const reaction = reactionEmojis.find(r => r.type === type);
                    return (
                      <div key={type} className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className="text-lg">{reaction?.emoji}</span>
                          <span className="text-sm text-gray-700">{reaction?.label}</span>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{count}</span>
                      </div>
                    );
                  })
                }
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PostReactions;