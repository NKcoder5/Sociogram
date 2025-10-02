import sharp from "sharp";
import cloudinary from "../utils/cloudinary.js";
import prisma from "../utils/prisma.js";

export const createStory = async (req, res) => {
  try {
    const userId = req.id;
    const media = req.file;
    const { text, duration = 24 } = req.body; // Duration in hours

    if (!media && !text) {
      return res.status(400).json({
        message: 'Either media or text is required for a story',
        success: false
      });
    }

    let mediaUrl = null;
    let mediaType = 'text';

    // Process media if provided
    if (media) {
      try {
        let processedBuffer;
        
        // Determine media type
        if (media.mimetype.startsWith('image/')) {
          mediaType = 'image';
          processedBuffer = await sharp(media.buffer)
            .resize({ width: 1080, height: 1920, fit: 'cover' })
            .toFormat('jpeg', { quality: 85 })
            .toBuffer();
        } else if (media.mimetype.startsWith('video/')) {
          mediaType = 'video';
          processedBuffer = media.buffer; // For now, upload video as-is
        } else {
          return res.status(400).json({
            message: 'Unsupported media type',
            success: false
          });
        }

        // Upload to Cloudinary
        const uploadResult = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              resource_type: mediaType === 'video' ? 'video' : 'image',
              folder: 'sociogram/stories',
              transformation: mediaType === 'image' ? [
                { width: 1080, height: 1920, crop: 'fill' }
              ] : undefined
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(processedBuffer);
        });

        mediaUrl = uploadResult.secure_url;
      } catch (error) {
        console.error('Media processing error:', error);
        return res.status(500).json({
          message: 'Failed to process media',
          success: false
        });
      }
    }

    // Calculate expiry time
    const expiresAt = new Date(Date.now() + duration * 60 * 60 * 1000);

    // Create story in database
    const story = await prisma.story.create({
      data: {
        authorId: userId,
        mediaUrl,
        mediaType,
        text: text || null,
        expiresAt
      },
      include: {
        author: {
          select: {
            id: true,
            username: true,
            profilePicture: true
          }
        }
      }
    });

    return res.status(201).json({
      message: 'Story created successfully',
      story,
      success: true
    });
  } catch (error) {
    console.error('Error creating story:', error);
    return res.status(500).json({
      message: 'Failed to create story',
      success: false
    });
  }
};

export const getStories = async (req, res) => {
  try {
    const userId = req.id;
    console.log('📖 Fetching stories for user:', userId);

    // Simplified query - get all non-expired stories for now
    const stories = await prisma.story.findMany({
      where: {
        expiresAt: {
          gt: new Date()
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
        views: {
          where: {
            userId: userId
          }
        },
        _count: {
          select: {
            views: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    console.log('📖 Found', stories.length, 'stories');

    // Group stories by user
    const groupedStories = stories.reduce((acc, story) => {
      const authorId = story.author.id;
      if (!acc[authorId]) {
        acc[authorId] = {
          user: story.author,
          stories: [],
          hasUnviewed: false,
          isOwn: authorId === userId
        };
      }
      
      const isViewed = story.views.length > 0;
      acc[authorId].stories.push({
        ...story,
        isViewed,
        viewCount: story._count.views
      });
      
      if (!isViewed) {
        acc[authorId].hasUnviewed = true;
      }
      
      return acc;
    }, {});

    // Convert to array and sort (own stories first, then by unviewed status)
    const storyGroups = Object.values(groupedStories).sort((a, b) => {
      if (a.isOwn && !b.isOwn) return -1;
      if (!a.isOwn && b.isOwn) return 1;
      if (a.hasUnviewed && !b.hasUnviewed) return -1;
      if (!a.hasUnviewed && b.hasUnviewed) return 1;
      return 0;
    });

    return res.status(200).json({
      storyGroups,
      success: true
    });
  } catch (error) {
    console.error('Error fetching stories:', error);
    return res.status(500).json({
      message: 'Failed to fetch stories',
      success: false
    });
  }
};

export const getUserStories = async (req, res) => {
  try {
    const { userId: targetUserId } = req.params;
    const currentUserId = req.id;

    // Check if user can view these stories (following or own)
    const canView = targetUserId === currentUserId || await prisma.follow.findFirst({
      where: {
        followerId: currentUserId,
        followingId: targetUserId
      }
    });

    if (!canView) {
      return res.status(403).json({
        message: 'You cannot view this user\'s stories',
        success: false
      });
    }

    const stories = await prisma.story.findMany({
      where: {
        authorId: targetUserId,
        expiresAt: {
          gt: new Date()
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
        views: {
          where: {
            userId: currentUserId
          }
        },
        _count: {
          select: {
            views: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    const storiesWithStatus = stories.map(story => ({
      ...story,
      isViewed: story.views.length > 0,
      viewCount: story._count.views
    }));

    return res.status(200).json({
      stories: storiesWithStatus,
      user: stories[0]?.author || null,
      success: true
    });
  } catch (error) {
    console.error('Error fetching user stories:', error);
    return res.status(500).json({
      message: 'Failed to fetch user stories',
      success: false
    });
  }
};

export const markStoryAsViewed = async (req, res) => {
  try {
    const { storyId } = req.params;
    const userId = req.id;

    // Check if story exists and is not expired
    const story = await prisma.story.findFirst({
      where: {
        id: storyId,
        expiresAt: {
          gt: new Date()
        }
      }
    });

    if (!story) {
      return res.status(404).json({
        message: 'Story not found or expired',
        success: false
      });
    }

    // Don't track views for own stories
    if (story.authorId === userId) {
      return res.status(200).json({
        message: 'Own story view not tracked',
        success: true
      });
    }

    // Create or update view record
    await prisma.storyView.upsert({
      where: {
        storyId_userId: {
          storyId,
          userId
        }
      },
      update: {
        viewedAt: new Date()
      },
      create: {
        storyId,
        userId,
        viewedAt: new Date()
      }
    });

    return res.status(200).json({
      message: 'Story marked as viewed',
      success: true
    });
  } catch (error) {
    console.error('Error marking story as viewed:', error);
    return res.status(500).json({
      message: 'Failed to mark story as viewed',
      success: false
    });
  }
};

export const deleteStory = async (req, res) => {
  try {
    const { storyId } = req.params;
    const userId = req.id;

    // Check if story exists and belongs to user
    const story = await prisma.story.findFirst({
      where: {
        id: storyId,
        authorId: userId
      }
    });

    if (!story) {
      return res.status(404).json({
        message: 'Story not found or you don\'t have permission to delete it',
        success: false
      });
    }

    // Delete story views first
    await prisma.storyView.deleteMany({
      where: {
        storyId
      }
    });

    // Delete story
    await prisma.story.delete({
      where: {
        id: storyId
      }
    });

    // TODO: Delete media from Cloudinary if needed

    return res.status(200).json({
      message: 'Story deleted successfully',
      success: true
    });
  } catch (error) {
    console.error('Error deleting story:', error);
    return res.status(500).json({
      message: 'Failed to delete story',
      success: false
    });
  }
};
