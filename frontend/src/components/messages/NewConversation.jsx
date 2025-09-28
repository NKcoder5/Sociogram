import React, { useState, useEffect } from 'react';
import { X, Search, MessageCircle, Users, UserCheck } from 'lucide-react';
import { authAPI, messageAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const NewConversation = ({ isOpen, onClose, onConversationCreated }) => {
  const { user: currentUser } = useAuth();
  const [followedUsers, setFollowedUsers] = useState([]);
  const [mutualFollows, setMutualFollows] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [startingConversation, setStartingConversation] = useState(new Set());

  useEffect(() => {
    if (isOpen && currentUser) {
      fetchFollowedUsers();
    }
  }, [isOpen, currentUser]);

  const fetchFollowedUsers = async () => {
    try {
      setLoading(true);
      
      // Get users that current user is following
      const followingResponse = await authAPI.getFollowing(currentUser.id);
      const following = followingResponse.data.following || [];
      
      // Get users that follow current user
      const followersResponse = await authAPI.getFollowers(currentUser.id);
      const followers = followersResponse.data.followers || [];
      
      // Find mutual follows (users who follow each other)
      const followerIds = new Set(followers.map(f => f.id));
      const mutual = following.filter(user => followerIds.has(user.id));
      
      setFollowedUsers(following);
      setMutualFollows(mutual);
    } catch (error) {
      console.error('Error fetching followed users:', error);
    } finally {
      setLoading(false);
    }
  };

  const startConversation = async (user) => {
    try {
      setStartingConversation(prev => new Set([...prev, user.id]));
      
      // Send a message to create conversation
      const response = await messageAPI.sendMessage(user.id, 'Hi! 👋');
      
      if (response.data.success) {
        onConversationCreated(user);
        onClose();
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
    } finally {
      setStartingConversation(prev => {
        const newSet = new Set(prev);
        newSet.delete(user.id);
        return newSet;
      });
    }
  };

  const filteredUsers = followedUsers.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredMutual = mutualFollows.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">New Message</h3>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
          
          {/* Search */}
          <div className="mt-4 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search people..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:bg-white border border-transparent focus:border-purple-200"
            />
          </div>
        </div>

        {/* Content */}
        <div className="max-h-96 overflow-y-auto">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading...</p>
            </div>
          ) : (
            <>
              {/* Mutual Follows Section */}
              {filteredMutual.length > 0 && (
                <div className="p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <UserCheck className="w-4 h-4 text-green-600" />
                    <h4 className="font-medium text-gray-900">Mutual Connections</h4>
                    <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded-full">
                      Can message freely
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {filteredMutual.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-400 rounded-full flex items-center justify-center">
                            {user.profilePicture ? (
                              <img
                                src={user.profilePicture}
                                alt={user.username}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-white font-semibold text-sm">
                                {user.username?.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.username}</p>
                            <p className="text-xs text-gray-500">Follows you back</p>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => startConversation(user)}
                          disabled={startingConversation.has(user.id)}
                          className="flex items-center space-x-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-3 py-1.5 rounded-lg font-medium hover:from-purple-600 hover:to-blue-600 transition-all duration-200 text-sm disabled:opacity-50"
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span>{startingConversation.has(user.id) ? 'Starting...' : 'Message'}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Following Section */}
              {filteredUsers.length > 0 && (
                <div className="p-4 border-t border-gray-100">
                  <div className="flex items-center space-x-2 mb-3">
                    <Users className="w-4 h-4 text-blue-600" />
                    <h4 className="font-medium text-gray-900">Following</h4>
                  </div>
                  
                  <div className="space-y-2">
                    {filteredUsers
                      .filter(user => !mutualFollows.some(m => m.id === user.id))
                      .map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                            {user.profilePicture ? (
                              <img
                                src={user.profilePicture}
                                alt={user.username}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-white font-semibold text-sm">
                                {user.username?.charAt(0).toUpperCase()}
                              </span>
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{user.username}</p>
                            <p className="text-xs text-gray-500">You follow them</p>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => startConversation(user)}
                          disabled={startingConversation.has(user.id)}
                          className="flex items-center space-x-1 bg-gray-100 text-gray-700 px-3 py-1.5 rounded-lg font-medium hover:bg-gray-200 transition-all duration-200 text-sm disabled:opacity-50"
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span>{startingConversation.has(user.id) ? 'Starting...' : 'Message'}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Empty State */}
              {!loading && filteredUsers.length === 0 && (
                <div className="p-8 text-center">
                  <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h4 className="font-medium text-gray-900 mb-2">No one to message</h4>
                  <p className="text-sm text-gray-600">
                    {searchTerm 
                      ? "No users found matching your search" 
                      : "Start following people to message them"
                    }
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NewConversation;
