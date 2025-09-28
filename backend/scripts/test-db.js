import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});

async function testDatabaseConnection() {
  try {
    console.log('🔍 Testing database connection...');
    console.log(`📊 Database URL: ${process.env.DATABASE_URL ? 'Configured' : 'Missing'}`);
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connection successful!');
    
    // Test simple query
    const result = await prisma.$queryRaw`SELECT 1 as test`;
    console.log('✅ Database query test successful:', result);
    
    // Check if tables exist
    try {
      const userCount = await prisma.user.count();
      console.log(`📊 Users in database: ${userCount}`);
      
      const postCount = await prisma.post.count();
      console.log(`📊 Posts in database: ${postCount}`);
      
      const messageCount = await prisma.message.count();
      console.log(`📊 Messages in database: ${messageCount}`);
      
    } catch (error) {
      console.log('⚠️  Tables not found - database needs migration');
      console.log('💡 Run: npx prisma db push');
    }
    
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    
    if (!process.env.DATABASE_URL) {
      console.error('🚨 DATABASE_URL environment variable is not set!');
    }
    
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the test
testDatabaseConnection();
