import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const createStoriesFromPosts = async () => {
  try {
    console.log('🎬 Creating stories from existing posts...');

    // Get all users
    const users = await prisma.user.findMany({
      include: {
        posts: {
          take: 3, // Get up to 3 posts per user
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    console.log(`Found ${users.length} users`);

    let storiesCreated = 0;

    for (const user of users) {
      // Create 1-2 stories per user if they have posts
      if (user.posts.length > 0) {
        const numStories = Math.floor(Math.random() * 2) + 1; // 1-2 stories
        
        for (let i = 0; i < Math.min(numStories, user.posts.length); i++) {
          const post = user.posts[i];
          
          // Create story expiring in 24 hours
          const expiresAt = new Date();
          expiresAt.setHours(expiresAt.getHours() + 24);
          
          // Create story text based on post caption
          const storyTexts = [
            `Check out my latest! ${post.caption?.split(' ').slice(0, 5).join(' ')}...`,
            `New post is live! 🔥`,
            `Just shared something amazing! ✨`,
            `Don't miss this! 📸`,
            `Fresh content alert! 🚨`,
            `Behind the scenes... 👀`,
            `Story time! 📖`,
            `Quick update! ⚡`
          ];
          
          const storyText = storyTexts[Math.floor(Math.random() * storyTexts.length)];
          
          await prisma.story.create({
            data: {
              authorId: user.id,
              mediaUrl: post.image, // Use post image as story media
              mediaType: 'image',
              text: storyText,
              expiresAt
            }
          });
          
          storiesCreated++;
          console.log(`Created story for ${user.username}: "${storyText}"`);
        }
      }
    }

    console.log(`✅ Created ${storiesCreated} stories from real users!`);
    return { success: true, storiesCreated };
  } catch (error) {
    console.error('❌ Error creating stories:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

export { createStoriesFromPosts };
