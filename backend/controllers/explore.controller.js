import prisma from "../utils/prisma.js";

export const getExplorePosts = async (req, res) => {
  try {
    const userId = req.id;
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    // Get posts from users not followed by current user, ordered by engagement
    const posts = await prisma.post.findMany({
      where: {
        author: {
          followers: {
            none: {
              followerId: userId
            }
          }
        },
        authorId: {
          not: userId
        }
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            profilePicture: true
          }
        },
        likes: {
          select: {
            userId: true
          }
        },
        comments: {
          select: {
            id: true
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      },
      orderBy: [
        {
          likes: {
            _count: 'desc'
          }
        },
        {
          comments: {
            _count: 'desc'
          }
        },
        {
          createdAt: 'desc'
        }
      ],
      skip: parseInt(skip),
      take: parseInt(limit)
    });

    // Add engagement score and user interaction status
    const postsWithEngagement = posts.map(post => ({
      ...post,
      isLiked: post.likes.some(like => like.userId === userId),
      engagementScore: post._count.likes * 2 + post._count.comments * 3,
      likes: post._count.likes,
      comments: post._count.comments
    }));

    return res.status(200).json({
      posts: postsWithEngagement,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: posts.length === parseInt(limit)
      },
      success: true
    });
  } catch (error) {
    console.error('Error fetching explore posts:', error);
    return res.status(500).json({
      message: 'Failed to fetch explore posts',
      success: false
    });
  }
};

export const getExploreReels = async (req, res) => {
  try {
    const userId = req.id;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Get reels (posts with video content) from non-followed users
    const reels = await prisma.post.findMany({
      where: {
        AND: [
          {
            author: {
              followers: {
                none: {
                  followerId: userId
                }
              }
            }
          },
          {
            authorId: {
              not: userId
            }
          },
          {
            OR: [
              { image: { contains: '.mp4' } },
              { image: { contains: '.mov' } },
              { image: { contains: '.avi' } },
              { caption: { contains: '#reel' } },
              { caption: { contains: '#video' } }
            ]
          }
        ]
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            profilePicture: true
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: parseInt(skip),
      take: parseInt(limit)
    });

    return res.status(200).json({
      reels,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: reels.length === parseInt(limit)
      },
      success: true
    });
  } catch (error) {
    console.error('Error fetching explore reels:', error);
    return res.status(500).json({
      message: 'Failed to fetch explore reels',
      success: false
    });
  }
};

export const getTrendingHashtags = async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Get hashtags from recent posts and count their usage
    const posts = await prisma.post.findMany({
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      },
      select: {
        caption: true
      }
    });

    // Extract hashtags and count them
    const hashtagCounts = {};
    posts.forEach(post => {
      if (post.caption) {
        const hashtags = post.caption.match(/#\w+/g) || [];
        hashtags.forEach(tag => {
          const normalizedTag = tag.toLowerCase();
          hashtagCounts[normalizedTag] = (hashtagCounts[normalizedTag] || 0) + 1;
        });
      }
    });

    // Sort by count and format
    const trendingHashtags = Object.entries(hashtagCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, parseInt(limit))
      .map(([tag, count]) => ({
        tag,
        postCount: count,
        trending: count > 5 // Mark as trending if used more than 5 times
      }));

    return res.status(200).json({
      hashtags: trendingHashtags,
      success: true
    });
  } catch (error) {
    console.error('Error fetching trending hashtags:', error);
    return res.status(500).json({
      message: 'Failed to fetch trending hashtags',
      success: false
    });
  }
};

export const searchPosts = async (req, res) => {
  try {
    const userId = req.id;
    const { q, page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        message: 'Search query is required',
        success: false
      });
    }

    const searchTerm = q.trim();

    const posts = await prisma.post.findMany({
      where: {
        OR: [
          {
            caption: {
              contains: searchTerm,
              mode: 'insensitive'
            }
          },
          {
            author: {
              username: {
                contains: searchTerm,
                mode: 'insensitive'
              }
            }
          }
        ]
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            profilePicture: true
          }
        },
        likes: {
          where: {
            userId: userId
          }
        },
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip: parseInt(skip),
      take: parseInt(limit)
    });

    const postsWithStatus = posts.map(post => ({
      ...post,
      isLiked: post.likes.length > 0,
      likes: post._count.likes,
      comments: post._count.comments
    }));

    return res.status(200).json({
      posts: postsWithStatus,
      query: searchTerm,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        hasMore: posts.length === parseInt(limit)
      },
      success: true
    });
  } catch (error) {
    console.error('Error searching posts:', error);
    return res.status(500).json({
      message: 'Failed to search posts',
      success: false
    });
  }
};

export const getExploreUsers = async (req, res) => {
  try {
    const userId = req.id;
    const { limit = 10 } = req.query;

    // Get users not followed by current user, ordered by follower count
    const users = await prisma.user.findMany({
      where: {
        AND: [
          {
            id: {
              not: userId
            }
          },
          {
            followers: {
              none: {
                followerId: userId
              }
            }
          }
        ]
      },
      select: {
        id: true,
        username: true,
        profilePicture: true,
        bio: true,
        _count: {
          select: {
            followers: true,
            posts: true
          }
        }
      },
      orderBy: {
        followers: {
          _count: 'desc'
        }
      },
      take: parseInt(limit)
    });

    const usersWithStats = users.map(user => ({
      ...user,
      followerCount: user._count.followers,
      postCount: user._count.posts,
      isPopular: user._count.followers > 10
    }));

    return res.status(200).json({
      users: usersWithStats,
      success: true
    });
  } catch (error) {
    console.error('Error fetching explore users:', error);
    return res.status(500).json({
      message: 'Failed to fetch explore users',
      success: false
    });
  }
};
