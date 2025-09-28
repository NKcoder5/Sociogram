import React, { useState, useRef, useEffect } from 'react';
import { 
  FaceSmileIcon,
  HeartIcon,
  HandThumbUpIcon,
  XMarkIcon,
  PlusIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolid, HandThumbUpIcon as ThumbsUpSolid } from '@heroicons/react/24/solid';

const MessageReactions = ({ 
  messageId, 
  reactions = {}, 
  onAddReaction, 
  onRemoveReaction, 
  currentUserId 
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showReactionDetails, setShowReactionDetails] = useState(false);
  const pickerRef = useRef(null);

  // Popular emoji categories
  const emojiCategories = {
    'Smileys & People': [
      '😀', '😃', '😄', '😁', '😆', '😅', '🤣', '😂', '🙂', '🙃',
      '😉', '😊', '😇', '🥰', '😍', '🤩', '😘', '😗', '😚', '😙',
      '😋', '😛', '😜', '🤪', '😝', '🤑', '🤗', '🤭', '🤫', '🤔',
      '🤐', '🤨', '😐', '😑', '😶', '😏', '😒', '🙄', '😬', '🤥',
      '😔', '😪', '🤤', '😴', '😷', '🤒', '🤕', '🤢', '🤮', '🤧',
      '🥵', '🥶', '🥴', '😵', '🤯', '🤠', '🥳', '😎', '🤓', '🧐'
    ],
    'Hearts & Love': [
      '❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔',
      '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '💟', '♥️'
    ],
    'Gestures': [
      '👍', '👎', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙',
      '👈', '👉', '👆', '🖕', '👇', '☝️', '👋', '🤚', '🖐️', '✋',
      '🖖', '👏', '🙌', '🤲', '🤝', '🙏', '✍️', '💪', '🦾', '🦿'
    ],
    'Objects & Symbols': [
      '🔥', '⭐', '🌟', '✨', '⚡', '💥', '💯', '💢', '💨', '💫',
      '🎉', '🎊', '🎈', '🎁', '🏆', '🥇', '🥈', '🥉', '🏅', '🎖️'
    ]
  };

  // Quick reactions (most commonly used)
  const quickReactions = ['❤️', '👍', '😂', '😮', '😢', '😡', '🔥', '👎'];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };

    const handleEscKey = (event) => {
      if (event.key === 'Escape') {
        setShowEmojiPicker(false);
        setShowReactionDetails(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscKey);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscKey);
    };
  }, []);

  const handleReactionClick = (emoji) => {
    const userReactions = reactions[emoji] || [];
    const hasReacted = userReactions.includes(currentUserId);

    if (hasReacted) {
      onRemoveReaction(messageId, emoji);
    } else {
      onAddReaction(messageId, emoji);
    }
  };

  const getReactionCount = (emoji) => {
    return reactions[emoji]?.length || 0;
  };

  const hasUserReacted = (emoji) => {
    return reactions[emoji]?.includes(currentUserId) || false;
  };

  const getTotalReactions = () => {
    return Object.values(reactions).reduce((total, users) => total + users.length, 0);
  };

  const getTopReactions = () => {
    return Object.entries(reactions)
      .filter(([_, users]) => users.length > 0)
      .sort(([_, a], [__, b]) => b.length - a.length)
      .slice(0, 3);
  };

  const EmojiPicker = () => (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-25 z-[9998]"
        onClick={() => setShowEmojiPicker(false)}
      />
      {/* Picker */}
      <div 
        ref={pickerRef}
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-80 max-h-96 overflow-y-auto z-[9999]"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-gray-900">Add Reaction</h3>
          <button
            onClick={() => setShowEmojiPicker(false)}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Reactions */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Reactions</h4>
          <div className="flex flex-wrap gap-2">
            {quickReactions.map(emoji => (
              <button
                key={emoji}
                onClick={() => {
                  handleReactionClick(emoji);
                  setShowEmojiPicker(false);
                }}
                className={`text-2xl p-2 rounded-lg transition-all duration-200 hover:scale-110 ${
                  hasUserReacted(emoji) 
                    ? 'bg-blue-100 ring-2 ring-blue-500' 
                    : 'hover:bg-gray-100'
                }`}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        {/* Emoji Categories */}
        {Object.entries(emojiCategories).map(([category, emojis]) => (
          <div key={category} className="mb-4">
            <h4 className="text-sm font-medium text-gray-700 mb-2">{category}</h4>
            <div className="grid grid-cols-8 gap-1">
              {emojis.map(emoji => (
                <button
                  key={emoji}
                  onClick={() => {
                    handleReactionClick(emoji);
                    setShowEmojiPicker(false);
                  }}
                  className={`text-lg p-1 rounded transition-all duration-200 hover:scale-110 ${
                    hasUserReacted(emoji) 
                      ? 'bg-blue-100 ring-1 ring-blue-500' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );

  const ReactionDetails = () => {
    const allReactions = Object.entries(reactions).filter(([_, users]) => users.length > 0);
    
    return (
      <>
        {/* Backdrop */}
        <div 
          className="fixed inset-0 bg-black bg-opacity-25 z-[9998]"
          onClick={() => setShowReactionDetails(false)}
        />
        {/* Details */}
        <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-64 z-[9999]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900">Reactions</h3>
          <button
            onClick={() => setShowReactionDetails(false)}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
        
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {allReactions.map(([emoji, users]) => (
              <div key={emoji} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{emoji}</span>
                  <span className="text-sm text-gray-600">{users.length}</span>
                </div>
                <div className="text-xs text-gray-500">
                  {users.length === 1 ? '1 person' : `${users.length} people`}
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  };

  if (getTotalReactions() === 0 && !showEmojiPicker) {
    return (
      <div className="relative">
        <button
          onClick={() => setShowEmojiPicker(true)}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-gray-600"
        >
          <FaceSmileIcon className="w-4 h-4" />
        </button>
        {showEmojiPicker && <EmojiPicker />}
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Reaction Display */}
      <div className="flex items-center space-x-1 mt-2">
        {/* Top reactions */}
        {getTopReactions().map(([emoji, users]) => (
          <button
            key={emoji}
            onClick={() => handleReactionClick(emoji)}
            className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs transition-all duration-200 ${
              hasUserReacted(emoji)
                ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-300'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <span>{emoji}</span>
            <span className="font-medium">{users.length}</span>
          </button>
        ))}

        {/* Show all reactions if more than 3 */}
        {Object.keys(reactions).length > 3 && (
          <button
            onClick={() => setShowReactionDetails(true)}
            className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs hover:bg-gray-200 transition-colors"
          >
            +{Object.keys(reactions).length - 3}
          </button>
        )}

        {/* Add reaction button */}
        <button
          onClick={() => setShowEmojiPicker(true)}
          className="p-1 text-gray-400 hover:text-gray-600 transition-colors opacity-0 group-hover:opacity-100"
        >
          <PlusIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Modals */}
      {showEmojiPicker && <EmojiPicker />}
      {showReactionDetails && <ReactionDetails />}
    </div>
  );
};

// Quick Reaction Bar Component (appears on hover)
export const QuickReactionBar = ({ 
  messageId, 
  onAddReaction, 
  isVisible = false,
  position = 'top' // 'top' or 'bottom'
}) => {
  const quickReactions = ['❤️', '👍', '😂', '😮', '😢', '😡'];

  if (!isVisible) return null;

  return (
    <div className={`absolute ${position === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'} left-1/2 transform -translate-x-1/2 z-10`}>
      <div className="flex items-center space-x-1 bg-white rounded-full shadow-lg border border-gray-200 p-2">
        {quickReactions.map(emoji => (
          <button
            key={emoji}
            onClick={() => onAddReaction(messageId, emoji)}
            className="text-lg p-2 rounded-full hover:bg-gray-100 transition-all duration-200 hover:scale-110"
          >
            {emoji}
          </button>
        ))}
        <div className="w-px h-6 bg-gray-200 mx-1" />
        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
          <FaceSmileIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// Reaction Animation Component
export const ReactionAnimation = ({ emoji, onComplete }) => {
  useEffect(() => {
    const timer = setTimeout(onComplete, 1000);
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
      <div className="text-4xl animate-bounce">
        {emoji}
      </div>
    </div>
  );
};

export default MessageReactions;
