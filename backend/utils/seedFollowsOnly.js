import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const seedFollowsOnly = async () => {
  try {
    console.log('Starting follows seeding...');

    // Get all users
    const users = await prisma.user.findMany();
    
    if (users.length < 2) {
      console.log('Not enough users to create follows');
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
      ['lisa_garcia', 'kevin_chen'],
      ['carlos_rodriguez', 'zara_ahmed'],
      ['james_taylor', 'ethan_clark'],
      ['priya_patel', 'chloe_dubois'],
      ['maria_gonzalez', 'jackson_brooks'],
      ['kevin_chen', 'valentina_rossi']
    ];

    // Create follows
    let followsCreated = 0;
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
          followsCreated++;
        } catch (error) {
          // Ignore duplicate follow errors
          if (!error.message.includes('Unique constraint')) {
            console.error('Follow creation error:', error);
          }
        }
      }
    }

    console.log(`✅ Created ${followsCreated} follow relationships`);
    
  } catch (error) {
    console.error('Error seeding follows:', error);
    throw error;
  }
};

// Run if called directly
console.log('Starting follows seeding script...');
if (import.meta.url === `file://${process.argv[1]}`) {
  seedFollowsOnly()
    .then(() => {
      console.log('✅ Follows seeding completed!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error:', error);
      process.exit(1);
    });
}
