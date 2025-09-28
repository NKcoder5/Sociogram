import React, { useState, useEffect } from 'react';
import { postAPI, authAPI } from '../../utils/api';
import Post from './Post';
import InteractivePost from '../interactive/InteractivePost';
import Stories from '../stories/Stories';
import SuggestedUsers from '../suggestions/SuggestedUsers';
import Following from '../follow/Following';
import UserStatsCard from './UserStatsCard';
import NotificationBell from '../notifications/NotificationBell';
import { Sparkles, TrendingUp, Users, Loader2, WifiOff } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Feed = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('for-you');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await postAPI.getAllPosts();
      console.log('Feed posts response:', response.data);
      console.log('Posts array:', response.data.posts);
      console.log('Posts length:', response.data.posts?.length);
      setPosts(response.data.posts || []);
    } catch (error) {
      if (error.message === 'OFFLINE') {
        // Silent handling for offline state
        setPosts([]);
      } else {
        console.error('Error fetching posts:', error);
      }
    } finally {
      setLoading(false);
    }
  };

  const handlePostUpdate = (updatedPost, action, postId) => {
    if (action === 'delete') {
      // Remove the deleted post from the list
      setPosts(posts.filter(post => post.id !== postId));
    } else if (updatedPost) {
      // Update existing post
      setPosts(posts.map(post => 
        post.id === updatedPost.id ? updatedPost : post
      ));
    }
  };

  const tabs = [
    { id: 'for-you', label: 'For You', icon: Sparkles },
    { id: 'following', label: 'Following', icon: Users },
    { id: 'trending', label: 'Trending', icon: TrendingUp },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-purple-600" />
          <p className="text-gray-600 font-medium">Loading your feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Main Feed Column */}
        <div className="xl:col-span-8">
          {/* Feed Header */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 sticky top-0 z-10 backdrop-blur-sm bg-white/80">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Your Feed</h1>
                <div className="flex items-center space-x-4">
                  <NotificationBell />
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>Live updates</span>
                  </div>
                </div>
              </div>
              
              {/* Tabs */}
              <div className="flex space-x-1 bg-gray-100 rounded-xl p-1">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 flex-1 justify-center ${
                      activeTab === tab.id
                        ? 'bg-white text-purple-600 shadow-sm font-medium'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    <tab.icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Stories Section - Only show on For You tab */}
          {activeTab === 'for-you' && (
            <div className="mb-8">
              <Stories />
            </div>
          )}
          
          {/* Content based on active tab */}
          {activeTab === 'for-you' && (
            <div className="space-y-6">
              {posts.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                  {!navigator.onLine ? (
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                        <WifiOff className="w-8 h-8 text-red-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">You're offline</h3>
                        <p className="text-gray-600">
                          Posts will load when your connection is restored.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-4">
                      <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                        <Users className="w-8 h-8 text-purple-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Welcome to Bloggy!</h3>
                        <p className="text-gray-600 mb-4">
                          Start following people to see their posts in your feed.
                        </p>
                        <button className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-xl font-medium hover:from-purple-600 hover:to-blue-600 transition-all duration-200">
                          Explore Users
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                posts.map((post) => (
                  <div key={post.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-all duration-300">
                    <InteractivePost 
                      post={post} 
                      onPostUpdate={handlePostUpdate}
                    />
                  </div>
                ))
              )}
            </div>
          )}

          {/* Following Tab Content */}
          {activeTab === 'following' && (
            <div className="space-y-6">
              <Following />
            </div>
          )}

          {/* Trending Tab Content */}
          {activeTab === 'trending' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                    <TrendingUp className="w-8 h-8 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Trending Posts</h3>
                    <p className="text-gray-600">
                      Trending content will appear here soon!
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Column */}
        <div className="xl:col-span-4">
          <div className="sticky top-0 max-h-screen overflow-y-auto">
            {/* User Stats Card */}
            <UserStatsCard />

            <div className="mt-4">
              <SuggestedUsers />
            </div>

            {/* Trending Topics */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <span>Trending Today</span>
              </h3>
              <div className="space-y-3">
                {['#ReactJS', '#WebDevelopment', '#AI', '#TechNews', '#Innovation'].map((tag, index) => (
                  <div key={tag} className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 transition-colors duration-200 cursor-pointer">
                    <div>
                      <span className="font-medium text-gray-900">{tag}</span>
                      <div className="text-sm text-gray-600">{Math.floor(Math.random() * 50) + 10}k posts</div>
                    </div>
                    <div className="text-sm text-purple-600 font-medium">#{index + 1}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Feed;