import React, { useState, useEffect } from 'react';
import { authAPI } from '../../utils/api';
import { UserPlus, Users, TrendingUp, Star, Check, X } from 'lucide-react';
import { useFollow } from '../../context/FollowContext';

const SuggestedUsers = () => {
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const { toggleFollow, isFollowing, isProcessing } = useFollow();

  useEffect(() => {
    fetchSuggestedUsers();
  }, [isFollowing]); // Re-fetch when follow state changes

  const fetchSuggestedUsers = async () => {
    try {
      const response = await authAPI.getSuggestedUsers();
      const users = response.data.users || [];
      // Filter out already followed users and limit to 5
      const unfollowedUsers = users.filter(user => !isFollowing(user.id || user._id)).slice(0, 5);
      setSuggestedUsers(unfollowedUsers);
    } catch (error) {
      console.error('Error fetching suggested users:', error);
      // No fallback mock data - keep empty array for dynamic-only policy
      setSuggestedUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (user) => {
    const result = await toggleFollow(user);
    
    if (result.success && result.action === 'followed') {
      // Remove from suggestions after successful follow with a delay to show success state
      setTimeout(() => {
        setSuggestedUsers(prev => prev.filter(u => (u.id || u._id) !== (user.id || user._id)));
      }, 1500);
    }
  };

  const handleDismiss = (userId) => {
    setSuggestedUsers(prev => prev.filter(user => user._id !== userId));
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (suggestedUsers.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Suggested for You</h3>
              <p className="text-sm text-gray-600">People you might know</p>
            </div>
          </div>
          <div className="flex items-center space-x-1 text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
            <TrendingUp className="w-3 h-3" />
            <span>Popular</span>
          </div>
        </div>
      </div>

      {/* User List */}
      <div className="divide-y divide-gray-50">
        {suggestedUsers.map((user, index) => (
          <div key={user.id || user._id || index} className="p-4 hover:bg-gray-50 transition-colors duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center shadow-md">
                    <span className="text-white font-semibold">
                      {user.username?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  {index < 2 && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-yellow-400 rounded-full flex items-center justify-center">
                      <Star className="w-3 h-3 text-yellow-700" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="font-semibold text-gray-900 hover:text-purple-600 cursor-pointer transition-colors">
                      {user.username}
                    </h4>
                    {index === 0 && (
                      <div className="px-2 py-1 bg-blue-100 text-blue-600 text-xs font-medium rounded-full">
                        Hot
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-3 mt-1">
                    <p className="text-sm text-gray-600">@{user.username}</p>
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <span>Suggested for you</span>
                    </div>
                  </div>
                  {user.mutualFollowers && user.mutualFollowers.length > 0 && (
                    <p className="text-xs text-gray-500 mt-1">
                      Followed by {user.mutualFollowers.slice(0, 2).map(f => f.username).join(', ')}
                      {user.mutualFollowers.length > 2 && ` and ${user.mutualFollowers.length - 2} others`}
                    </p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleDismiss(user._id)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all duration-200"
                  title="Dismiss"
                >
                  <X className="w-4 h-4" />
                </button>
                
                {(() => {
                  const userId = user.id || user._id;
                  const userIsFollowing = isFollowing(userId);
                  const userIsProcessing = isProcessing(userId);
                  
                  return (
                    <button
                      onClick={() => handleFollow(user)}
                      disabled={userIsProcessing}
                      className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 text-sm ${
                        userIsFollowing 
                          ? 'bg-green-500 text-white hover:bg-green-600' 
                          : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600'
                      } ${userIsProcessing ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                      {userIsProcessing ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Following...</span>
                        </>
                      ) : userIsFollowing ? (
                        <>
                          <Check className="w-4 h-4" />
                          <span>Following</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          <span>Follow</span>
                        </>
                      )}
                    </button>
                  );
                })()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-4 bg-gray-50 border-t border-gray-100">
        <button className="w-full text-center text-sm text-purple-600 hover:text-purple-700 font-medium transition-colors">
          See All Suggestions
        </button>
      </div>
    </div>
  );
};

export default SuggestedUsers;