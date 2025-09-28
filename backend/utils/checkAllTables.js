import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function checkAllTables() {
  try {
    console.log('🔍 Checking all database tables...');

    const tables = [
      'user',
      'post', 
      'comment',
      'like',
      'follow',
      'conversation',
      'conversationParticipant',
      'message',
      'messageRead',
      'messageReaction',
      'notification',
      'groupAdmin',
      'groupSettings',
      'reaction'
    ];

    for (const table of tables) {
      try {
        const count = await prisma[table].count();
        console.log(`✅ ${table}: ${count} records`);
      } catch (error) {
        console.log(`❌ ${table}: ${error.message}`);
      }
    }

    console.log('\n🧪 Testing specific problematic queries...');

    // Test the exact query from sendMessage
    try {
      const testUserId1 = 'cmg443xf50001hgqwvjxqm1cc'; // jane_smith
      const testUserId2 = 'cmg443xst0002hgqw8jmzez15'; // This might not exist

      console.log(`\n🔍 Testing conversation query for users: ${testUserId1} and ${testUserId2}`);
      
      // Check if both users exist
      const user1 = await prisma.user.findUnique({ where: { id: testUserId1 } });
      const user2 = await prisma.user.findUnique({ where: { id: testUserId2 } });
      
      console.log(`User 1 (${testUserId1}): ${user1 ? user1.username : 'NOT FOUND'}`);
      console.log(`User 2 (${testUserId2}): ${user2 ? user2.username : 'NOT FOUND'}`);

      if (!user1 || !user2) {
        console.log('❌ One or both users do not exist - this would cause a 500 error');
      } else {
        console.log('✅ Both users exist');
      }

    } catch (error) {
      console.log(`❌ Error testing conversation query: ${error.message}`);
    }

  } catch (error) {
    console.error('❌ Error checking tables:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkAllTables();
