import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function testNotifications() {
  try {
    console.log('🧪 Testing notifications functionality...');

    // Get a test user
    const testUser = await prisma.user.findFirst({
      where: { email: 'john@example.com' }
    });

    if (!testUser) {
      console.log('❌ Test user not found');
      return;
    }

    console.log(`📧 Testing with user: ${testUser.username} (${testUser.email})`);

    // Test 1: Get notifications count
    const notificationsCount = await prisma.notification.count({
      where: { receiverId: testUser.id }
    });
    console.log(`📊 Total notifications for ${testUser.username}: ${notificationsCount}`);

    // Test 2: Get unread notifications count
    const unreadCount = await prisma.notification.count({
      where: { receiverId: testUser.id, isRead: false }
    });
    console.log(`🔔 Unread notifications: ${unreadCount}`);

    // Test 3: Get recent notifications
    const recentNotifications = await prisma.notification.findMany({
      where: { receiverId: testUser.id },
      include: {
        sender: {
          select: { id: true, username: true, profilePicture: true }
        },
        post: {
          select: { id: true, caption: true, image: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 5
    });

    console.log(`📋 Recent notifications (${recentNotifications.length}):`);
    recentNotifications.forEach((notif, index) => {
      console.log(`  ${index + 1}. ${notif.message} (${notif.type}) - ${notif.isRead ? 'Read' : 'Unread'}`);
    });

    console.log('✅ Notifications functionality test completed!');
    
  } catch (error) {
    console.error('❌ Error testing notifications:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

testNotifications()
  .then(() => {
    console.log('✅ Test completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
