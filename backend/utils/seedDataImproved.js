import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Generate realistic user data dynamically
const generateRealisticUsers = () => {
  const firstNames = ['Alex', 'Sarah', 'Mike', 'Emma', 'David', 'Lisa', 'James', 'Maria', 'Kevin', 'Sophie', 'Ryan', 'Anna', 'Diego', 'Elena', 'Marcus', 'Yuki', 'Olivia', 'Ahmed', 'Isabella', 'Noah', 'Zara', 'Lucas', 'Chloe', 'Kai', 'Grace', 'Hassan', 'Lily', 'Ethan', 'Maya', 'Finn'];
  const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];
  const professions = ['photographer', 'designer', 'developer', 'artist', 'writer', 'chef', 'teacher', 'doctor', 'engineer', 'musician', 'dancer', 'athlete', 'scientist', 'architect', 'lawyer', 'nurse', 'therapist', 'consultant', 'manager', 'entrepreneur'];
  const interests = ['travel', 'photography', 'cooking', 'fitness', 'music', 'art', 'technology', 'nature', 'books', 'movies', 'sports', 'fashion', 'gaming', 'yoga', 'hiking', 'cycling'];
  
  const users = [];
  const usedUsernames = new Set();
  
  for (let i = 0; i < 25; i++) { // Reduced to 25 users for better quality
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    const profession = professions[Math.floor(Math.random() * professions.length)];
    const interest1 = interests[Math.floor(Math.random() * interests.length)];
    const interest2 = interests[Math.floor(Math.random() * interests.length)];
    
    // Generate unique username
    let username = `${firstName.toLowerCase()}_${profession}`;
    let counter = 1;
    while (usedUsernames.has(username)) {
      username = `${firstName.toLowerCase()}_${profession}${counter}`;
      counter++;
    }
    usedUsernames.add(username);
    
    const emailDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'icloud.com'];
    const domain = emailDomains[Math.floor(Math.random() * emailDomains.length)];
    const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${domain}`;
    
    const bioTemplates = [
      `${profession.charAt(0).toUpperCase() + profession.slice(1)} 🌟 | ${interest1} enthusiast ✨`,
      `Passionate ${profession} | Love ${interest1} & ${interest2} 💫`,
      `${interest1.charAt(0).toUpperCase() + interest1.slice(1)} lover 🎯 | ${profession} by day 🌙`,
      `Creating amazing ${interest1} content 🚀 | ${profession} & ${interest2} enthusiast`,
      `${firstName} | ${profession} 💪 | ${interest1} & ${interest2} 🎨`
    ];
    const bio = bioTemplates[Math.floor(Math.random() * bioTemplates.length)];
    
    users.push({
      username,
      email,
      password: 'SecurePass2024!',
      bio,
      profession,
      interests: [interest1, interest2]
    });
  }
  
  return users;
};

// Generate diverse and unique post content
const generateDiversePosts = (users) => {
  // Much larger variety of post templates
  const postCategories = {
    travel: [
      "Just landed in Tokyo! The city lights are incredible 🌃 #travel #tokyo #citylife",
      "Exploring ancient temples in Kyoto today 🏯 #kyoto #temples #culture #japan",
      "Beach day in Bali! Paradise found 🏖️ #bali #beach #paradise #indonesia",
      "Hiking through the Swiss Alps - breathtaking views! 🏔️ #switzerland #alps #hiking #mountains",
      "Street food tour in Bangkok was amazing! 🍜 #bangkok #streetfood #thailand #foodie",
      "Northern lights in Iceland tonight! Nature's magic ✨ #iceland #northernlights #aurora #nature",
      "Sunrise over Machu Picchu - bucket list checked! ☀️ #machupicchu #peru #sunrise #bucketlist",
      "Gondola ride through Venice canals 🚤 #venice #italy #gondola #romantic",
      "Safari adventure in Kenya - saw the Big Five! 🦁 #kenya #safari #wildlife #africa",
      "Cherry blossoms in full bloom in Seoul 🌸 #seoul #korea #cherryblossom #spring"
    ],
    food: [
      "Homemade sourdough bread - 3 days of patience paid off! 🍞 #sourdough #homemade #baking #bread",
      "Perfected my ramen recipe after 20 attempts 🍜 #ramen #cooking #japanese #homemade",
      "Farm-to-table dinner with ingredients from my garden 🥕 #farmtotable #organic #gardening #fresh",
      "Chocolate lava cake experiment - nailed it! 🍫 #dessert #chocolate #baking #sweet",
      "Sushi making class was harder than expected 🍣 #sushi #japanese #cooking #challenge",
      "BBQ weekend with friends - ribs were perfect! 🔥 #bbq #ribs #weekend #friends",
      "Tried making pasta from scratch - so worth it! 🍝 #pasta #italian #homemade #cooking",
      "Coffee cupping session - discovered my new favorite bean ☕ #coffee #cupping #specialty #beans",
      "Vegan lasagna that even meat lovers approved! 🌱 #vegan #lasagna #plantbased #healthy",
      "Fermentation experiment: kimchi day 14 success! 🥬 #fermentation #kimchi #korean #healthy"
    ],
    fitness: [
      "5K personal record broken this morning! 🏃‍♂️ #running #5k #personalrecord #fitness",
      "Deadlift PR: 200lbs! Form over ego always 💪 #deadlift #pr #strength #gym",
      "Yoga sunrise session on the beach 🧘‍♀️ #yoga #sunrise #beach #mindfulness",
      "Rock climbing indoor wall conquered! 🧗‍♂️ #rockclimbing #indoor #challenge #strength",
      "Marathon training week 12 - legs are tired but spirit is strong 🏃‍♀️ #marathon #training #endurance #running",
      "Crossfit WOD destroyed me today - in the best way 💥 #crossfit #wod #intense #fitness",
      "Swimming 2000m felt like meditation in motion 🏊‍♂️ #swimming #meditation #cardio #pool",
      "Pilates class taught me muscles I didn't know existed 🤸‍♀️ #pilates #core #flexibility #strength",
      "Cycling 50 miles through mountain trails today 🚴‍♂️ #cycling #mountains #trails #endurance",
      "Boxing class - great stress relief and workout! 🥊 #boxing #stress #workout #cardio"
    ],
    art: [
      "Oil painting of the sunset - 40 hours of work complete 🎨 #oilpainting #sunset #art #painting",
      "Digital illustration commission finished! 💻 #digitalart #illustration #commission #design",
      "Pottery wheel session - finally centered the clay! 🏺 #pottery #ceramics #clay #handmade",
      "Street art mural project in downtown - day 3 🎭 #streetart #mural #urban #community",
      "Watercolor landscape from my hiking trip 🖌️ #watercolor #landscape #hiking #nature",
      "Sculpture workshop - working with bronze today ⚒️ #sculpture #bronze #workshop #metalwork",
      "Photography exhibition opening night success! 📸 #photography #exhibition #art #gallery",
      "Calligraphy practice - mastering the brush strokes ✍️ #calligraphy #brushstrokes #traditional #art",
      "Graffiti legal wall session - new piece complete 🎨 #graffiti #legalwall #urban #spray",
      "Mixed media collage exploring urban themes 📰 #mixedmedia #collage #urban #contemporary"
    ],
    technology: [
      "Deployed my first full-stack app to production! 🚀 #coding #fullstack #deployment #webdev",
      "AI model training complete - 94% accuracy achieved 🤖 #ai #machinelearning #model #tech",
      "Open source contribution merged into main branch 🌟 #opensource #github #contribution #coding",
      "Hackathon 48 hours - built a climate tracking app 🌍 #hackathon #climate #app #coding",
      "Blockchain workshop - finally understand smart contracts 🔗 #blockchain #smartcontracts #crypto #tech",
      "VR development project - creating immersive experiences 🥽 #vr #development #immersive #tech",
      "Cybersecurity certification exam passed! 🔐 #cybersecurity #certification #infosec #tech",
      "IoT home automation system finally working 🏠 #iot #homeautomation #smart #technology",
      "Mobile app launched on both iOS and Android stores 📱 #mobileapp #ios #android #launch",
      "Quantum computing lecture blew my mind today 🧠 #quantumcomputing #physics #future #tech"
    ],
    lifestyle: [
      "Minimalism challenge day 30 - feeling so much lighter ✨ #minimalism #declutter #simple #lifestyle",
      "Morning meditation routine has changed my life 🧘 #meditation #mindfulness #morning #peace",
      "Book club discussion on '1984' was intense 📚 #bookclub #reading #orwell #literature",
      "Sustainable living swap: bamboo everything! 🎋 #sustainable #eco #bamboo #zerowaste",
      "Learning Spanish - finally had my first full conversation! 🇪🇸 #spanish #language #learning #progress",
      "Volunteer day at animal shelter - so many good dogs 🐕 #volunteer #animals #shelter #community",
      "Gardening therapy session - tomatoes are thriving 🍅 #gardening #therapy #tomatoes #homegrown",
      "Digital detox weekend - no screens, just nature 🌲 #digitaldetox #nature #offline #wellness",
      "Cooking class with grandma - family recipes preserved 👵 #family #recipes #tradition #cooking",
      "Sunrise journaling became my favorite ritual ☀️ #journaling #sunrise #ritual #selfcare"
    ],
    music: [
      "Studio session: new song arrangement complete 🎵 #studio #music #songwriting #recording",
      "Guitar practice - finally nailed that solo! 🎸 #guitar #solo #practice #music",
      "Concert last night - front row energy was incredible 🎤 #concert #live #music #energy",
      "Vinyl collection reached 200 records today 📀 #vinyl #records #collection #music",
      "Piano composition inspired by rainy afternoons 🎹 #piano #composition #rain #instrumental",
      "Drum lesson breakthrough - polyrhythms clicking! 🥁 #drums #polyrhythms #lesson #percussion",
      "Music festival lineup announced - can't wait for summer! 🎪 #festival #summer #lineup #music",
      "Home recording setup finally complete 🎧 #homerecording #setup #audio #production",
      "Jazz improvisation class pushed my boundaries 🎺 #jazz #improvisation #class #music",
      "Songwriting retreat in the mountains this weekend 🏔️ #songwriting #retreat #mountains #creative"
    ],
    nature: [
      "Forest bathing session - 2 hours of pure peace 🌲 #forestbathing #nature #peace #mindfulness",
      "Bird watching expedition: spotted 15 species today 🦅 #birdwatching #species #nature #wildlife",
      "Camping under the stars - no light pollution here ⭐ #camping #stars #darksky #nature",
      "Waterfall hike reward: the most refreshing swim 💦 #waterfall #hike #swim #nature",
      "Mushroom foraging with expert guide - so much to learn 🍄 #foraging #mushrooms #nature #learning",
      "Sunrise photography at the lake - golden hour magic 📸 #sunrise #photography #lake #goldenhour",
      "Rock formation geology lesson in the desert 🏜️ #geology #desert #rocks #education",
      "Tide pool exploration revealed amazing creatures 🦀 #tidepools #marine #creatures #ocean",
      "Mountain peak conquered after 6-hour climb ⛰️ #mountain #peak #climbing #achievement",
      "Botanical garden sketch session - so many textures 🌺 #botanical #sketching #flowers #art"
    ]
  };

  const posts = [];
  const usedCaptions = new Set();

  users.forEach((user, userIndex) => {
    // Each user gets 2-4 posts
    const numPosts = Math.floor(Math.random() * 3) + 2;
    
    for (let i = 0; i < numPosts; i++) {
      // Choose category based on user's interests and profession
      let categories = ['lifestyle']; // Everyone gets lifestyle posts
      
      if (user.interests.includes('travel')) categories.push('travel');
      if (user.interests.includes('cooking') || user.profession === 'chef') categories.push('food');
      if (user.interests.includes('fitness') || user.profession === 'athlete') categories.push('fitness');
      if (user.interests.includes('art') || user.profession === 'artist') categories.push('art');
      if (user.interests.includes('technology') || user.profession === 'developer') categories.push('technology');
      if (user.interests.includes('music') || user.profession === 'musician') categories.push('music');
      if (user.interests.includes('nature') || user.interests.includes('hiking')) categories.push('nature');
      
      const category = categories[Math.floor(Math.random() * categories.length)];
      const categoryPosts = postCategories[category];
      
      // Find an unused caption
      let caption;
      let attempts = 0;
      do {
        caption = categoryPosts[Math.floor(Math.random() * categoryPosts.length)];
        attempts++;
      } while (usedCaptions.has(caption) && attempts < 50);
      
      // If we can't find unused caption, modify it slightly
      if (usedCaptions.has(caption)) {
        const personalizations = [
          ` - ${user.username.split('_')[0]}'s perspective`,
          ` (${user.profession} life)`,
          ` - loving this journey!`,
          ` #blessed`,
          ` - grateful for this moment`
        ];
        caption += personalizations[Math.floor(Math.random() * personalizations.length)];
      }
      
      usedCaptions.add(caption);
      
      // Generate unique image URL
      const imageId = Math.floor(Math.random() * 1000) + userIndex * 1000 + i;
      const imageUrl = `https://picsum.photos/600/600?random=${imageId}`;
      
      posts.push({
        caption,
        image: imageUrl,
        authorUsername: user.username
      });
    }
  });
  
  return posts;
};

// Generate diverse stories for users
const generateStories = (users) => {
  const storyTemplates = {
    daily: [
      { text: "Good morning everyone! ☀️", mediaType: "text" },
      { text: "Coffee time ☕", mediaType: "text" },
      { text: "Lunch break vibes 🍽️", mediaType: "text" },
      { text: "Afternoon motivation 💪", mediaType: "text" },
      { text: "Evening chill 🌅", mediaType: "text" },
      { text: "Night thoughts 🌙", mediaType: "text" }
    ],
    lifestyle: [
      { text: "Living my best life ✨", mediaType: "text" },
      { text: "Grateful for today 🙏", mediaType: "text" },
      { text: "Weekend vibes activated 🎉", mediaType: "text" },
      { text: "Self care Sunday 🧘‍♀️", mediaType: "text" },
      { text: "Monday motivation 🚀", mediaType: "text" },
      { text: "Midweek energy check 💫", mediaType: "text" }
    ],
    work: [
      { text: "Crushing goals today 🎯", mediaType: "text" },
      { text: "Project complete! 🎉", mediaType: "text" },
      { text: "Team meeting success ✅", mediaType: "text" },
      { text: "Learning something new 📚", mediaType: "text" },
      { text: "Deadline conquered 💪", mediaType: "text" },
      { text: "Innovation mode on 💡", mediaType: "text" }
    ],
    mood: [
      { text: "Feeling grateful today 💝", mediaType: "text" },
      { text: "Positive vibes only ✨", mediaType: "text" },
      { text: "Energy is everything ⚡", mediaType: "text" },
      { text: "Blessed and thankful 🌟", mediaType: "text" },
      { text: "Good vibes incoming 🌈", mediaType: "text" },
      { text: "Radiating positivity 🌞", mediaType: "text" }
    ],
    activity: [
      { text: "Workout complete! 💪", mediaType: "text" },
      { text: "Nature walk therapy 🌲", mediaType: "text" },
      { text: "Cooking experiment 👨‍🍳", mediaType: "text" },
      { text: "Reading session 📖", mediaType: "text" },
      { text: "Music practice time 🎵", mediaType: "text" },
      { text: "Art creation mode 🎨", mediaType: "text" }
    ]
  };

  const stories = [];
  const now = new Date();
  
  // 60-70% of users will have stories (more realistic)
  const usersWithStories = users.slice(0, Math.floor(users.length * 0.7));
  
  usersWithStories.forEach((user, index) => {
    // Each user gets 1-3 stories
    const numStories = Math.floor(Math.random() * 3) + 1;
    
    for (let i = 0; i < numStories; i++) {
      // Choose story category based on user interests
      let categories = ['daily', 'lifestyle', 'mood'];
      
      if (user.profession === 'developer' || user.profession === 'designer') {
        categories.push('work');
      }
      if (user.interests.includes('fitness') || user.interests.includes('yoga')) {
        categories.push('activity');
      }
      
      const category = categories[Math.floor(Math.random() * categories.length)];
      const categoryStories = storyTemplates[category];
      const template = categoryStories[Math.floor(Math.random() * categoryStories.length)];
      
      // Stories expire in 24 hours
      const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      
      // Create stories at different times in the last 12 hours
      const createdAt = new Date(now.getTime() - Math.floor(Math.random() * 12 * 60 * 60 * 1000));
      
      // Add some image stories (30% chance)
      let mediaUrl = null;
      let mediaType = template.mediaType;
      
      if (Math.random() < 0.3) {
        mediaType = "image";
        mediaUrl = `https://picsum.photos/400/700?random=${index * 100 + i}`;
      }
      
      stories.push({
        text: template.text,
        mediaUrl,
        mediaType,
        authorUsername: user.username,
        expiresAt,
        createdAt
      });
    }
  });
  
  return stories;
};

export const seedDatabaseImproved = async () => {
  try {
    console.log('🌱 Starting improved database seeding...');

    // Clear existing data
    console.log('🧹 Clearing existing data...');
    await prisma.storyView.deleteMany({});
    await prisma.story.deleteMany({});
    await prisma.like.deleteMany({});
    await prisma.comment.deleteMany({});
    await prisma.post.deleteMany({});
    await prisma.follow.deleteMany({});
    await prisma.user.deleteMany({});
    console.log('✅ Cleared existing data');

    // Generate users
    console.log('👥 Generating users...');
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
    console.log(`✅ Created ${createdUsers.length} users`);

    // Generate posts
    console.log('📝 Generating diverse posts...');
    const dummyPosts = generateDiversePosts(dummyUsers);

    // Create posts
    const createdPosts = [];
    for (const postData of dummyPosts) {
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
      }
    }
    console.log(`✅ Created ${createdPosts.length} unique posts`);

    // Generate and create stories
    console.log('📖 Generating stories...');
    const dummyStories = generateStories(dummyUsers);
    
    const createdStories = [];
    for (const storyData of dummyStories) {
      const author = createdUsers.find(user => user.username === storyData.authorUsername);
      
      if (author) {
        const story = await prisma.story.create({
          data: {
            text: storyData.text,
            mediaUrl: storyData.mediaUrl,
            mediaType: storyData.mediaType,
            authorId: author.id,
            expiresAt: storyData.expiresAt,
            createdAt: storyData.createdAt
          }
        });
        createdStories.push(story);
      }
    }
    console.log(`✅ Created ${createdStories.length} stories`);

    // Create some follow relationships
    console.log('🤝 Creating follow relationships...');
    let followCount = 0;
    for (let i = 0; i < createdUsers.length; i++) {
      const follower = createdUsers[i];
      // Each user follows 3-7 random other users
      const numFollows = Math.floor(Math.random() * 5) + 3;
      const followTargets = new Set();
      
      while (followTargets.size < numFollows && followTargets.size < createdUsers.length - 1) {
        const randomIndex = Math.floor(Math.random() * createdUsers.length);
        if (randomIndex !== i) {
          followTargets.add(randomIndex);
        }
      }
      
      for (const targetIndex of followTargets) {
        const following = createdUsers[targetIndex];
        try {
          await prisma.follow.create({
            data: {
              followerId: follower.id,
              followingId: following.id
            }
          });
          followCount++;
        } catch (error) {
          // Skip if relationship already exists
        }
      }
    }
    console.log(`✅ Created ${followCount} follow relationships`);

    console.log('🎉 Improved database seeding completed successfully!');
    console.log(`📊 Summary: ${createdUsers.length} users, ${createdPosts.length} posts, ${createdStories.length} stories, ${followCount} follows`);
    
    return { users: createdUsers, posts: createdPosts, stories: createdStories };
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

export default seedDatabaseImproved;
