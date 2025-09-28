import React, { useState, useEffect } from 'react';
import { XMarkIcon, PaperAirplaneIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { authAPI, messageAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const ShareModal = ({ post, isOpen, onClose }) => {
  const { user } = useAuth();
  const [followedUsers, setFollowedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchFollowedUsers();
    }
  }, [isOpen]);

  const fetchFollowedUsers = async () => {
    try {
      const response = await authAPI.getProfile();
      const currentUser = response.data.user;
      
      // Get users that current user is following
      if (currentUser.following && currentUser.following.length > 0) {
        setFollowedUsers(currentUser.following);
      } else {
        // If no following data, get suggested users as fallback
        const suggestedResponse = await authAPI.getSuggestedUsers();
        setFollowedUsers(suggestedResponse.data.users || []);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const filteredUsers = followedUsers.filter(user =>
    user.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUserSelect = (selectedUser) => {
    setSelectedUsers(prev => {
      const isSelected = prev.some(u => u._id === selectedUser._id);
      if (isSelected) {
        return prev.filter(u => u._id !== selectedUser._id);
      } else {
        return [...prev, selectedUser];
      }
    });
  };

  const handleShare = async () => {
    if (selectedUsers.length === 0) return;

    setLoading(true);
    try {
      const shareMessage = message || `Check out this ${post.video ? 'reel' : 'post'}: ${post.caption}`;
      
      // Send message to each selected user
      for (const selectedUser of selectedUsers) {
        await messageAPI.sendMessage(selectedUser._id, {
          message: shareMessage,
          sharedPost: {
            id: post.id,
            type: post.video ? 'reel' : 'post',
            caption: post.caption,
            image: post.image || post.video,
            author: post.user
          }
        });
      }

      // Show success and close modal
      alert(`Shared with ${selectedUsers.length} user(s)!`);
      onClose();
      setSelectedUsers([]);
      setMessage('');
      setSearchTerm('');
    } catch (error) {
      console.error('Error sharing:', error);
      alert('Failed to share. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    const link = `${window.location.origin}/post/${post.id}`;
    navigator.clipboard.writeText(link).then(() => {
      alert('Link copied to clipboard!');
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-md w-full mx-4 max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="text-lg font-semibold">Share</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Share Options */}
        <div className="p-4 border-b">
          <button
            onClick={copyLink}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Copy Link
          </button>
        </div>

        {/* Search Users */}
        <div className="p-4 border-b">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search users to share with..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>
        </div>

        {/* Users List */}
        <div className="flex-1 overflow-y-auto p-4">
          <h4 className="font-semibold mb-3 text-gray-700">Send to:</h4>
          {filteredUsers.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              <p>No users found.</p>
              <p className="text-sm">Follow some users to share content with them!</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredUsers.map((followedUser) => (
                <div
                  key={followedUser._id}
                  onClick={() => handleUserSelect(followedUser)}
                  className={`flex items-center space-x-3 p-2 rounded-lg cursor-pointer transition-colors ${
                    selectedUsers.some(u => u._id === followedUser._id)
                      ? 'bg-blue-100 border border-blue-300'
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                    {followedUser.profilePicture ? (
                      <img
                        src={followedUser.profilePicture}
                        alt={followedUser.username}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-semibold">
                        {followedUser.username?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold">{followedUser.username}</p>
                    <p className="text-sm text-gray-500">{followedUser.bio || 'No bio'}</p>
                  </div>
                  <div className={`w-5 h-5 rounded-full border-2 ${
                    selectedUsers.some(u => u._id === followedUser._id)
                      ? 'bg-blue-500 border-blue-500'
                      : 'border-gray-300'
                  }`}>
                    {selectedUsers.some(u => u._id === followedUser._id) && (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Message Input and Send */}
        {selectedUsers.length > 0 && (
          <div className="border-t p-4">
            <div className="mb-3">
              <p className="text-sm text-gray-600 mb-2">
                Sharing with: {selectedUsers.map(u => u.username).join(', ')}
              </p>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Add a message (optional)..."
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 resize-none"
                rows="2"
              />
            </div>
            <button
              onClick={handleShare}
              disabled={loading || selectedUsers.length === 0}
              className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 transition-colors flex items-center justify-center space-x-2"
            >
              <PaperAirplaneIcon className="w-5 h-5" />
              <span>{loading ? 'Sharing...' : `Share with ${selectedUsers.length} user(s)`}</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShareModal;
