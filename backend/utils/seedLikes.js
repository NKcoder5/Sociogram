import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function seedLikes() {
  try {
    console.log('🌱 Starting likes seeding...');

    // Get all users and posts
    const users = await prisma.user.findMany();
    const posts = await prisma.post.findMany();
    
    if (users.length < 2 || posts.length < 1) {
      console.log('Not enough users or posts to create likes');
      return;
    }

    let likesCreated = 0;

    // Create random likes - each post gets 2-8 likes from random users
    for (const post of posts) {
      const numLikes = Math.floor(Math.random() * 7) + 2; // 2-8 likes
      const shuffledUsers = users.sort(() => 0.5 - Math.random());
      
      for (let i = 0; i < Math.min(numLikes, users.length); i++) {
        const user = shuffledUsers[i];
        
        // Don't let users like their own posts
        if (user.id === post.authorId) continue;
        
        try {
          await prisma.like.create({
            data: {
              userId: user.id,
              postId: post.id
            }
          });
          likesCreated++;
        } catch (error) {
          // Ignore duplicate like errors
          if (!error.message.includes('Unique constraint')) {
            console.error('Like creation error:', error);
          }
        }
      }
    }

    console.log(`✅ Created ${likesCreated} likes across ${posts.length} posts`);
    
  } catch (error) {
    console.error('❌ Error seeding likes:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedLikes()
  .then(() => {
    console.log('✅ Likes seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
