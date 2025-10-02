import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, HeartIcon, ChatBubbleOvalLeftIcon } from '@heroicons/react/24/outline';
import { authAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const Explore = () => {
  const [posts, setPosts] = useState([]);
  const [hashtags, setHashtags] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('posts');
  const [selectedPost, setSelectedPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchExploreData();
  }, [activeTab]);

  const fetchExploreData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (activeTab === 'posts') {
        const response = await authAPI.get('/explore/posts');
        setPosts(response.data.posts || []);
      } else if (activeTab === 'reels') {
        const response = await authAPI.get('/explore/reels');
        setPosts(response.data.reels || []);
      } else if (activeTab === 'tags') {
        const response = await authAPI.get('/explore/hashtags');
        setHashtags(response.data.hashtags || []);
      }
    } catch (error) {
      console.error('Error fetching explore data:', error);
      setError('Failed to load explore content');
      // Fallback to empty arrays instead of mock data
      setPosts([]);
      setHashtags([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchExploreData();
      return;
    }
    
    try {
      setLoading(true);
      const response = await authAPI.get(`/explore/search?q=${encodeURIComponent(searchTerm)}`);
      setPosts(response.data.posts || []);
    } catch (error) {
      console.error('Error searching posts:', error);
      setError('Search failed');
    } finally {
      setLoading(false);
    }
  };

  const filteredPosts = searchTerm ? posts : posts;

  const PostModal = ({ post, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex">
        <div className="flex-1">
          <img src={post.image} alt="Post" className="w-full h-full object-cover" />
        </div>
        <div className="w-80 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold text-white">
                  {post.author?.username?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <span className="font-semibold">{post.author?.username || 'Unknown User'}</span>
            </div>
          </div>
          <div className="flex-1 p-4">
            <p className="text-sm">{post.caption}</p>
          </div>
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-4">
                <HeartIcon className="w-6 h-6 cursor-pointer hover:text-red-500" />
                <ChatBubbleOvalLeftIcon className="w-6 h-6 cursor-pointer" />
              </div>
            </div>
            <p className="text-sm font-semibold">{post.likes.toLocaleString()} likes</p>
            <p className="text-sm text-gray-500">{post.comments} comments</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full w-8 h-8 flex items-center justify-center"
        >
          ×
        </button>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* Search Bar */}
      <div className="relative mb-6">
        <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Search posts and users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
          className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      {/* Tabs */}
      <div className="flex space-x-8 mb-6 border-b border-gray-200">
        {['posts', 'reels', 'tags'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 text-sm font-medium capitalize ${
              activeTab === tab
                ? 'text-black border-b-2 border-black'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="text-center py-12">
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={fetchExploreData}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Trending Hashtags */}
      {activeTab === 'tags' && !loading && !error && (
        <div className="grid grid-cols-1 gap-4 mb-6">
          {hashtags.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p>No trending hashtags found</p>
            </div>
          ) : (
            hashtags.map((hashtagData, index) => (
              <div key={hashtagData.tag || index} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-xl text-white">#</span>
                </div>
                <div>
                  <p className="font-semibold">{hashtagData.tag}</p>
                  <p className="text-sm text-gray-500">{hashtagData.postCount.toLocaleString()} posts</p>
                  {hashtagData.trending && (
                    <span className="inline-block px-2 py-1 text-xs bg-red-100 text-red-600 rounded-full mt-1">
                      Trending
                    </span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Posts Grid */}
      {(activeTab === 'posts' || activeTab === 'reels') && !loading && !error && (
        <div className="grid grid-cols-3 gap-1">
          {filteredPosts.length === 0 ? (
            <div className="col-span-3 text-center py-12 text-gray-500">
              <p>No {activeTab} found</p>
              {searchTerm && (
                <p className="text-sm mt-2">Try searching for something else</p>
              )}
            </div>
          ) : (
            filteredPosts.map((post) => (
              <div
                key={post.id}
                className="relative aspect-square cursor-pointer group"
                onClick={() => setSelectedPost(post)}
              >
                <img
                  src={post.image}
                  alt="Post"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = '/placeholder-image.jpg';
                  }}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                  <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-4 text-white">
                    <div className="flex items-center space-x-1">
                      <HeartIcon className={`w-5 h-5 ${post.isLiked ? 'fill-red-500 text-red-500' : 'fill-current'}`} />
                      <span className="text-sm font-semibold">{post.likes || 0}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <ChatBubbleOvalLeftIcon className="w-5 h-5 fill-current" />
                      <span className="text-sm font-semibold">{post.comments || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {selectedPost && (
        <PostModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
        />
      )}
    </div>
  );
};

export default Explore;
