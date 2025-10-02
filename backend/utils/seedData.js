import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Generate realistic user data dynamically
const generateRealisticUsers = () => {
  const firstNames = ['Alex', 'Sarah', 'Mike', 'Emma', 'David', 'Lisa', 'James', 'Maria', 'Kevin', 'Sophie', 'Ryan', 'Anna', 'Diego', 'Elena', 'Marcus', 'Yuki', 'Olivia', 'Ahmed', 'Isabella', 'Noah', 'Zara', 'Lucas', 'Chloe', 'Kai', 'Grace', 'Hassan', 'Lily', 'Ethan', 'Maya', 'Finn', 'Ava', 'Gabriel', 'Nora', 'Oscar', 'Ruby', 'Theo', 'Iris', 'Dante', 'Sage', 'Felix', 'Luna', 'Axel', 'Valentina', 'Jackson'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson', 'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen', 'Hill', 'Flores', 'Green', 'Adams', 'Nelson', 'Baker'];
  const professions = ['photographer', 'designer', 'developer', 'artist', 'writer', 'chef', 'teacher', 'doctor', 'engineer', 'musician', 'dancer', 'athlete', 'scientist', 'architect', 'lawyer', 'nurse', 'therapist', 'consultant', 'manager', 'entrepreneur'];
  const interests = ['travel', 'photography', 'cooking', 'fitness', 'music', 'art', 'technology', 'nature', 'books', 'movies', 'sports', 'fashion', 'gaming', 'yoga', 'hiking', 'cycling', 'swimming', 'painting', 'writing', 'dancing'];
  const emojis = ['🌟', '✨', '🎨', '📸', '🌍', '💪', '🎵', '📚', '🏃‍♂️', '🏃‍♀️', '🧘‍♂️', '🧘‍♀️', '🎭', '🎪', '🎨', '🔬', '💻', '🎸', '🎹', '🎤', '📷', '🎬', '✍️', '🏊‍♂️', '🏊‍♀️', '🚴‍♂️', '🚴‍♀️', '🧗‍♂️', '🧗‍♀️'];
  
  const users = [];
  const usedUsernames = new Set();
  
  for (let i = 0; i < 50; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const profession = professions[Math.floor(Math.random() * professions.length)];
    const interest1 = interests[Math.floor(Math.random() * interests.length)];
    const interest2 = interests[Math.floor(Math.random() * interests.length)];
    const emoji1 = emojis[Math.floor(Math.random() * emojis.length)];
    const emoji2 = emojis[Math.floor(Math.random() * emojis.length)];
    
    // Generate unique username
    let username = `${firstName.toLowerCase()}_${profession}`;
    let counter = 1;
    while (usedUsernames.has(username)) {
      username = `${firstName.toLowerCase()}_${profession}${counter}`;
      counter++;
    }
    usedUsernames.add(username);
    
    // Generate realistic email
    const emailDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com'];
    const domain = emailDomains[Math.floor(Math.random() * emailDomains.length)];
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`;
    
    // Generate bio
    const bioTemplates = [
      `${profession.charAt(0).toUpperCase() + profession.slice(1)} ${emoji1} | ${interest1} enthusiast ${emoji2}`,
      `Passionate ${profession} | Love ${interest1} & ${interest2} ${emoji1}`,
      `${interest1.charAt(0).toUpperCase() + interest1.slice(1)} lover ${emoji1} | ${profession} by day ${emoji2}`,
      `Creating amazing ${interest1} content ${emoji1} | ${profession} & ${interest2} enthusiast`,
      `${firstName} | ${profession} ${emoji1} | ${interest1} & ${interest2} ${emoji2}`
    ];
    const bio = bioTemplates[Math.floor(Math.random() * bioTemplates.length)];
    
    users.push({
      username,
      email,
      password: 'SecurePass2024!', // More secure default password
      bio,
      followers: [],
      following: []
    });
  }
  
  return users;
};

// Generate realistic post data dynamically
const generateRealisticPosts = (users) => {
  const postTemplates = [
    { caption: 'Beautiful sunset at the beach! 🌅 #sunset #beach #photography', hashtags: ['#sunset', '#beach', '#photography'] },
    { caption: 'Homemade pizza night! 🍕 Who wants the recipe? #food #homemade #pizza', hashtags: ['#food', '#homemade', '#pizza'] },
    { caption: 'Morning workout complete! 💪 #fitness #motivation #workout', hashtags: ['#fitness', '#motivation', '#workout'] },
    { caption: 'New artwork in progress 🎨 #art #painting #creative', hashtags: ['#art', '#painting', '#creative'] },
    { caption: 'Coffee and code ☕💻 #tech #programming #startup', hashtags: ['#tech', '#programming', '#startup'] },
    { caption: 'Street style inspiration 👗 #fashion #style #ootd', hashtags: ['#fashion', '#style', '#ootd'] },
    { caption: 'Studio session vibes 🎵 #music #studio #producer', hashtags: ['#music', '#studio', '#producer'] },
    { caption: 'Mountain hiking adventure! 🏔️ #nature #hiking #adventure', hashtags: ['#nature', '#hiking', '#adventure'] },
    { caption: 'Golden hour magic ✨ #photography #goldenhour #nature', hashtags: ['#photography', '#goldenhour', '#nature'] },
    { caption: 'Delicious brunch spread 🥐 #food #brunch #weekend', hashtags: ['#food', '#brunch', '#weekend'] }
  ];
  
  const posts = [];
  const imageBaseUrls = [
    'https://images.unsplash.com/photo-1506905925346-21bda4d32df4', // sunset
    'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b', // pizza
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b', // fitness
    'https://images.unsplash.com/photo-1541961017774-22349e4a1262', // art
    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6', // coding
    'https://images.unsplash.com/photo-1445205170230-053b83016050', // fashion
    'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f', // music
    'https://images.unsplash.com/photo-1551632811-561732d1e306', // hiking
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05', // nature
    'https://images.unsplash.com/photo-1551024506-0bccd828d307'  // food
  ];
  
  // Generate 2-3 posts per user
  users.forEach((user, userIndex) => {
    const numPosts = Math.floor(Math.random() * 2) + 2; // 2-3 posts per user
    
    for (let i = 0; i < numPosts; i++) {
      const templateIndex = Math.floor(Math.random() * postTemplates.length);
      const template = postTemplates[templateIndex];
      const imageUrl = `${imageBaseUrls[templateIndex]}?w=600&h=600&fit=crop&crop=center&auto=format&q=80`;
      
      // Personalize caption based on user's profession/interests
      let personalizedCaption = template.caption;
      if (user.bio.includes('photographer')) {
        personalizedCaption = personalizedCaption.replace('Beautiful', 'Captured this stunning');
      } else if (user.bio.includes('chef')) {
        personalizedCaption = personalizedCaption.replace('Homemade', 'Chef\'s special');
      } else if (user.bio.includes('artist')) {
        personalizedCaption = personalizedCaption.replace('New artwork', 'Latest creation');
      }
      
      posts.push({
        caption: personalizedCaption,
        image: imageUrl,
        authorUsername: user.username,
        likes: [],
        comments: []
      });
    }
  });
  
  return posts;
};

export const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');

    // Clear existing data
    await prisma.post.deleteMany({});
    await prisma.user.deleteMany({});
    console.log('Cleared existing data');

    // Generate dynamic users
    const dummyUsers = generateRealisticUsers();

    // Create users
    const createdUsers = [];
    for (const userData of dummyUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await prisma.user.create({
        data: {
          username: userData.username,
          email: userData.email,
          password: hashedPassword,
          bio: userData.bio
        }
      });
      createdUsers.push(user);
    }
    console.log(`Created ${createdUsers.length} users`);

    // Generate dynamic posts
    const dummyPosts = generateRealisticPosts(createdUsers);

    // Create posts with specific authors
    const createdPosts = [];
    for (let i = 0; i < dummyPosts.length; i++) {
      const postData = dummyPosts[i];
      
      // Find the specific user by username
      const author = createdUsers.find(user => user.username === postData.authorUsername);
      
      if (author) {
        const post = await prisma.post.create({
          data: {
            caption: postData.caption,
            image: postData.image,
            authorId: author.id
          }
        });
        createdPosts.push(post);
        console.log(`Created post by ${author.username}: "${postData.caption.substring(0, 30)}..."`);
      } else {
        console.warn(`Author ${postData.authorUsername} not found for post: ${postData.caption}`);
      }
    }
    console.log(`Created ${createdPosts.length} posts`);

    console.log('Database seeding completed successfully!');
    return { users: createdUsers, posts: createdPosts };
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};
