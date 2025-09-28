import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const seedConversationsAndFollows = async () => {
  try {
    console.log('Starting conversations and follows seeding...');

    // Get all users
    const users = await prisma.user.findMany();
    
    if (users.length < 2) {
      console.log('Not enough users to create conversations');
      return;
    }

    // Create some follow relationships
    const followPairs = [
      ['john_doe', 'jane_smith'],
      ['john_doe', 'alex_wilson'],
      ['john_doe', 'sarah_jones'],
      ['john_doe', 'mike_brown'],
      ['jane_smith', 'john_doe'],
      ['jane_smith', 'emma_davis'],
      ['jane_smith', 'david_miller'],
      ['alex_wilson', 'john_doe'],
      ['alex_wilson', 'lisa_garcia'],
      ['sarah_jones', 'john_doe'],
      ['sarah_jones', 'carlos_rodriguez'],
      ['mike_brown', 'priya_patel'],
      ['emma_davis', 'james_taylor'],
      ['david_miller', 'maria_gonzalez'],
      ['lisa_garcia', 'kevin_chen']
    ];

    // Create follows
    for (const [followerUsername, followingUsername] of followPairs) {
      const follower = users.find(u => u.username === followerUsername);
      const following = users.find(u => u.username === followingUsername);
      
      if (follower && following) {
        try {
          await prisma.follow.create({
            data: {
              followerId: follower.id,
              followingId: following.id
            }
          });
          console.log(`${followerUsername} is now following ${followingUsername}`);
        } catch (error) {
          // Ignore duplicate follow errors
          if (!error.message.includes('Unique constraint')) {
            console.error('Follow creation error:', error);
          }
        }
      }
    }

    // Create some conversations
    const conversationPairs = [
      ['john_doe', 'jane_smith'],
      ['john_doe', 'alex_wilson'],
      ['john_doe', 'sarah_jones'],
      ['jane_smith', 'emma_davis'],
      ['alex_wilson', 'lisa_garcia'],
      ['sarah_jones', 'carlos_rodriguez'],
      ['mike_brown', 'priya_patel'],
      ['david_miller', 'maria_gonzalez']
    ];

    for (const [user1Username, user2Username] of conversationPairs) {
      const user1 = users.find(u => u.username === user1Username);
      const user2 = users.find(u => u.username === user2Username);
      
      if (user1 && user2) {
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

        // Add some sample messages
        const sampleMessages = [
          `Hey ${user2.username}! How are you doing?`,
          `Hi ${user1.username}! I'm doing great, thanks for asking!`,
          `That's awesome! What have you been up to lately?`,
          `Just working on some new projects. How about you?`,
          `Same here! We should catch up soon 😊`
        ];

        for (let i = 0; i < sampleMessages.length; i++) {
          const senderId = i % 2 === 0 ? user1.id : user2.id;
          await prisma.message.create({
            data: {
              content: sampleMessages[i],
              senderId,
              conversationId: conversation.id,
              createdAt: new Date(Date.now() - (sampleMessages.length - i) * 60000) // Messages 1 minute apart
            }
          });
        }

        console.log(`Created conversation between ${user1Username} and ${user2Username} with ${sampleMessages.length} messages`);
      }
    }

    console.log('Conversations and follows seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding conversations and follows:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};
