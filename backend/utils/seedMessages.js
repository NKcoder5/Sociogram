import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

const sampleMessages = [
  "Hey! How are you doing?",
  "I'm doing great, thanks for asking!",
  "That's awesome! What have you been up to lately?",
  "Just working on some new projects. How about you?",
  "Same here! We should catch up soon 😊",
  "Absolutely! Let's plan something",
  "Did you see the latest post I shared?",
  "Yes! It was amazing 🔥",
  "Thanks! I really appreciate the support",
  "Always happy to support great content!",
  "Hope you're having a wonderful day!",
  "You too! Thanks for the kind words",
  "Looking forward to our next conversation",
  "Me too! Take care 👋"
];

async function seedMessages() {
  try {
    console.log('🌱 Starting messages seeding...');

    // Get all users
    const users = await prisma.user.findMany();
    
    if (users.length < 2) {
      console.log('Not enough users to create conversations');
      return;
    }

    let conversationsCreated = 0;
    let messagesCreated = 0;

    // Create conversations between random pairs of users
    const conversationPairs = [
      ['john_doe', 'jane_smith'],
      ['john_doe', 'alex_wilson'],
      ['jane_smith', 'sarah_jones'],
      ['alex_wilson', 'mike_brown'],
      ['sarah_jones', 'emma_davis'],
      ['mike_brown', 'david_miller'],
      ['emma_davis', 'lisa_garcia'],
      ['david_miller', 'carlos_rodriguez']
    ];

    for (const [user1Username, user2Username] of conversationPairs) {
      const user1 = users.find(u => u.username === user1Username);
      const user2 = users.find(u => u.username === user2Username);
      
      if (!user1 || !user2) continue;

      try {
        // Create conversation
        const conversation = await prisma.conversation.create({
          data: {
            isGroup: false,
            participants: {
              create: [
                { userId: user1.id },
                { userId: user2.id }
              ]
            }
          }
        });

        conversationsCreated++;
        console.log(`💬 Created conversation between ${user1.username} and ${user2.username}`);

        // Add 3-7 messages to this conversation
        const numMessages = Math.floor(Math.random() * 5) + 3; // 3-7 messages
        const shuffledMessages = sampleMessages.sort(() => 0.5 - Math.random()).slice(0, numMessages);

        for (let i = 0; i < shuffledMessages.length; i++) {
          const sender = i % 2 === 0 ? user1 : user2;
          const receiver = i % 2 === 0 ? user2 : user1;
          
          await prisma.message.create({
            data: {
              content: shuffledMessages[i],
              senderId: sender.id,
              receiverId: receiver.id,
              conversationId: conversation.id,
              messageType: 'text',
              createdAt: new Date(Date.now() - (shuffledMessages.length - i) * 60000) // Spread messages over time
            }
          });
          messagesCreated++;
        }

        // Update conversation timestamp
        await prisma.conversation.update({
          where: { id: conversation.id },
          data: { updatedAt: new Date() }
        });

      } catch (error) {
        console.error(`Error creating conversation between ${user1Username} and ${user2Username}:`, error);
      }
    }

    console.log(`✅ Created ${conversationsCreated} conversations with ${messagesCreated} messages`);
    
  } catch (error) {
    console.error('❌ Error seeding messages:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

seedMessages()
  .then(() => {
    console.log('✅ Messages seeding completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Error:', error);
    process.exit(1);
  });
