import { seedDatabase } from './seedData.js';
import { seedConversationsAndFollows } from './seedConversations.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function runFullSeed() {
  try {
    console.log('🌱 Starting complete database seeding...');
    
    // Step 1: Seed users and posts
    console.log('📝 Seeding users and posts...');
    await seedDatabase();
    
    // Step 2: Seed conversations and follows
    console.log('💬 Seeding conversations and follows...');
    await seedConversationsAndFollows();
    
    console.log('✅ Complete database seeding finished successfully!');
    console.log('🎉 Your Sociogram database is now fully populated with:');
    console.log('   - 48 diverse users with unique profiles');
    console.log('   - 42 posts with images and captions');
    console.log('   - Follow relationships between users');
    console.log('   - Conversation threads with sample messages');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during complete seeding:', error);
    process.exit(1);
  }
}

runFullSeed();
