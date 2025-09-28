import React, { useState, useEffect } from 'react';
import { PaperAirplaneIcon, UserPlusIcon, ChatBubbleLeftIcon } from '@heroicons/react/24/outline';
import { messageAPI, authAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import { useFollow } from '../../context/FollowContext';

const Messages = () => {
  const { user } = useAuth();
  const { followingUsers } = useFollow();
  const [conversations, setConversations] = useState([]);
  const [followedUsers, setFollowedUsers] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('conversations');

  useEffect(() => {
    if (user) {
      loadConversations();
      loadFollowedUsers();
    }
  }, [user]);

  const loadConversations = async () => {
    try {
      const response = await messageAPI.getConversations();
      setConversations(response.data.conversations || []);
    } catch (error) {
      console.error('Error loading conversations:', error);
      setConversations([]);
    }
  };

  const loadFollowedUsers = async () => {
    try {
      const response = await authAPI.getFollowing(user.id);
      setFollowedUsers(response.data.following || []);
    } catch (error) {
      console.error('Error loading followed users:', error);
      setFollowedUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const response = await messageAPI.sendMessage(selectedConversation.user._id || selectedConversation.user.id, newMessage);
      
      // Add message to local state
      const newMsg = {
        _id: Date.now(),
        message: newMessage,
        senderId: user.id,
        timestamp: new Date()
      };
      setMessages([...messages, newMsg]);
      setNewMessage('');
      
      // Refresh conversations to update last message
      loadConversations();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const startConversation = async (followedUser) => {
    try {
      // Send initial message to create conversation
      const response = await messageAPI.sendMessage(followedUser.id, 'Hi! 👋');
      
      if (response.data.success) {
        // Create conversation object
        const newConversation = {
          _id: `conv_${followedUser.id}`,
          user: followedUser,
          lastMessage: 'Hi! 👋',
          timestamp: new Date()
        };
        
        setSelectedConversation(newConversation);
        setMessages([{
          _id: Date.now(),
          message: 'Hi! 👋',
          senderId: user.id,
          timestamp: new Date()
        }]);
        setActiveTab('conversations');
        
        // Refresh conversations
        loadConversations();
      }
    } catch (error) {
      console.error('Error starting conversation:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-instagram-blue"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar */}
      <div className="w-1/3 border-r border-gray-300 flex flex-col">
        {/* Header with Tabs */}
        <div className="p-4 border-b border-gray-300">
          <h2 className="text-lg font-semibold mb-4">Messages</h2>
          
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('conversations')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-all duration-200 flex-1 justify-center text-sm ${
                activeTab === 'conversations'
                  ? 'bg-white text-purple-600 shadow-sm font-medium'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ChatBubbleLeftIcon className="w-4 h-4" />
              <span>Chats</span>
            </button>
            <button
              onClick={() => setActiveTab('following')}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-all duration-200 flex-1 justify-center text-sm ${
                activeTab === 'following'
                  ? 'bg-white text-purple-600 shadow-sm font-medium'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <UserPlusIcon className="w-4 h-4" />
              <span>Following</span>
            </button>
          </div>
        </div>
        
        {/* Content based on active tab */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'conversations' ? (
            // Conversations List
            conversations.length === 0 ? (
              <div className="p-8 text-center">
                <ChatBubbleLeftIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h4 className="font-medium text-gray-900 mb-2">No conversations yet</h4>
                <p className="text-sm text-gray-600">Start messaging people you follow</p>
              </div>
            ) : (
              conversations.map((conversation) => (
                <div
                  key={conversation._id}
                  onClick={() => setSelectedConversation(conversation)}
                  className={`p-4 cursor-pointer hover:bg-gray-50 border-b border-gray-100 ${
                    selectedConversation?._id === conversation._id ? 'bg-purple-50' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold text-sm">
                        {conversation.user.username?.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-sm">{conversation.user.username}</p>
                      <p className="text-xs text-gray-500 truncate">{conversation.lastMessage}</p>
                    </div>
                  </div>
                </div>
              ))
            )
          ) : (
            // Following List
            followedUsers.length === 0 ? (
              <div className="p-8 text-center">
                <UserPlusIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h4 className="font-medium text-gray-900 mb-2">No one to message</h4>
                <p className="text-sm text-gray-600">Follow people to start messaging them</p>
              </div>
            ) : (
              followedUsers.map((followedUser) => (
                <div
                  key={followedUser.id}
                  className="p-4 hover:bg-gray-50 border-b border-gray-100"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-400 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-sm">
                          {followedUser.username?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{followedUser.username}</p>
                        <p className="text-xs text-gray-500">@{followedUser.username}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => startConversation(followedUser)}
                      className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-3 py-1.5 rounded-lg font-medium hover:from-purple-600 hover:to-blue-600 transition-all duration-200 text-sm"
                    >
                      Message
                    </button>
                  </div>
                </div>
              ))
            )
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-300">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold">
                    {selectedConversation.user.username?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <p className="font-semibold">{selectedConversation.user.username}</p>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message._id}
                  className={`flex ${
                    message.senderId === 'currentUser' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xs px-4 py-2 rounded-lg ${
                      message.senderId === 'currentUser'
                        ? 'bg-instagram-blue text-white'
                        : 'bg-gray-200 text-black'
                    }`}
                  >
                    <p className="text-sm">{message.message}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-300">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-instagram-blue"
                />
                <button
                  type="submit"
                  disabled={!newMessage.trim()}
                  className="p-2 text-instagram-blue disabled:text-gray-400"
                >
                  <PaperAirplaneIcon className="h-5 w-5" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-xl font-light mb-2">Your Messages</h3>
              <p className="text-gray-500">Send private photos and messages to a friend or group.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Messages;
