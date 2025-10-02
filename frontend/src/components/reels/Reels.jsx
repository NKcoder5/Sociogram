import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  HeartIcon, 
  ChatBubbleOvalLeftIcon, 
  PaperAirplaneIcon, 
  BookmarkIcon, 
  EllipsisHorizontalIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  PlayIcon,
  PauseIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon, BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import { postAPI, authAPI } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import CommentsModal from '../modals/CommentsModal';
import ShareModal from '../modals/ShareModal';

const Reels = () => {
  const { user } = useAuth();
  const [reels, setReels] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showComments, setShowComments] = useState(false);
  const [showShare, setShowShare] = useState(false);
  const [selectedReel, setSelectedReel] = useState(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const videoRefs = useRef([]);
  const containerRef = useRef(null);
  const touchStartY = useRef(0);
  const touchEndY = useRef(0);

  useEffect(() => {
    const fetchReels = async () => {
      try {
        setLoading(true);
        
        // Try to get video posts from the API
        const postsResponse = await postAPI.getAllPosts();
        const allPosts = postsResponse.data.posts || [];
        
        // Filter for video posts (if any) or convert image posts to reels format
        const videoPosts = allPosts.filter(post => 
          post.image && (
            post.image.includes('.mp4') || 
            post.image.includes('.webm') || 
            post.image.includes('.mov')
          )
        );
        
        // Create reels from available posts
        let reelsData = [];
        
        // First try to get video posts
        if (videoPosts.length > 0) {
          reelsData = videoPosts.map(post => ({
            id: post.id,
            user: {
              username: post.author?.username || 'Unknown User',
              profilePicture: post.author?.profilePicture || null
            },
            video: post.image,
            isVideo: true,
            caption: post.caption || 'Check out this amazing content!',
            likes: post.likes?.length || 0,
            comments: post.comments?.length || 0,
            isLiked: false,
            isBookmarked: false,
            music: 'Original Audio'
          }));
        } else {
          // Add sample videos when no real videos exist
          reelsData = [
            {
              id: 'sample-1',
              user: {
                username: 'demo_user',
                profilePicture: null
              },
              video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
              isVideo: true,
              caption: 'Amazing nature video! 🌅 #nature #beautiful',
              likes: 1234,
              comments: 89,
              isLiked: false,
              isBookmarked: false,
              music: 'Nature Sounds'
            },
            {
              id: 'sample-2',
              user: {
                username: 'content_creator',
                profilePicture: null
              },
              video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
              isVideo: true,
              caption: 'Creative content for you! 🎨 #creative #art',
              likes: 2156,
              comments: 145,
              isLiked: true,
              isBookmarked: false,
              music: 'Creative Vibes'
            },
            {
              id: 'sample-3',
              user: {
                username: 'video_maker',
                profilePicture: null
              },
              video: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
              isVideo: true,
              caption: 'Check out this amazing video! 🔥 #trending #viral',
              likes: 3421,
              comments: 234,
              isLiked: false,
              isBookmarked: true,
              music: 'Trending Audio'
            }
          ];
        }
        
        // If we still have fewer than 3 reels, add image posts as moving pictures
        if (reelsData.length < 3) {
          const imagePosts = allPosts
            .filter(post => post.image && !post.image.includes('.mp4') && !post.image.includes('.webm') && !post.image.includes('.mov'))
            .slice(0, 5 - reelsData.length);
            
          const imageReels = imagePosts.map(post => ({
            id: post.id,
            user: {
              username: post.author?.username || 'Unknown User',
              profilePicture: post.author?.profilePicture || null
            },
            image: post.image,
            isVideo: false,
            caption: post.caption || 'Check out this amazing content!',
            likes: post.likes?.length || 0,
            comments: post.comments?.length || 0,
            isLiked: false,
            isBookmarked: false,
            music: 'Original Audio'
          }));
          
          reelsData = [...reelsData, ...imageReels];
        }
        
        setReels(reelsData);
      } catch (error) {
        console.error('Error fetching reels:', error);
        setReels([]);
      } finally {
        setLoading(false);
      }
    };

    fetchReels();
  }, []);

  // Enhanced video management
  useEffect(() => {
    const currentReel = reels[currentIndex];
    const currentVideo = videoRefs.current[currentIndex];
    
    // Only handle video elements for actual video reels
    if (currentVideo && currentReel?.isVideo) {
      currentVideo.muted = isMuted;
      if (isPlaying) {
        currentVideo.play().catch(error => {
          console.log('Video play failed:', error);
          // Don't show error for image reels
        });
      } else {
        currentVideo.pause();
      }
    }

    // Pause other videos
    videoRefs.current.forEach((video, index) => {
      if (video && index !== currentIndex && reels[index]?.isVideo) {
        video.pause();
        video.currentTime = 0;
      }
    });
  }, [currentIndex, isPlaying, isMuted, reels]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          handleScroll('up');
          break;
        case 'ArrowDown':
          e.preventDefault();
          handleScroll('down');
          break;
        case ' ':
          e.preventDefault();
          togglePlayPause();
          break;
        case 'm':
        case 'M':
          e.preventDefault();
          toggleMute();
          break;
        case 'l':
        case 'L':
          e.preventDefault();
          if (reels[currentIndex]) {
            handleLike(reels[currentIndex].id);
          }
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentIndex, reels]);

  // Touch gestures
  const handleTouchStart = (e) => {
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e) => {
    touchEndY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = () => {
    if (!touchStartY.current || !touchEndY.current) return;
    
    const distance = touchStartY.current - touchEndY.current;
    const isUpSwipe = distance > 50;
    const isDownSwipe = distance < -50;

    if (isUpSwipe) {
      handleScroll('down');
    } else if (isDownSwipe) {
      handleScroll('up');
    }

    touchStartY.current = 0;
    touchEndY.current = 0;
  };

  // Video progress tracking
  const handleVideoProgress = (index) => {
    const video = videoRefs.current[index];
    if (video && index === currentIndex) {
      const progress = (video.currentTime / video.duration) * 100;
      setProgress(progress);
    }
  };

  const handleLike = (reelId) => {
    setReels(reels.map(reel => 
      reel.id === reelId 
        ? { 
            ...reel, 
            isLiked: !reel.isLiked,
            likes: reel.isLiked ? reel.likes - 1 : reel.likes + 1
          }
        : reel
    ));
  };

  const handleBookmark = (reelId) => {
    setReels(reels.map(reel => 
      reel.id === reelId 
        ? { ...reel, isBookmarked: !reel.isBookmarked }
        : reel
    ));
  };

  const handleFollow = async (userId) => {
    try {
      await authAPI.followUnfollow(userId);
      // Update reel to show followed state
      setReels(reels.map(reel => 
        reel.user._id === userId 
          ? { ...reel, user: { ...reel.user, isFollowing: true } }
          : reel
      ));
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  const handleComment = (reel) => {
    setSelectedReel(reel);
    setShowComments(true);
  };

  const handleShare = (reel) => {
    setSelectedReel(reel);
    setShowShare(true);
  };

  const togglePlayPause = useCallback(() => {
    setIsPlaying(!isPlaying);
  }, [isPlaying]);

  const toggleMute = useCallback(() => {
    setIsMuted(!isMuted);
  }, [isMuted]);

  const handleScroll = useCallback((direction) => {
    setCurrentIndex(prevIndex => {
      if (direction === 'up' && prevIndex > 0) {
        setProgress(0);
        return prevIndex - 1;
      } else if (direction === 'down' && prevIndex < reels.length - 1) {
        setProgress(0);
        return prevIndex + 1;
      }
      return prevIndex;
    });
  }, [reels.length]);

  const handleVideoClick = (e) => {
    // Don't toggle play/pause if clicking on action buttons
    if (e.target.closest('.action-buttons')) return;
    togglePlayPause();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-black">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <p>Loading Reels...</p>
        </div>
      </div>
    );
  }

  if (reels.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen bg-black">
        <div className="text-white text-center">
          <div className="text-6xl mb-4">📱</div>
          <h2 className="text-xl font-semibold mb-2">No Reels Available</h2>
          <p className="text-gray-400">Check back later for new content!</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes ken-burns {
          0% { 
            transform: scale(1.0) translate(0%, 0%); 
          }
          25% { 
            transform: scale(1.05) translate(-1%, 1%); 
          }
          50% { 
            transform: scale(1.08) translate(1%, -1%); 
          }
          75% { 
            transform: scale(1.06) translate(-0.5%, 0.5%); 
          }
          100% { 
            transform: scale(1.1) translate(0.5%, -0.5%); 
          }
        }
      `}</style>
      <div 
        ref={containerRef}
        className="relative h-screen bg-black overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
      {/* Progress bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gray-800 z-50">
        <div 
          className="h-full bg-white transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Reel counter */}
      <div className="absolute top-4 right-4 z-50 bg-black bg-opacity-50 rounded-full px-3 py-1">
        <span className="text-white text-sm font-medium">
          {currentIndex + 1} / {reels.length}
        </span>
      </div>

      {/* Control hints */}
      <div className="absolute top-4 left-4 z-50 bg-black bg-opacity-50 rounded-lg p-2">
        <div className="text-white text-xs space-y-1">
          <div>↑↓ Navigate</div>
          <div>Space Play/Pause</div>
          <div>M Mute/Unmute</div>
          <div>L Like</div>
        </div>
      </div>

      {reels.map((reel, index) => (
        <div
          key={reel.id}
          className={`absolute inset-0 transition-transform duration-300 ${
            index === currentIndex ? 'translate-y-0' : 
            index < currentIndex ? '-translate-y-full' : 'translate-y-full'
          }`}
        >
          {/* Video or Image */}
          {reel.isVideo ? (
            <video
              ref={el => videoRefs.current[index] = el}
              src={reel.video}
              className="w-full h-full object-cover cursor-pointer"
              loop
              muted={isMuted}
            playsInline
            onClick={handleVideoClick}
            onTimeUpdate={() => handleVideoProgress(index)}
            onLoadedData={() => {
              if (index === currentIndex) {
                videoRefs.current[index]?.play().catch(console.error);
              }
            }}
            />
          ) : (
            <div className="relative w-full h-full overflow-hidden">
              <img
                src={reel.image}
                alt={reel.caption}
                className="w-full h-full object-cover cursor-pointer transform transition-transform duration-1000 hover:scale-110"
                onClick={handleVideoClick}
                style={{
                  animation: 'ken-burns 10s ease-in-out infinite alternate',
                  animationDelay: `${index * 0.5}s`
                }}
              />
            </div>
          )}

          {/* Play/Pause overlay - only for videos */}
          {!isPlaying && index === currentIndex && reel.isVideo && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30">
              <div className="bg-white bg-opacity-20 rounded-full p-4">
                <PlayIcon className="w-12 h-12 text-white" />
              </div>
            </div>
          )}

          {/* Overlay Content */}
          <div className="absolute inset-0 flex">
            {/* Left side - user info and caption */}
            <div className="flex-1 flex flex-col justify-end p-4">
              <div className="text-white">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-8 h-8 bg-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold">
                      {reel.user.username.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="font-semibold">{reel.user.username}</span>
                  <button 
                    onClick={() => handleFollow(reel.user.username)}
                    className="text-white border border-white px-3 py-1 rounded text-sm font-semibold hover:bg-white hover:text-black transition-colors"
                  >
                    Follow
                  </button>
                </div>
                <p className="text-sm mb-2">{reel.caption}</p>
                <div className="flex items-center space-x-1">
                  <span className="text-xs">🎵</span>
                  <span className="text-xs">{reel.music}</span>
                </div>
              </div>
            </div>

            {/* Right side - action buttons */}
            <div className="action-buttons w-16 flex flex-col justify-end items-center pb-20 space-y-6">
              {/* Mute/Unmute button - only for videos */}
              {reel.isVideo && (
                <div className="flex flex-col items-center">
                  <button
                    onClick={toggleMute}
                    className="text-white mb-1 hover:scale-110 transition-all duration-200 bg-black bg-opacity-30 rounded-full p-2"
                  >
                    {isMuted ? (
                      <SpeakerXMarkIcon className="w-6 h-6" />
                    ) : (
                      <SpeakerWaveIcon className="w-6 h-6" />
                    )}
                  </button>
                </div>
              )}

              {/* Like button */}
              <div className="flex flex-col items-center">
                <button
                  onClick={() => handleLike(reel.id)}
                  className="text-white mb-1 hover:scale-110 transition-all duration-200"
                >
                  {reel.isLiked ? (
                    <HeartSolidIcon className="w-8 h-8 text-red-500 animate-pulse" />
                  ) : (
                    <HeartIcon className="w-8 h-8 hover:text-red-400" />
                  )}
                </button>
                <span className="text-white text-xs font-medium">
                  {reel.likes > 999 ? `${(reel.likes / 1000).toFixed(1)}K` : reel.likes}
                </span>
              </div>

              {/* Comment button */}
              <div className="flex flex-col items-center">
                <button 
                  onClick={() => handleComment(reel)}
                  className="text-white mb-1 hover:scale-110 transition-all duration-200 hover:text-blue-400"
                >
                  <ChatBubbleOvalLeftIcon className="w-8 h-8" />
                </button>
                <span className="text-white text-xs font-medium">
                  {reel.comments > 999 ? `${(reel.comments / 1000).toFixed(1)}K` : reel.comments}
                </span>
              </div>

              {/* Share button */}
              <div className="flex flex-col items-center">
                <button 
                  onClick={() => handleShare(reel)}
                  className="text-white mb-1 hover:scale-110 transition-all duration-200 hover:text-green-400"
                >
                  <PaperAirplaneIcon className="w-8 h-8" />
                </button>
              </div>

              {/* Bookmark button */}
              <div className="flex flex-col items-center">
                <button
                  onClick={() => handleBookmark(reel.id)}
                  className="text-white mb-1 hover:scale-110 transition-all duration-200"
                >
                  {reel.isBookmarked ? (
                    <BookmarkSolidIcon className="w-8 h-8 text-yellow-400" />
                  ) : (
                    <BookmarkIcon className="w-8 h-8 hover:text-yellow-400" />
                  )}
                </button>
              </div>

              {/* More options */}
              <div className="flex flex-col items-center">
                <button className="text-white hover:scale-110 transition-all duration-200">
                  <EllipsisHorizontalIcon className="w-8 h-8" />
                </button>
              </div>

              {/* Profile picture as music disc */}
              <div className={`w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full border-2 border-white ${isPlaying ? 'animate-spin' : ''} transition-all duration-300`}>
                <div className="w-full h-full rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {reel.user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Navigation buttons */}
          {index > 0 && (
            <button
              onClick={() => handleScroll('up')}
              className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-black bg-opacity-30 rounded-full p-2 text-white hover:bg-opacity-50 transition-all duration-200"
            >
              <ArrowUpIcon className="w-6 h-6" />
            </button>
          )}
          {index < reels.length - 1 && (
            <button
              onClick={() => handleScroll('down')}
              className="absolute bottom-1/2 left-4 transform translate-y-1/2 bg-black bg-opacity-30 rounded-full p-2 text-white hover:bg-opacity-50 transition-all duration-200"
            >
              <ArrowDownIcon className="w-6 h-6" />
            </button>
          )}
        </div>
      ))}

      {/* Comments Modal */}
      {showComments && selectedReel && (
        <CommentsModal
          post={selectedReel}
          isOpen={showComments}
          onClose={() => setShowComments(false)}
        />
      )}

      {/* Share Modal */}
      {showShare && selectedReel && (
        <ShareModal
          post={selectedReel}
          isOpen={showShare}
          onClose={() => setShowShare(false)}
        />
      )}
    </div>
    </>
  );
};

export default Reels;
