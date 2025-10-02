import { seedDatabaseImproved } from './seedDataImproved.js';

const runSeed = async () => {
  try {
    console.log('🚀 Starting improved database seeding process...');
    await seedDatabaseImproved();
    console.log('✅ Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
};

runSeed();
