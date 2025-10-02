import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addSampleInteractions() {
  try {
    console.log('🚀 Adding sample interactions to posts...');
    
    // Get all users and posts
    const users = await prisma.user.findMany({
      select: { id: true, username: true }
    });
    
    const posts = await prisma.post.findMany({
      select: { id: true, authorId: true },
      take: 20 // Work with first 20 posts
    });
    
    console.log(`👥 Found ${users.length} users and ${posts.length} posts`);
    
    let likesAdded = 0;
    let commentsAdded = 0;
    
    // Add likes to posts
    for (const post of posts) {
      // Each post gets 2-5 random likes from different users (not the author)
      const otherUsers = users.filter(user => user.id !== post.authorId);
      const numLikes = Math.floor(Math.random() * 4) + 2; // 2-5 likes
      const likingUsers = otherUsers
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.min(numLikes, otherUsers.length));
      
      for (const user of likingUsers) {
        try {
          await prisma.like.create({
            data: {
              userId: user.id,
              postId: post.id
            }
          });
          likesAdded++;
        } catch (error) {
          // Skip if like already exists
        }
      }
    }
    
    // Add comments to some posts
    const commentTemplates = [
      "Amazing post! 🔥",
      "Love this! ❤️",
      "Great content! 👏",
      "This is awesome! 🚀",
      "Beautiful! 😍",
      "So inspiring! ✨",
      "Perfect! 💯",
      "Incredible work! 🎨",
      "This made my day! 😊",
      "Absolutely stunning! 🌟"
    ];
    
    // Add comments to first 10 posts
    for (let i = 0; i < Math.min(10, posts.length); i++) {
      const post = posts[i];
      const otherUsers = users.filter(user => user.id !== post.authorId);
      const numComments = Math.floor(Math.random() * 3) + 1; // 1-3 comments
      const commentingUsers = otherUsers
        .sort(() => Math.random() - 0.5)
        .slice(0, Math.min(numComments, otherUsers.length));
      
      for (const user of commentingUsers) {
        const randomComment = commentTemplates[Math.floor(Math.random() * commentTemplates.length)];
        try {
          await prisma.comment.create({
            data: {
              text: randomComment,
              authorId: user.id,
              postId: post.id
            }
          });
          commentsAdded++;
        } catch (error) {
          console.error('Error adding comment:', error);
        }
      }
    }
    
    console.log(`✅ Added ${likesAdded} likes and ${commentsAdded} comments`);
    console.log('🎉 Sample interactions added successfully!');
    
  } catch (error) {
    console.error('❌ Error adding interactions:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addSampleInteractions();
