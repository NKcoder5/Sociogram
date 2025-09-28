import prisma from "./prisma.js";

const connectDB = async () => {
    try {
        // Test the connection
        await prisma.$connect();
        
        // Verify connection with a simple query
        await prisma.$queryRaw`SELECT 1`;
        
        console.log('✅ PostgreSQL connected successfully...');
        console.log(`📊 Database URL: ${process.env.DATABASE_URL ? 'Configured' : 'Missing'}`);
        
    } catch (error) {
        console.error('❌ Database connection error:', error.message);
        
        // Log helpful debugging info
        if (!process.env.DATABASE_URL) {
            console.error('🚨 DATABASE_URL environment variable is not set!');
            console.error('💡 Please configure DATABASE_URL in your environment variables');
        }
        
        // Don't exit the process, let the app continue without DB
        console.log('⚠️  Server will continue without database connection');
    }
}

export default connectDB;