import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

// Simulate the sendMessage function logic
async function testSendMessage(senderId, receiverId, message) {
  try {
    console.log(`🧪 Testing sendMessage API logic...`);
    console.log(`   Sender: ${senderId}`);
    console.log(`   Receiver: ${receiverId}`);
    console.log(`   Message: "${message}"`);

    // Step 1: Find existing conversation
    console.log('🔍 Looking for existing conversation...');
    let conversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          {
            participants: {
              some: { userId: senderId }
            }
          },
          {
            participants: {
              some: { userId: receiverId }
            }
          },
          { isGroup: false }
        ]
      },
      include: {
        participants: {
          include: {
            user: {
              select: { id: true, username: true, profilePicture: true }
            }
          }
        }
      }
    });

    if (conversation) {
      console.log(`✅ Found existing conversation: ${conversation.id}`);
    } else {
      console.log('📝 Creating new conversation...');
      // Create conversation if it doesn't exist
      conversation = await prisma.conversation.create({
        data: {
          isGroup: false,
          participants: {
            create: [
              { userId: senderId },
              { userId: receiverId }
            ]
          }
        },
        include: {
          participants: {
            include: {
              user: {
                select: { id: true, username: true, profilePicture: true }
              }
            }
          }
        }
      });
      console.log(`✅ Created new conversation: ${conversation.id}`);
    }

    // Step 2: Create message
    console.log('💬 Creating message...');
    const newMessage = await prisma.message.create({
      data: {
        content: message,
        senderId,
        receiverId,
        conversationId: conversation.id,
        messageType: 'text'
      },
      include: {
        sender: {
          select: { id: true, username: true, profilePicture: true }
        },
        receiver: {
          select: { id: true, username: true, profilePicture: true }
        }
      }
    });

    console.log(`✅ Message created: ${newMessage.id}`);

    // Step 3: Update conversation timestamp
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() }
    });

    console.log('✅ Conversation timestamp updated');
    console.log('🎉 Message sending simulation successful!');

    return {
      success: true,
      message: 'Message sent successfully',
      data: newMessage
    };

  } catch (error) {
    console.error('❌ Error in sendMessage simulation:', error);
    return {
      success: false,
      message: 'Internal server error',
      error: error.message
    };
  }
}

async function runTest() {
  try {
    // Get test users
    const users = await prisma.user.findMany({ take: 3 });
    if (users.length < 2) {
      console.log('❌ Need at least 2 users for test');
      return;
    }

    const [sender, receiver] = users;
    console.log(`👥 Test users: ${sender.username} -> ${receiver.username}`);

    // Test the message sending logic
    const result = await testSendMessage(
      sender.id,
      receiver.id,
      "This is a test message from the API simulation!"
    );

    console.log('\n📊 Test Result:', result);

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

runTest();
