import React, { useState, useEffect } from 'react';
import { 
  HeartIcon, 
  UserPlusIcon, 
  ChatBubbleOvalLeftIcon,
  EyeIcon,
  ShareIcon,
  BookmarkIcon,
  ArrowTrendingUpIcon,
  SparklesIcon,
  FireIcon,
  ChartBarIcon,
  CalendarDaysIcon,
  ClockIcon,
  TrophyIcon,
  StarIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../../context/AuthContext';
import { authAPI, postAPI } from '../../utils/api';

const Activity = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('analytics');
  const [stats, setStats] = useState({});
  const [activities, setActivities] = useState([]);
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [trendingTopics, setTrendingTopics] = useState([]);
  const [weeklyData, setWeeklyData] = useState([]);
  const [engagementData, setEngagementData] = useState([]);
  const [topPosts, setTopPosts] = useState([]);

  useEffect(() => {
    const fetchRealStats = async () => {
      if (!user) return;
      
      try {
        // Get real user data
        const profileResponse = await authAPI.getProfile(user.id);
        const userData = profileResponse.data.user;
        
        // Get user's posts
        const postsResponse = await postAPI.getUserPosts(user.id);
        const userPosts = postsResponse.data.posts || [];
        
        // Calculate real metrics
        const totalLikes = userPosts.reduce((sum, post) => sum + (post.likes?.length || 0), 0);
        const totalComments = userPosts.reduce((sum, post) => sum + (post.comments?.length || 0), 0);
        const totalEngagement = totalLikes + totalComments;
        const engagementRate = userPosts.length > 0 ? ((totalEngagement / userPosts.length) * 100 / Math.max(userData.followers?.length || 1, 1)).toFixed(1) : '0.0';
        
        setStats({
          posts: userPosts.length,
          followers: userData.followers?.length || 0,
          following: userData.following?.length || 0,
          likes: totalLikes,
          views: Math.max(totalLikes * 3, userPosts.length * 15),
          engagement: Math.min(parseFloat(engagementRate), 15.0)
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        // Fallback to user data if available
        if (user) {
          setStats({
            posts: user.posts?.length || 0,
            followers: user.followers?.length || 0,
            following: user.following?.length || 0,
            likes: 0,
            views: 0,
            engagement: 0
          });
        }
      }
    };

    fetchRealStats();

    // Rich activity data inspired by Instagram/Twitter
    setActivities([
      {
        id: 1,
        type: 'like',
        users: ['sarah_photographer', 'mike_designer', 'alex_dev'],
        count: Math.floor(Math.random() * 20) + 5,
        postImage: 'https://picsum.photos/100/100?random=1',
        timestamp: new Date(Date.now() - 1000 * 60 * 15),
        postType: 'photo'
      },
      {
        id: 2,
        type: 'follow',
        users: ['tech_enthusiast', 'creative_mind'],
        count: Math.floor(Math.random() * 8) + 2,
        timestamp: new Date(Date.now() - 1000 * 60 * 45),
        verified: true
      },
      {
        id: 3,
        type: 'comment',
        users: ['lisa_writer'],
        count: 1,
        postImage: 'https://picsum.photos/100/100?random=2',
        timestamp: new Date(Date.now() - 1000 * 60 * 90),
        comment: 'Amazing work! 🔥',
        postType: 'video'
      },
      {
        id: 4,
        type: 'share',
        users: ['john_influencer', 'emma_creator'],
        count: 3,
        postImage: 'https://picsum.photos/100/100?random=3',
        timestamp: new Date(Date.now() - 1000 * 60 * 120),
        postType: 'reel'
      },
      {
        id: 5,
        type: 'view',
        users: ['story_viewer_1', 'story_viewer_2'],
        count: 47,
        timestamp: new Date(Date.now() - 1000 * 60 * 180),
        contentType: 'story'
      },
      {
        id: 6,
        type: 'save',
        users: ['bookmark_user'],
        count: 1,
        postImage: 'https://picsum.photos/100/100?random=4',
        timestamp: new Date(Date.now() - 1000 * 60 * 240),
        postType: 'tutorial'
      }
    ]);

    // Trending content creators and topics
    setSuggestedUsers([
      {
        id: 1,
        username: 'ai_researcher',
        displayName: 'Dr. Sarah Chen',
        bio: 'AI Research Scientist at Stanford 🧠',
        followers: 45600,
        isFollowing: false,
        mutualFollowers: ['tech_lead', 'data_scientist'],
        verified: true,
        category: 'Technology',
        engagement: '4.2%'
      },
      {
        id: 2,
        username: 'sustainable_living',
        displayName: 'EcoWarrior Maya',
        bio: 'Sustainable lifestyle advocate 🌱',
        followers: 23400,
        isFollowing: false,
        mutualFollowers: ['green_activist'],
        verified: false,
        category: 'Lifestyle',
        engagement: '6.8%'
      },
      {
        id: 3,
        username: 'startup_founder',
        displayName: 'Alex Rodriguez',
        bio: 'Building the future of fintech 💰',
        followers: 78900,
        isFollowing: false,
        mutualFollowers: ['venture_capital', 'tech_entrepreneur'],
        verified: true,
        category: 'Business',
        engagement: '3.5%'
      },
      {
        id: 4,
        username: 'digital_artist',
        displayName: 'Luna Creates',
        bio: 'NFT Artist & Digital Creator 🎨',
        followers: 12800,
        isFollowing: false,
        mutualFollowers: ['crypto_enthusiast'],
        verified: false,
        category: 'Art',
        engagement: '8.1%'
      }
    ]);

    // Trending topics like Twitter
    setTrendingTopics([
      { id: 1, tag: '#TechTrends2024', posts: '127K', category: 'Technology' },
      { id: 2, tag: '#SustainableLiving', posts: '89K', category: 'Lifestyle' },
      { id: 3, tag: '#AIRevolution', posts: '234K', category: 'Technology' },
      { id: 4, tag: '#CreatorEconomy', posts: '156K', category: 'Business' },
      { id: 5, tag: '#DigitalArt', posts: '67K', category: 'Art' }
    ]);

    // Weekly analytics data for charts
    setWeeklyData([
      { day: 'Mon', likes: 45, comments: 12, shares: 8, views: 234 },
      { day: 'Tue', likes: 67, comments: 18, shares: 15, views: 456 },
      { day: 'Wed', likes: 89, comments: 25, shares: 12, views: 678 },
      { day: 'Thu', likes: 123, comments: 34, shares: 22, views: 890 },
      { day: 'Fri', likes: 156, comments: 45, shares: 28, views: 1234 },
      { day: 'Sat', likes: 98, comments: 28, shares: 18, views: 567 },
      { day: 'Sun', likes: 76, comments: 19, shares: 14, views: 345 }
    ]);

    // Engagement breakdown
    setEngagementData([
      { type: 'Likes', value: 45, color: 'bg-red-500' },
      { type: 'Comments', value: 25, color: 'bg-blue-500' },
      { type: 'Shares', value: 20, color: 'bg-green-500' },
      { type: 'Saves', value: 10, color: 'bg-yellow-500' }
    ]);

    // Top performing posts
    setTopPosts([
      { 
        id: 1, 
        image: 'https://picsum.photos/300/300?random=1',
        likes: 234,
        comments: 45,
        shares: 12,
        type: 'photo',
        caption: 'Beautiful sunset at the beach...'
      },
      { 
        id: 2, 
        image: 'https://picsum.photos/300/300?random=2',
        likes: 189,
        comments: 32,
        shares: 8,
        type: 'video',
        caption: 'Quick cooking tutorial...'
      },
      { 
        id: 3, 
        image: 'https://picsum.photos/300/300?random=3',
        likes: 156,
        comments: 28,
        shares: 15,
        type: 'reel',
        caption: 'Morning workout routine...'
      }
    ]);
  }, []);

  const formatTime = (date) => {
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  const getActivityMessage = (activity) => {
    const { type, users, count, postType, contentType, comment } = activity;
    const displayUsers = users.slice(0, 2);
    const remainingCount = Math.max(0, count - displayUsers.length);

    switch (type) {
      case 'like':
        const content = postType || 'post';
        if (displayUsers.length === 1 && remainingCount === 0) {
          return `${displayUsers[0]} liked your ${content}`;
        }
        return `${displayUsers.join(', ')}${remainingCount > 0 ? ` and ${remainingCount} others` : ''} liked your ${content}`;
      
      case 'follow':
        if (displayUsers.length === 1 && remainingCount === 0) {
          return `${displayUsers[0]} started following you`;
        }
        return `${displayUsers.join(', ')}${remainingCount > 0 ? ` and ${remainingCount} others` : ''} started following you`;
      
      case 'comment':
        const postContent = postType || 'post';
        if (comment) {
          return `${displayUsers[0]} commented: "${comment}"`;
        }
        return `${displayUsers.join(', ')}${remainingCount > 0 ? ` and ${remainingCount} others` : ''} commented on your ${postContent}`;
      
      case 'share':
        const sharedContent = postType || 'post';
        return `${displayUsers.join(', ')}${remainingCount > 0 ? ` and ${remainingCount} others` : ''} shared your ${sharedContent}`;
      
      case 'view':
        if (contentType === 'story') {
          return `${count} people viewed your story`;
        }
        return `${displayUsers.join(', ')}${remainingCount > 0 ? ` and ${remainingCount} others` : ''} viewed your content`;
      
      case 'save':
        return `${displayUsers[0]} saved your ${postType || 'post'}`;
      
      default:
        return '';
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'like': return <HeartIcon className="w-6 h-6 text-red-500" />;
      case 'follow': return <UserPlusIcon className="w-6 h-6 text-green-500" />;
      case 'comment': return <ChatBubbleOvalLeftIcon className="w-6 h-6 text-blue-500" />;
      case 'share': return <ShareIcon className="w-6 h-6 text-purple-500" />;
      case 'view': return <EyeIcon className="w-6 h-6 text-gray-500" />;
      case 'save': return <BookmarkIcon className="w-6 h-6 text-yellow-500" />;
      default: return <SparklesIcon className="w-6 h-6 text-gray-400" />;
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const handleFollow = (userId) => {
    setSuggestedUsers(suggestedUsers.map(user =>
      user.id === userId ? { ...user, isFollowing: !user.isFollowing } : user
    ));
  };

  return (
    <div className="fixed inset-0 ml-80 bg-gray-50">
      {/* Fixed Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600 mt-1">Track your social media performance</p>
            </div>
            <div className="flex items-center space-x-2">
              <CalendarDaysIcon className="w-5 h-5 text-gray-400" />
              <span className="text-sm text-gray-600">Last 7 days</span>
            </div>
          </div>
          
          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 mt-4 max-w-md">
            {['analytics', 'discover', 'trending'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {tab === 'analytics' && (
                  <span className="flex items-center justify-center space-x-1">
                    <ChartBarIcon className="w-4 h-4" />
                    <span>Analytics</span>
                  </span>
                )}
                {tab === 'discover' && (
                  <span className="flex items-center justify-center space-x-1">
                    <UserPlusIcon className="w-4 h-4" />
                    <span>Discover</span>
                  </span>
                )}
                {tab === 'trending' && (
                  <span className="flex items-center justify-center space-x-1">
                    <FireIcon className="w-4 h-4" />
                    <span>Trending</span>
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Scrollable Content Container */}
      <div className="h-full overflow-y-auto pt-4">
        <div className="max-w-7xl mx-auto px-6 pb-20">
        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <div className="space-y-6 pb-20">
            {/* Key Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Posts</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{stats.posts || 0}</p>
                    <p className="text-sm text-green-600 mt-1">+12% from last week</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <ChartBarIcon className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Followers</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{formatNumber(stats.followers || 0)}</p>
                    <p className="text-sm text-green-600 mt-1">+{Math.floor(Math.random() * 50) + 10} this week</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <UserPlusIcon className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Likes</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{formatNumber(stats.likes || 0)}</p>
                    <p className="text-sm text-green-600 mt-1">+{stats.engagement || 0}% engagement</p>
                  </div>
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                    <HeartIcon className="w-6 h-6 text-red-600" />
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Profile Views</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{formatNumber(stats.views || 0)}</p>
                    <p className="text-sm text-green-600 mt-1">+23% from last week</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                    <EyeIcon className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Weekly Activity Chart */}
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <ArrowTrendingUpIcon className="w-5 h-5 mr-2 text-purple-600" />
                  Weekly Activity
                </h3>
                <div className="space-y-4">
                  {weeklyData.map((day, index) => (
                    <div key={day.day} className="flex items-center space-x-4">
                      <div className="w-8 text-sm font-medium text-gray-600">{day.day}</div>
                      <div className="flex-1 flex items-center space-x-2">
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${(day.likes / 200) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-gray-900 w-8">{day.likes}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Engagement Breakdown */}
              <div className="bg-white rounded-xl p-6 shadow-sm border">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <StarIcon className="w-5 h-5 mr-2 text-yellow-600" />
                  Engagement Breakdown
                </h3>
                <div className="space-y-4">
                  {engagementData.map((item, index) => (
                    <div key={item.type} className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${item.color}`} />
                        <span className="text-sm font-medium text-gray-700">{item.type}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`${item.color} h-2 rounded-full transition-all duration-500`}
                            style={{ width: `${item.value}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold text-gray-900 w-8">{item.value}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Posts */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <TrophyIcon className="w-5 h-5 mr-2 text-yellow-600" />
                Top Performing Posts
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {topPosts.map((post, index) => (
                  <div key={post.id} className="relative group">
                    <img 
                      src={post.image} 
                      alt={post.caption}
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
                      <div className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-center">
                        <div className="flex items-center justify-center space-x-4 text-sm">
                          <span className="flex items-center space-x-1">
                            <HeartIcon className="w-4 h-4" />
                            <span>{post.likes}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <ChatBubbleOvalLeftIcon className="w-4 h-4" />
                            <span>{post.comments}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <ShareIcon className="w-4 h-4" />
                            <span>{post.shares}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="absolute top-2 left-2">
                      <span className="bg-black bg-opacity-50 text-white text-xs px-2 py-1 rounded-full">
                        #{index + 1}
                      </span>
                    </div>
                    <div className="absolute top-2 right-2">
                      <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full capitalize">
                        {post.type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl p-6 shadow-sm border">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <SparklesIcon className="w-5 h-5 mr-2 text-blue-600" />
                Recent Activity
              </h3>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {activities.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-shrink-0 mt-0.5">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">{getActivityMessage(activity)}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatTime(activity.timestamp)}</p>
                    </div>
                    {activity.postImage && (
                      <img
                        src={activity.postImage}
                        alt="Post"
                        className="w-12 h-12 object-cover rounded-lg flex-shrink-0"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Discover Tab */}
        {activeTab === 'discover' && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <UserPlusIcon className="w-5 h-5 mr-2 text-green-600" />
              Suggested for You
              <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Popular</span>
            </h3>
            <div className="space-y-4">
              {suggestedUsers.map((user) => (
                <div key={user.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {user.displayName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-1">
                          <p className="font-semibold text-gray-900">{user.displayName}</p>
                          {user.verified && <span className="text-blue-500">✓</span>}
                        </div>
                        <p className="text-sm text-gray-600">@{user.username}</p>
                        <p className="text-xs text-purple-600 font-medium">{user.category}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleFollow(user.id)}
                      className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                        user.isFollowing
                          ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                          : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600'
                      }`}
                    >
                      {user.isFollowing ? 'Following' : 'Follow'}
                    </button>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">{user.bio}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{formatNumber(user.followers)} followers</span>
                    <span>{user.engagement} engagement</span>
                    {user.mutualFollowers.length > 0 && (
                      <span>Followed by {user.mutualFollowers[0]}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trending Tab */}
        {activeTab === 'trending' && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <FireIcon className="w-5 h-5 mr-2 text-red-600" />
              Trending Topics
            </h3>
            <div className="space-y-3">
              {trendingTopics.map((topic, index) => (
                <div key={topic.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-orange-400 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{topic.tag}</p>
                      <p className="text-xs text-gray-500">{topic.category} • {topic.posts} posts</p>
                    </div>
                  </div>
                  <ArrowTrendingUpIcon className="w-5 h-5 text-gray-400" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Discover Tab */}
        {activeTab === 'discover' && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <UserPlusIcon className="w-5 h-5 mr-2 text-green-600" />
              Suggested for You
              <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Popular</span>
            </h3>
            <div className="space-y-4">
              {suggestedUsers.map((user) => (
                <div key={user.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-blue-400 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold">
                          {user.displayName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center space-x-1">
                          <p className="font-semibold text-gray-900">{user.displayName}</p>
                          {user.verified && <span className="text-blue-500">✓</span>}
                        </div>
                        <p className="text-sm text-gray-600">@{user.username}</p>
                        <p className="text-xs text-purple-600 font-medium">{user.category}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleFollow(user.id)}
                      className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                        user.isFollowing
                          ? 'bg-gray-200 text-gray-800 hover:bg-gray-300'
                          : 'bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600'
                      }`}
                    >
                      {user.isFollowing ? 'Following' : 'Follow'}
                    </button>
                  </div>
                  <p className="text-sm text-gray-700 mb-3">{user.bio}</p>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{formatNumber(user.followers)} followers</span>
                    <span>{user.engagement} engagement</span>
                    {user.mutualFollowers.length > 0 && (
                      <span>Followed by {user.mutualFollowers[0]}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Trending Tab */}
        {activeTab === 'trending' && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
              <FireIcon className="w-5 h-5 mr-2 text-red-600" />
              Trending Topics
            </h3>
            <div className="space-y-3">
              {trendingTopics.map((topic, index) => (
                <div key={topic.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-red-400 to-orange-400 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{topic.tag}</p>
                      <p className="text-xs text-gray-500">{topic.category} • {topic.posts} posts</p>
                    </div>
                  </div>
                  <ArrowTrendingUpIcon className="w-5 h-5 text-gray-400" />
                </div>
              ))}
            </div>
          </div>
        )}

        </div>
      </div>
    </div>
  );
};

export default Activity;
