import prisma from "./prisma.js";
import bcrypt from "bcryptjs";

export const seedDatabase = async () => {
    try {
        // Clear existing data
        await prisma.reaction.deleteMany();
        await prisma.like.deleteMany();
        await prisma.comment.deleteMany();
        await prisma.post.deleteMany();
        await prisma.follow.deleteMany();
        await prisma.user.deleteMany();

        console.log('🧹 Cleared existing data');

        // Create test users
        const hashedPassword = await bcrypt.hash('password123', 10);
        
        const users = await Promise.all([
            prisma.user.create({
                data: {
                    username: 'john_doe',
                    email: 'john@example.com',
                    password: hashedPassword,
                    bio: 'Software developer 👨‍💻 | Coffee enthusiast ☕ | Travel lover 🌍'
                }
            }),
            prisma.user.create({
                data: {
                    username: 'jane_smith',
                    email: 'jane@example.com',
                    password: hashedPassword,
                    bio: 'UI/UX Designer ✨ | Art lover 🎨 | Nature photographer 📸'
                }
            }),
            prisma.user.create({
                data: {
                    username: 'mike_wilson',
                    email: 'mike@example.com',
                    password: hashedPassword,
                    bio: 'Tech entrepreneur 🚀 | Fitness enthusiast 💪 | Music producer 🎵'
                }
            }),
            prisma.user.create({
                data: {
                    username: 'sarah_johnson',
                    email: 'sarah@example.com',
                    password: hashedPassword,
                    bio: 'Digital marketer 📈 | Food blogger 🍕 | Yoga instructor 🧘‍♀️'
                }
            })
        ]);

        console.log('👥 Created test users');

        // Create follow relationships
        await Promise.all([
            prisma.follow.create({
                data: { followerId: users[0].id, followingId: users[1].id }
            }),
            prisma.follow.create({
                data: { followerId: users[0].id, followingId: users[2].id }
            }),
            prisma.follow.create({
                data: { followerId: users[1].id, followingId: users[0].id }
            }),
            prisma.follow.create({
                data: { followerId: users[2].id, followingId: users[0].id }
            }),
            prisma.follow.create({
                data: { followerId: users[3].id, followingId: users[1].id }
            })
        ]);

        console.log('🤝 Created follow relationships');

        // Create test posts
        const posts = await Promise.all([
            prisma.post.create({
                data: {
                    caption: 'Just finished building an amazing social media platform! 🚀 The UI looks absolutely stunning with modern glass morphism effects and smooth animations. What do you think? #WebDev #SocialMedia #UI',
                    authorId: users[0].id
                }
            }),
            prisma.post.create({
                data: {
                    caption: 'Working on some new design concepts today. Love how gradients and rounded corners can make any interface feel more welcoming! ✨ #Design #UX #Creativity',
                    authorId: users[1].id
                }
            }),
            prisma.post.create({
                data: {
                    caption: 'Starting the day with a great workout! 💪 Nothing beats the feeling of accomplishment after a good gym session. Who else is staying active today? #Fitness #Motivation #HealthyLiving',
                    authorId: users[2].id
                }
            }),
            prisma.post.create({
                data: {
                    caption: 'Tried this amazing new recipe today! 🍝 Sometimes cooking can be the most relaxing part of your day. Food truly brings people together. #Cooking #FoodLover #Recipes',
                    authorId: users[3].id
                }
            }),
            prisma.post.create({
                data: {
                    caption: 'Beautiful sunset from my evening walk today 🌅 Sometimes the simple moments are the most meaningful ones. Nature never fails to inspire me! #Sunset #Nature #Peaceful',
                    authorId: users[1].id
                }
            })
        ]);

        console.log('📝 Created test posts');

        // Create likes
        await Promise.all([
            prisma.like.create({
                data: { postId: posts[0].id, userId: users[1].id }
            }),
            prisma.like.create({
                data: { postId: posts[0].id, userId: users[2].id }
            }),
            prisma.like.create({
                data: { postId: posts[1].id, userId: users[0].id }
            }),
            prisma.like.create({
                data: { postId: posts[2].id, userId: users[3].id }
            }),
            prisma.like.create({
                data: { postId: posts[3].id, userId: users[0].id }
            }),
            prisma.like.create({
                data: { postId: posts[3].id, userId: users[2].id }
            })
        ]);

        console.log('❤️ Created likes');

        // Create comments
        await Promise.all([
            prisma.comment.create({
                data: {
                    text: 'This looks amazing! Great work on the UI 👏',
                    postId: posts[0].id,
                    authorId: users[1].id
                }
            }),
            prisma.comment.create({
                data: {
                    text: 'Love the design approach! The gradients are perfect ✨',
                    postId: posts[1].id,
                    authorId: users[0].id
                }
            }),
            prisma.comment.create({
                data: {
                    text: 'Keep it up! Fitness is so important 💪',
                    postId: posts[2].id,
                    authorId: users[3].id
                }
            }),
            prisma.comment.create({
                data: {
                    text: 'That recipe sounds delicious! Mind sharing it? 🍝',
                    postId: posts[3].id,
                    authorId: users[0].id
                }
            })
        ]);

        console.log('💬 Created comments');

        // Create reactions
        await Promise.all([
            prisma.reaction.create({
                data: { emoji: '❤️', postId: posts[0].id, userId: users[1].id }
            }),
            prisma.reaction.create({
                data: { emoji: '🚀', postId: posts[0].id, userId: users[2].id }
            }),
            prisma.reaction.create({
                data: { emoji: '😍', postId: posts[1].id, userId: users[0].id }
            }),
            prisma.reaction.create({
                data: { emoji: '💪', postId: posts[2].id, userId: users[3].id }
            }),
            prisma.reaction.create({
                data: { emoji: '😋', postId: posts[3].id, userId: users[0].id }
            })
        ]);

        console.log('😊 Created reactions');

        console.log('🎉 Database seeded successfully!');
        console.log(`Created ${users.length} users, ${posts.length} posts with likes, comments, and reactions`);
        
        return true;
    } catch (error) {
        console.error('❌ Error seeding database:', error);
        return false;
    }
};