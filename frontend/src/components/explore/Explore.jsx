import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon, HeartIcon, ChatBubbleOvalLeftIcon } from '@heroicons/react/24/outline';

const Explore = () => {
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('posts');
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    // Mock explore posts data
    setPosts([
      {
        id: 1,
        image: 'https://picsum.photos/400/400?random=10',
        likes: 1234,
        comments: 45,
        user: { username: 'photographer_pro' },
        caption: 'Golden hour magic ✨ #photography #goldenhour'
      },
      {
        id: 2,
        image: 'https://picsum.photos/400/400?random=11',
        likes: 2156,
        comments: 89,
        user: { username: 'nature_lover' },
        caption: 'Mountain views that take your breath away 🏔️ #nature #mountains'
      },
      {
        id: 3,
        image: 'https://picsum.photos/400/400?random=12',
        likes: 987,
        comments: 23,
        user: { username: 'food_artist' },
        caption: 'Homemade pizza perfection 🍕 #food #homemade'
      },
      {
        id: 4,
        image: 'https://picsum.photos/400/400?random=13',
        likes: 3421,
        comments: 156,
        user: { username: 'travel_diary' },
        caption: 'Lost in the streets of Paris 🇫🇷 #travel #paris'
      },
      {
        id: 5,
        image: 'https://picsum.photos/400/400?random=14',
        likes: 1876,
        comments: 67,
        user: { username: 'art_studio' },
        caption: 'Abstract art in progress 🎨 #art #abstract'
      },
      {
        id: 6,
        image: 'https://picsum.photos/400/400?random=15',
        likes: 2543,
        comments: 98,
        user: { username: 'fitness_life' },
        caption: 'Morning workout complete 💪 #fitness #motivation'
      },
      {
        id: 7,
        image: 'https://picsum.photos/400/400?random=16',
        likes: 1654,
        comments: 34,
        user: { username: 'pet_lover' },
        caption: 'My furry best friend 🐕 #pets #dogs'
      },
      {
        id: 8,
        image: 'https://picsum.photos/400/400?random=17',
        likes: 3210,
        comments: 123,
        user: { username: 'music_beats' },
        caption: 'Studio session vibes 🎵 #music #studio'
      },
      {
        id: 9,
        image: 'https://picsum.photos/400/400?random=18',
        likes: 876,
        comments: 45,
        user: { username: 'fashion_style' },
        caption: 'Street style inspiration 👗 #fashion #style'
      }
    ]);
  }, []);

  const filteredPosts = posts.filter(post =>
    post.user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.caption.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const PostModal = ({ post, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex">
        <div className="flex-1">
          <img src={post.image} alt="Post" className="w-full h-full object-cover" />
        </div>
        <div className="w-80 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <span className="text-sm font-semibold">
                  {post.user.username.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="font-semibold">{post.user.username}</span>
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
          placeholder="Search"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-instagram-blue"
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

      {/* Trending Hashtags */}
      {activeTab === 'tags' && (
        <div className="grid grid-cols-1 gap-4 mb-6">
          {['#photography', '#travel', '#food', '#fitness', '#art', '#nature'].map((tag) => (
            <div key={tag} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg cursor-pointer">
              <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-xl">#</span>
              </div>
              <div>
                <p className="font-semibold">{tag}</p>
                <p className="text-sm text-gray-500">{Math.floor(Math.random() * 1000000).toLocaleString()} posts</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Posts Grid */}
      {(activeTab === 'posts' || activeTab === 'reels') && (
        <div className="grid grid-cols-3 gap-1">
          {filteredPosts.map((post) => (
            <div
              key={post.id}
              className="relative aspect-square cursor-pointer group"
              onClick={() => setSelectedPost(post)}
            >
              <img
                src={post.image}
                alt="Post"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                <div className="opacity-0 group-hover:opacity-100 flex items-center space-x-4 text-white">
                  <div className="flex items-center space-x-1">
                    <HeartIcon className="w-5 h-5 fill-current" />
                    <span className="text-sm font-semibold">{post.likes}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <ChatBubbleOvalLeftIcon className="w-5 h-5 fill-current" />
                    <span className="text-sm font-semibold">{post.comments}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
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
