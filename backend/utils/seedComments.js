import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

const sampleComments = [
  "Amazing! 😍",
  "Love this! ❤️",
  "So cool! 🔥",
  "Great work! 👏",
  "Incredible! ✨",
  "This is awesome! 🙌",
  "Beautiful! 😊",
  "Nice shot! 📸",
  "Wow! 🤩",
  "Perfect! 💯",
  "So inspiring! 💪",
  "Love the colors! 🎨",
  "This made my day! ☀️",
  "Stunning! 🌟",
  "Keep it up! 🚀",
  "Absolutely gorgeous! 💖",
  "This is so good! 👌",
  "Amazing work! 🎯",
  "Love the vibe! ✌️",
  "So talented! 🎭",
  "This is everything! 🌈",
  "Pure magic! ✨",
  "Obsessed with this! 😍",
  "Goals! 🎯",
  "This is art! 🎨"
];

async function seedComments() {
  try {
    console.log('🌱 Starting comments seeding...');

    // Get all users and posts
    const users = await prisma.user.findMany();
    const posts = await prisma.post.findMany();
    
    if (users.length < 2 || posts.length < 1) {
      console.log('Not enough users or posts to create comments');
      return;
    }

    let commentsCreated = 0;

    // Create random comments - each post gets 1-5 comments from random users
    for (const post of posts) {
      const numComments = Math.floor(Math.random() * 5) + 1; // 1-5 comments
      const shuffledUsers = users.sort(() => 0.5 - Math.random());
      
      for (let i = 0; i < Math.min(numComments, users.length); i++) {
        const user = shuffledUsers[i];
        
        // Don't let users comment on their own posts (sometimes)
        if (user.id === post.authorId && Math.random() > 0.3) continue;
        
        try {
          const randomComment = sampleComments[Math.floor(Math.random() * sampleComments.length)];
          
          await prisma.comment.create({
            data: {
              text: randomComment,
              authorId: user.id,
              postId: post.id
            }
          });
          commentsCreated++;
        } catch (error) {
          console.error('Comment creation error:', error);
        }
      }
    }

    console.log(`✅ Created ${commentsCreated} comments across ${posts.length} posts`);
    
  } catch (error) {
    console.error('❌ Error seeding comments:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedComments()
  .then(() => {
    console.log('✅ Comments seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
