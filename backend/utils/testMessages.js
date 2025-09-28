import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function testMessaging() {
  try {
    console.log('🧪 Testing messaging functionality...');

    // Test 1: Check if required tables exist
    console.log('📊 Checking database tables...');
    
    try {
      const conversationsCount = await prisma.conversation.count();
      console.log(`✅ Conversations table exists: ${conversationsCount} records`);
    } catch (error) {
      console.log(`❌ Conversations table error: ${error.message}`);
    }

    try {
      const messagesCount = await prisma.message.count();
      console.log(`✅ Messages table exists: ${messagesCount} records`);
    } catch (error) {
      console.log(`❌ Messages table error: ${error.message}`);
    }

    try {
      const participantsCount = await prisma.conversationParticipant.count();
      console.log(`✅ ConversationParticipant table exists: ${participantsCount} records`);
    } catch (error) {
      console.log(`❌ ConversationParticipant table error: ${error.message}`);
    }

    // Test 2: Get test users
    const users = await prisma.user.findMany({ take: 2 });
    if (users.length < 2) {
      console.log('❌ Need at least 2 users for messaging test');
      return;
    }

    const [user1, user2] = users;
    console.log(`👥 Test users: ${user1.username} (${user1.id}) and ${user2.username} (${user2.id})`);

    // Test 3: Try to find existing conversation
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId: user1.id } } },
          { participants: { some: { userId: user2.id } } },
          { isGroup: false }
        ]
      },
      include: {
        participants: {
          include: {
            user: { select: { id: true, username: true } }
          }
        }
      }
    });

    if (existingConversation) {
      console.log(`💬 Found existing conversation: ${existingConversation.id}`);
      console.log(`   Participants: ${existingConversation.participants.map(p => p.user.username).join(', ')}`);
    } else {
      console.log('💬 No existing conversation found between test users');
    }

    // Test 4: Check message schema
    try {
      const sampleMessage = await prisma.message.findFirst({
        include: {
          sender: { select: { id: true, username: true } },
          receiver: { select: { id: true, username: true } }
        }
      });
      
      if (sampleMessage) {
        console.log('📝 Sample message structure:');
        console.log(`   ID: ${sampleMessage.id}`);
        console.log(`   Content: ${sampleMessage.content}`);
        console.log(`   Sender: ${sampleMessage.sender?.username || 'N/A'}`);
        console.log(`   Receiver: ${sampleMessage.receiver?.username || 'N/A'}`);
        console.log(`   ConversationId: ${sampleMessage.conversationId}`);
        console.log(`   MessageType: ${sampleMessage.messageType}`);
      } else {
        console.log('📝 No messages found in database');
      }
    } catch (error) {
      console.log(`❌ Message query error: ${error.message}`);
    }

    console.log('✅ Messaging functionality test completed!');
    
  } catch (error) {
    console.error('❌ Error testing messaging:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

testMessaging()
  .then(() => {
    console.log('✅ Test completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Test failed:', error);
    process.exit(1);
  });
