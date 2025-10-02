import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const cleanupExpiredStories = async () => {
  try {
    console.log('🧹 Starting story cleanup...');
    
    const now = new Date();
    
    // Find expired stories
    const expiredStories = await prisma.story.findMany({
      where: {
        expiresAt: {
          lt: now
        }
      },
      include: {
        author: {
          select: {
            username: true
          }
        }
      }
    });
    
    if (expiredStories.length === 0) {
      console.log('✅ No expired stories to clean up');
      return { cleaned: 0 };
    }
    
    console.log(`🗑️ Found ${expiredStories.length} expired stories to delete`);
    
    // Delete expired stories and their views
    const deleteResult = await prisma.story.deleteMany({
      where: {
        expiresAt: {
          lt: now
        }
      }
    });
    
    console.log(`✅ Cleaned up ${deleteResult.count} expired stories`);
    
    // Log which stories were deleted
    expiredStories.forEach(story => {
      console.log(`   - Deleted story by ${story.author.username} (expired: ${story.expiresAt})`);
    });
    
    return { cleaned: deleteResult.count };
  } catch (error) {
    console.error('❌ Error cleaning up expired stories:', error);
    throw error;
  }
};

// Run cleanup every hour
export const startStoryCleanupScheduler = () => {
  console.log('⏰ Starting story cleanup scheduler (runs every hour)');
  
  // Run immediately on startup
  cleanupExpiredStories().catch(console.error);
  
  // Then run every hour
  setInterval(() => {
    cleanupExpiredStories().catch(console.error);
  }, 60 * 60 * 1000); // 1 hour in milliseconds
};
