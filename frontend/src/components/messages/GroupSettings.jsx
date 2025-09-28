import React, { useState, useEffect } from 'react';
import { 
  XMarkIcon,
  UserGroupIcon,
  UserPlusIcon,
  UserMinusIcon,
  ShieldCheckIcon,
  StarIcon,
  TrashIcon,
  ExclamationTriangleIcon,
  Cog6ToothIcon,
  PencilIcon
} from '@heroicons/react/24/outline';
import { groupAPI, authAPI } from '../../utils/api';

const GroupSettings = ({ 
  group, 
  user, 
  isOpen, 
  onClose, 
  onGroupUpdate,
  onGroupDelete,
  onMemberUpdate 
}) => {
  const [activeTab, setActiveTab] = useState('info');
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [groupSettings, setGroupSettings] = useState({});
  const [loading, setLoading] = useState(false);
  const [followedUsers, setFollowedUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (group && isOpen) {
      setGroupName(group.name || '');
      setGroupDescription(group.description || '');
      setGroupSettings(group.groupSettings || {});
      loadFollowedUsers();
    }
  }, [group, isOpen]);

  const loadFollowedUsers = async () => {
    try {
      const response = await authAPI.getFollowing(user.id);
      if (response.data.success) {
        // Filter out users already in the group
        const existingMemberIds = group.participants?.map(p => p.user.id) || [];
        const availableUsers = response.data.following.filter(
          u => !existingMemberIds.includes(u.id)
        );
        setFollowedUsers(availableUsers);
      }
    } catch (error) {
      console.error('Error loading followed users:', error);
    }
  };

  const handleUpdateGroup = async () => {
    setLoading(true);
    try {
      const response = await groupAPI.updateGroup(group.id, {
        name: groupName,
        description: groupDescription,
        settings: groupSettings
      });

      if (response.data.success) {
        onGroupUpdate(response.data.group);
        alert('Group updated successfully');
      }
    } catch (error) {
      console.error('Error updating group:', error);
      alert('Failed to update group');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async (userId) => {
    try {
      const response = await groupAPI.addMember(group.id, userId);
      if (response.data.success) {
        onMemberUpdate(response.data.group);
        loadFollowedUsers(); // Refresh available users
      }
    } catch (error) {
      console.error('Error adding member:', error);
      alert('Failed to add member');
    }
  };

  const handleRemoveMember = async (userId) => {
    if (!window.confirm('Remove this member from the group?')) return;

    try {
      const response = await groupAPI.removeMember(group.id, userId);
      if (response.data.success) {
        onMemberUpdate(response.data.group);
      }
    } catch (error) {
      console.error('Error removing member:', error);
      alert('Failed to remove member');
    }
  };

  const handleMakeAdmin = async (userId) => {
    try {
      const response = await groupAPI.makeAdmin(group.id, userId);
      if (response.data.success) {
        onMemberUpdate(response.data.group);
      }
    } catch (error) {
      console.error('Error making admin:', error);
      alert('Failed to make admin');
    }
  };

  const handleRemoveAdmin = async (userId) => {
    try {
      const response = await groupAPI.removeAdmin(group.id, userId);
      if (response.data.success) {
        onMemberUpdate(response.data.group);
      }
    } catch (error) {
      console.error('Error removing admin:', error);
      alert('Failed to remove admin');
    }
  };

  const isOwner = group?.groupOwner?.id === user.id;
  const isAdmin = group?.groupAdmins?.some(admin => admin.user.id === user.id) || isOwner;

  const filteredUsers = followedUsers.filter(u => 
    u.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!isOpen || !group) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-400 rounded-full flex items-center justify-center">
                <UserGroupIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Group Settings</h2>
                <p className="text-sm text-gray-600">{group.name}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mt-4">
            {['info', 'members', 'settings'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab === 'info' && 'Group Info'}
                {tab === 'members' && 'Members'}
                {tab === 'settings' && 'Settings'}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          {/* Group Info Tab */}
          {activeTab === 'info' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Group Name</label>
                <input
                  type="text"
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  disabled={!isAdmin}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={groupDescription}
                  onChange={(e) => setGroupDescription(e.target.value)}
                  disabled={!isAdmin}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 resize-none"
                />
              </div>

              {isAdmin && (
                <div className="flex justify-end">
                  <button
                    onClick={handleUpdateGroup}
                    disabled={loading}
                    className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50"
                  >
                    {loading ? 'Updating...' : 'Update Group'}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Members Tab */}
          {activeTab === 'members' && (
            <div className="space-y-6">
              {/* Add Members */}
              {isAdmin && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Add Members</h3>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search people to add..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
                  />
                  <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-lg">
                    {filteredUsers.map(user => (
                      <div key={user.id} className="flex items-center justify-between p-3 hover:bg-gray-50">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">
                              {user.username?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <span className="font-medium text-gray-900">{user.username}</span>
                        </div>
                        <button
                          onClick={() => handleAddMember(user.id)}
                          className="p-1 text-green-600 hover:bg-green-50 rounded-full"
                        >
                          <UserPlusIcon className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Current Members */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Members</h3>
                <div className="space-y-2">
                  {group.participants?.map(participant => {
                    const member = participant.user;
                    const memberIsOwner = group.groupOwner?.id === member.id;
                    const memberIsAdmin = group.groupAdmins?.some(admin => admin.user.id === member.id);
                    
                    return (
                      <div key={member.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold">
                              {member.username?.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{member.username}</p>
                            <div className="flex items-center space-x-2">
                              {memberIsOwner && (
                                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full flex items-center space-x-1">
                                  <StarIcon className="w-3 h-3" />
                                  <span>Owner</span>
                                </span>
                              )}
                              {memberIsAdmin && !memberIsOwner && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full flex items-center space-x-1">
                                  <ShieldCheckIcon className="w-3 h-3" />
                                  <span>Admin</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {isOwner && member.id !== user.id && (
                          <div className="flex items-center space-x-2">
                            {!memberIsAdmin ? (
                              <button
                                onClick={() => handleMakeAdmin(member.id)}
                                className="p-1 text-blue-600 hover:bg-blue-50 rounded-full"
                                title="Make Admin"
                              >
                                <ShieldCheckIcon className="w-5 h-5" />
                              </button>
                            ) : !memberIsOwner && (
                              <button
                                onClick={() => handleRemoveAdmin(member.id)}
                                className="p-1 text-orange-600 hover:bg-orange-50 rounded-full"
                                title="Remove Admin"
                              >
                                <ShieldCheckIcon className="w-5 h-5" />
                              </button>
                            )}
                            <button
                              onClick={() => handleRemoveMember(member.id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded-full"
                              title="Remove Member"
                            >
                              <UserMinusIcon className="w-5 h-5" />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="space-y-4">
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={groupSettings.isPrivate || false}
                    onChange={(e) => setGroupSettings(prev => ({ ...prev, isPrivate: e.target.checked }))}
                    disabled={!isAdmin}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Private Group</span>
                </label>
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={groupSettings.allowMemberInvites || false}
                    onChange={(e) => setGroupSettings(prev => ({ ...prev, allowMemberInvites: e.target.checked }))}
                    disabled={!isAdmin}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Allow members to invite others</span>
                </label>
              </div>

              {/* Danger Zone */}
              {isOwner && (
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-lg font-semibold text-red-600 mb-4 flex items-center space-x-2">
                    <ExclamationTriangleIcon className="w-5 h-5" />
                    <span>Danger Zone</span>
                  </h3>
                  <button
                    onClick={() => {
                      if (window.confirm('Are you sure you want to delete this group? This action cannot be undone.')) {
                        onGroupDelete(group.id);
                        onClose();
                      }
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center space-x-2"
                  >
                    <TrashIcon className="w-4 h-4" />
                    <span>Delete Group</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GroupSettings;
