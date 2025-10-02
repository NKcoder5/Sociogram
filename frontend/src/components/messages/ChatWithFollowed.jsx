import React, { useState, useEffect } from 'react';
import { PaperAirplaneIcon, MagnifyingGlassIcon, ChatBubbleLeftIcon, UserPlusIcon } from '@heroicons/react/24/outline';
import { authAPI, messageAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useFollow } from '../../context/FollowContext';
import { useNavigate } from 'react-router-dom';

const ChatWithFollowed = () => {
  const { user } = useAuth();
  const { followingUsers } = useFollow();
  const navigate = useNavigate();
  const [followedUsers, setFollowedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadFollowedUsers();
    }
  }, [user]);

  const loadFollowedUsers = async () => {
    try {
      const response = await authAPI.getProfile();
      const userProfile = response.data.user;
      
      if (userProfile.following && userProfile.following.length > 0) {
        setFollowedUsers(userProfile.following);
      } else {
        // Fallback to suggested users if no following
        const suggestedResponse = await authAPI.getSuggestedUsers();
        setFollowedUsers(suggestedResponse.data.users || []);
      }
    } catch (error) {
      console.error('Error loading followed users:', error);
      setFollowedUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = followedUsers.filter(followedUser =>
    followedUser.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const startChat = async (selectedUser) => {
    try {
      // Send an initial message to create conversation
      await messageAPI.sendMessage(selectedUser._id, { message: `Hi ${selectedUser.username}! 👋` });
      
      // Navigate to messages page
      navigate('/messages');
    } catch (error) {
      console.error('Error starting chat:', error);
      alert('Failed to start chat. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-xl font-semibold flex items-center space-x-2">
          <ChatBubbleLeftIcon className="w-6 h-6 text-blue-500" />
          <span>Chat with Friends</span>
        </h2>
        <p className="text-sm text-gray-600 mt-1">Start a conversation with people you follow</p>
      </div>

      {/* Search */}
      <div className="p-4 border-b">
        <div className="relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search users..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Users List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <img 
              src="/logo.png" 
              alt="Sociogram Logo" 
              className="w-16 h-12 mx-auto mb-3 opacity-60 rounded-lg object-contain border border-violet-200"
            />
            <p className="font-medium">No users found</p>
            <p className="text-sm">Follow some users to start chatting with them!</p>
          </div>
        ) : (
          <div className="divide-y">
            {filteredUsers.map((followedUser) => (
              <div
                key={followedUser._id}
                className="p-4 hover:bg-gray-50 transition-colors cursor-pointer"
                onClick={() => startChat(followedUser)}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                    {followedUser.profilePicture ? (
                      <img
                        src={followedUser.profilePicture}
                        alt={followedUser.username}
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white font-semibold text-lg">
                        {followedUser.username?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 truncate">
                      {followedUser.username}
                    </p>
                    <p className="text-sm text-gray-500 truncate">
                      {followedUser.bio || 'No bio available'}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <PaperAirplaneIcon className="w-5 h-5 text-blue-500" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t bg-gray-50 rounded-b-lg">
        <p className="text-xs text-gray-500 text-center">
          Click on any user to start a conversation
        </p>
      </div>
    </div>
  );
};

export default ChatWithFollowed;
