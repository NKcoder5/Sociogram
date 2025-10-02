import express from 'express';
import { seedDatabaseImproved as seedDatabase } from '../utils/seedDataImproved.js';
import { seedConversationsAndFollows } from '../utils/seedConversations.js';

const router = express.Router();

router.post('/seed', async (req, res) => {
  try {
    const result = await seedDatabase();
    res.status(200).json({
      success: true,
      message: 'Database seeded successfully',
      data: {
        usersCreated: result.users.length,
        postsCreated: result.posts.length
      }
    });
  } catch (error) {
    console.error('Seed route error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to seed database',
      error: error.message
    });
  }
});

router.post('/seed-conversations', async (req, res) => {
  try {
    await seedConversationsAndFollows();
    res.status(200).json({
      success: true,
      message: 'Conversations and follows seeded successfully'
    });
  } catch (error) {
    console.error('Seed conversations route error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to seed conversations and follows',
      error: error.message
    });
  }
});

export default router;
