import { seedFollowsOnly } from './seedFollowsOnly.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

async function runFollows() {
  try {
    console.log('🌱 Starting follows seeding...');
    await seedFollowsOnly();
    console.log('✅ Follows seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during follows seeding:', error);
    process.exit(1);
  }
}

runFollows();
