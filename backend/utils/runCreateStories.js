import { createStoriesFromPosts } from './createStories.js';

async function main() {
  try {
    console.log('🎬 Starting story creation process...');
    const result = await createStoriesFromPosts();
    console.log('✅ Story creation completed successfully!');
    console.log(`📊 Total stories created: ${result.storiesCreated}`);
  } catch (error) {
    console.error('❌ Story creation failed:', error);
    process.exit(1);
  }
}

main();
