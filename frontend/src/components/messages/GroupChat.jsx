import React, { useState, useEffect } from 'react';
import { 
  UserGroupIcon, 
  PlusIcon, 
  XMarkIcon,
  UserPlusIcon,
  MagnifyingGlassIcon,
  Cog6ToothIcon
} from '@heroicons/react/24/outline';
import { messageAPI, authAPI, groupAPI } from '../../utils/api';

const GroupChat = ({ 
  socket, 
  user, 
  onGroupCreate, 
  onGroupSelect,
  groups = [],
  selectedGroup = null,
  isOpen = false,
  onClose = () => {}
}) => {
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [followedUsers, setFollowedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [groupSettings, setGroupSettings] = useState({
    isPrivate: false,
    allowMemberInvites: true,
    requireApproval: false
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      loadFollowedUsers();
    }
  }, [user, isOpen]);

  const loadFollowedUsers = async () => {
    try {
      console.log('🔍 Loading followers and following for group creation...');
      
      // Get both followers and following users
      const [followingResponse, followersResponse] = await Promise.all([
        authAPI.getFollowing(user.id),
        authAPI.getFollowers(user.id)
      ]);
      
      console.log('📊 Following response:', followingResponse.data);
      console.log('📊 Followers response:', followersResponse.data);
      
      const availableUsers = new Map(); // Use Map to avoid duplicates
      
      // Add users that the current user follows
      if (followingResponse.data.success && followingResponse.data.following) {
        followingResponse.data.following.forEach(followedUser => {
          if (followedUser.id !== user.id) {
            availableUsers.set(followedUser.id, {
              ...followedUser,
              relationship: 'following'
            });
          }
        });
      }
      
      // Add users that follow the current user
      if (followersResponse.data.success && followersResponse.data.followers) {
        followersResponse.data.followers.forEach(follower => {
          if (follower.id !== user.id) {
            const existing = availableUsers.get(follower.id);
            availableUsers.set(follower.id, {
              ...follower,
              relationship: existing ? 'mutual' : 'follower'
            });
          }
        });
      }
      
      const usersList = Array.from(availableUsers.values());
      console.log('👥 Available users for group:', usersList.length);
      console.log('👥 Breakdown:', {
        mutual: usersList.filter(u => u.relationship === 'mutual').length,
        following: usersList.filter(u => u.relationship === 'following').length,
        followers: usersList.filter(u => u.relationship === 'follower').length
      });
      
      setFollowedUsers(usersList);
    } catch (error) {
      console.error('❌ Error loading users:', error);
      setFollowedUsers([]);
    }
  };

  const createGroup = async () => {
    if (!groupName.trim() || selectedUsers.length === 0) return;

    setLoading(true);
    try {
      const groupData = {
        name: groupName.trim(),
        description: groupDescription.trim(),
        participants: selectedUsers.map(u => u.id),
        settings: groupSettings
      };

      console.log('Creating group:', groupData);
      
      const response = await groupAPI.createGroup(groupData);
      
      if (response.data.success) {
        console.log('✅ Group created successfully:', response.data.group);
        onGroupCreate(response.data.group);
        resetForm();
      } else {
        console.error('❌ Group creation failed:', response.data.message);
      }
      
    } catch (error) {
      console.error('❌ Error creating group:', error);
      alert('Failed to create group. Please try again.');
      // Don't create mock groups - show proper error handling
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setGroupName('');
    setGroupDescription('');
    setSelectedUsers([]);
    setSearchTerm('');
    setGroupSettings({
      isPrivate: false,
      allowMemberInvites: true,
      requireApproval: false
    });
  };

  const filteredUsers = followedUsers.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedUsers.some(su => su.id === u.id)
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">Create New Group</h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Group Info */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Group Name *</label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="Enter group name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={50}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                value={groupDescription}
                onChange={(e) => setGroupDescription(e.target.value)}
                placeholder="What's this group about?"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                maxLength={200}
              />
            </div>
          </div>

          {/* Add Members */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Add Members</label>
            <div className="space-y-3">
              {/* Search Users */}
              <div className="relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search people to add..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Selected Users */}
              {selectedUsers.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedUsers.map(user => (
                    <div key={user.id} className="flex items-center space-x-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                      <span>{user.username}</span>
                      <button
                        onClick={() => setSelectedUsers(prev => prev.filter(u => u.id !== user.id))}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Available Users */}
              <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(user => (
                    <div
                      key={user.id}
                      onClick={() => setSelectedUsers(prev => [...prev, user])}
                      className="flex items-center space-x-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                    >
                      <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {user.username?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{user.username}</p>
                        <p className="text-sm text-gray-600">@{user.username}</p>
                      </div>
                      <div className="flex items-center">
                        {user.relationship === 'mutual' && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                            🤝 Mutual
                          </span>
                        )}
                        {user.relationship === 'following' && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                            👤 Following
                          </span>
                        )}
                        {user.relationship === 'follower' && (
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full font-medium">
                            👥 Follower
                          </span>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    <UserPlusIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    {searchTerm ? (
                      <div>
                        <p className="font-medium">No users found</p>
                        <p className="text-sm">Try a different search term</p>
                      </div>
                    ) : followedUsers.length === 0 ? (
                      <div>
                        <p className="font-medium">No connections available</p>
                        <p className="text-sm">Follow users or get followers to add them to groups</p>
                      </div>
                    ) : (
                      <div>
                        <p className="font-medium">All users selected</p>
                        <p className="text-sm">You've added everyone from your connections</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Group Settings */}
          <div className="space-y-3">
            <h3 className="text-sm font-medium text-gray-700">Group Settings</h3>
            <div className="space-y-2">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={groupSettings.isPrivate}
                  onChange={(e) => setGroupSettings(prev => ({ ...prev, isPrivate: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Private Group</span>
              </label>
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={groupSettings.allowMemberInvites}
                  onChange={(e) => setGroupSettings(prev => ({ ...prev, allowMemberInvites: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Allow members to invite others</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={createGroup}
              disabled={!groupName.trim() || selectedUsers.length === 0 || loading}
              className="px-6 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg hover:from-green-600 hover:to-blue-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Group'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupChat;
