import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

const notificationTypes = ['like', 'comment', 'follow'];
const notificationMessages = {
  like: [
    'liked your post',
    'loved your photo',
    'liked your content'
  ],
  comment: [
    'commented on your post',
    'left a comment on your photo',
    'replied to your post'
  ],
  follow: [
    'started following you',
    'is now following you',
    'followed you'
  ]
};

async function seedNotifications() {
  try {
    console.log('🌱 Starting notifications seeding...');

    // Get all users and posts
    const users = await prisma.user.findMany();
    const posts = await prisma.post.findMany();
    
    if (users.length < 2) {
      console.log('Not enough users to create notifications');
      return;
    }

    let notificationsCreated = 0;

    // Create notifications for each user (they receive notifications)
    for (const receiver of users.slice(0, 10)) { // Limit to first 10 users to avoid too many notifications
      const numNotifications = Math.floor(Math.random() * 8) + 3; // 3-10 notifications per user
      
      for (let i = 0; i < numNotifications; i++) {
        // Pick a random sender (different from receiver)
        const availableSenders = users.filter(u => u.id !== receiver.id);
        const sender = availableSenders[Math.floor(Math.random() * availableSenders.length)];
        
        // Pick random notification type
        const type = notificationTypes[Math.floor(Math.random() * notificationTypes.length)];
        const messages = notificationMessages[type];
        const message = `${sender.username} ${messages[Math.floor(Math.random() * messages.length)]}`;
        
        // For like and comment notifications, pick a random post
        let postId = null;
        if ((type === 'like' || type === 'comment') && posts.length > 0) {
          const randomPost = posts[Math.floor(Math.random() * posts.length)];
          postId = randomPost.id;
        }
        
        try {
          await prisma.notification.create({
            data: {
              senderId: sender.id,
              receiverId: receiver.id,
              type,
              message,
              postId,
              isRead: Math.random() > 0.6 // 40% chance of being read
            }
          });
          notificationsCreated++;
        } catch (error) {
          console.error('Notification creation error:', error);
        }
      }
    }

    console.log(`✅ Created ${notificationsCreated} notifications for users`);
    
  } catch (error) {
    console.error('❌ Error seeding notifications:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedNotifications()
  .then(() => {
    console.log('✅ Notifications seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
