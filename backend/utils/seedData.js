import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const dummyUsers = [
  {
    username: 'john_doe',
    email: 'john@example.com',
    password: 'password123',
    bio: 'Travel enthusiast 🌍 | Photography lover 📸',
    followers: [],
    following: []
  },
  {
    username: 'jane_smith',
    email: 'jane@example.com',
    password: 'password123',
    bio: 'Food blogger 🍕 | Recipe creator 👩‍🍳',
    followers: [],
    following: []
  },
  {
    username: 'alex_wilson',
    email: 'alex@example.com',
    password: 'password123',
    bio: 'Fitness coach 💪 | Motivation speaker 🎯',
    followers: [],
    following: []
  },
  {
    username: 'sarah_jones',
    email: 'sarah@example.com',
    password: 'password123',
    bio: 'Artist 🎨 | Creative soul ✨',
    followers: [],
    following: []
  },
  {
    username: 'mike_brown',
    email: 'mike@example.com',
    password: 'password123',
    bio: 'Tech enthusiast 💻 | Startup founder 🚀',
    followers: [],
    following: []
  },
  {
    username: 'emma_davis',
    email: 'emma@example.com',
    password: 'password123',
    bio: 'Fashion designer 👗 | Style influencer 💄',
    followers: [],
    following: []
  },
  {
    username: 'david_miller',
    email: 'david@example.com',
    password: 'password123',
    bio: 'Musician 🎵 | Producer 🎧',
    followers: [],
    following: []
  },
  {
    username: 'lisa_garcia',
    email: 'lisa@example.com',
    password: 'password123',
    bio: 'Nature photographer 🌲 | Adventure seeker 🏔️',
    followers: [],
    following: []
  },
  // Additional 30 users
  {
    username: 'carlos_rodriguez',
    email: 'carlos@example.com',
    password: 'password123',
    bio: 'Chef 👨‍🍳 | Culinary artist | Mexican cuisine specialist 🌮',
    followers: [],
    following: []
  },
  {
    username: 'priya_patel',
    email: 'priya@example.com',
    password: 'password123',
    bio: 'Yoga instructor 🧘‍♀️ | Mindfulness coach | Wellness advocate ✨',
    followers: [],
    following: []
  },
  {
    username: 'james_taylor',
    email: 'james@example.com',
    password: 'password123',
    bio: 'Professional photographer 📷 | Wedding specialist | Visual storyteller',
    followers: [],
    following: []
  },
  {
    username: 'maria_gonzalez',
    email: 'maria@example.com',
    password: 'password123',
    bio: 'Interior designer 🏠 | Home decor enthusiast | Minimalist living',
    followers: [],
    following: []
  },
  {
    username: 'kevin_chen',
    email: 'kevin@example.com',
    password: 'password123',
    bio: 'Software engineer 💻 | AI researcher | Tech blogger 🤖',
    followers: [],
    following: []
  },
  {
    username: 'sophie_martin',
    email: 'sophie@example.com',
    password: 'password123',
    bio: 'Travel blogger ✈️ | Digital nomad | Culture explorer 🌍',
    followers: [],
    following: []
  },
  {
    username: 'ryan_murphy',
    email: 'ryan@example.com',
    password: 'password123',
    bio: 'Personal trainer 💪 | Nutrition coach | Marathon runner 🏃‍♂️',
    followers: [],
    following: []
  },
  {
    username: 'anna_kowalski',
    email: 'anna@example.com',
    password: 'password123',
    bio: 'Graphic designer 🎨 | Brand strategist | Creative director',
    followers: [],
    following: []
  },
  {
    username: 'diego_silva',
    email: 'diego@example.com',
    password: 'password123',
    bio: 'Professional dancer 💃 | Choreographer | Dance instructor',
    followers: [],
    following: []
  },
  {
    username: 'elena_petrov',
    email: 'elena@example.com',
    password: 'password123',
    bio: 'Veterinarian 🐾 | Animal lover | Wildlife conservation advocate',
    followers: [],
    following: []
  },
  {
    username: 'marcus_johnson',
    email: 'marcus@example.com',
    password: 'password123',
    bio: 'Basketball coach 🏀 | Sports analyst | Youth mentor',
    followers: [],
    following: []
  },
  {
    username: 'yuki_tanaka',
    email: 'yuki@example.com',
    password: 'password123',
    bio: 'Sushi chef 🍣 | Japanese cuisine master | Food artist',
    followers: [],
    following: []
  },
  {
    username: 'olivia_wright',
    email: 'olivia@example.com',
    password: 'password123',
    bio: 'Environmental scientist 🌱 | Climate activist | Sustainability expert',
    followers: [],
    following: []
  },
  {
    username: 'ahmed_hassan',
    email: 'ahmed@example.com',
    password: 'password123',
    bio: 'Architect 🏗️ | Urban planner | Sustainable design advocate',
    followers: [],
    following: []
  },
  {
    username: 'isabella_rossi',
    email: 'isabella@example.com',
    password: 'password123',
    bio: 'Wine sommelier 🍷 | Food critic | Italian cuisine expert',
    followers: [],
    following: []
  },
  {
    username: 'noah_anderson',
    email: 'noah@example.com',
    password: 'password123',
    bio: 'Marine biologist 🐠 | Ocean conservationist | Scuba diving instructor',
    followers: [],
    following: []
  },
  {
    username: 'zara_ahmed',
    email: 'zara@example.com',
    password: 'password123',
    bio: 'Fashion stylist 👗 | Personal shopper | Style consultant',
    followers: [],
    following: []
  },
  {
    username: 'lucas_santos',
    email: 'lucas@example.com',
    password: 'password123',
    bio: 'Professional footballer ⚽ | Sports influencer | Youth coach',
    followers: [],
    following: []
  },
  {
    username: 'chloe_dubois',
    email: 'chloe@example.com',
    password: 'password123',
    bio: 'Pastry chef 🧁 | Baking instructor | Sweet creations artist',
    followers: [],
    following: []
  },
  {
    username: 'kai_nakamura',
    email: 'kai@example.com',
    password: 'password123',
    bio: 'Game developer 🎮 | Indie game creator | Digital artist',
    followers: [],
    following: []
  },
  {
    username: 'grace_thompson',
    email: 'grace@example.com',
    password: 'password123',
    bio: 'Pediatric nurse 👩‍⚕️ | Child health advocate | Community volunteer',
    followers: [],
    following: []
  },
  {
    username: 'hassan_ali',
    email: 'hassan@example.com',
    password: 'password123',
    bio: 'Calligraphy artist ✍️ | Arabic language teacher | Cultural ambassador',
    followers: [],
    following: []
  },
  {
    username: 'lily_wang',
    email: 'lily@example.com',
    password: 'password123',
    bio: 'Data scientist 📊 | Machine learning engineer | Tech speaker',
    followers: [],
    following: []
  },
  {
    username: 'ethan_clark',
    email: 'ethan@example.com',
    password: 'password123',
    bio: 'Rock climber 🧗‍♂️ | Adventure guide | Outdoor gear reviewer',
    followers: [],
    following: []
  },
  {
    username: 'maya_sharma',
    email: 'maya@example.com',
    password: 'password123',
    bio: 'Classical musician 🎻 | Orchestra member | Music teacher',
    followers: [],
    following: []
  },
  {
    username: 'finn_oconnor',
    email: 'finn@example.com',
    password: 'password123',
    bio: 'Craft beer brewer 🍺 | Brewery owner | Flavor innovator',
    followers: [],
    following: []
  },
  {
    username: 'ava_kim',
    email: 'ava@example.com',
    password: 'password123',
    bio: 'K-pop choreographer 💃 | Dance studio owner | Cultural bridge builder',
    followers: [],
    following: []
  },
  {
    username: 'gabriel_moreau',
    email: 'gabriel@example.com',
    password: 'password123',
    bio: 'Perfumer 🌸 | Fragrance creator | Scent storyteller',
    followers: [],
    following: []
  },
  {
    username: 'nora_larsson',
    email: 'nora@example.com',
    password: 'password123',
    bio: 'Sustainable fashion designer ♻️ | Eco-friendly advocate | Ethical brand owner',
    followers: [],
    following: []
  },
  {
    username: 'oscar_mendez',
    email: 'oscar@example.com',
    password: 'password123',
    bio: 'Street artist 🎨 | Mural painter | Urban culture advocate',
    followers: [],
    following: []
  },
  {
    username: 'ruby_jones',
    email: 'ruby@example.com',
    password: 'password123',
    bio: 'Podcast host 🎙️ | Storyteller | Mental health advocate',
    followers: [],
    following: []
  },
  {
    username: 'theo_mueller',
    email: 'theo@example.com',
    password: 'password123',
    bio: 'Watchmaker ⌚ | Precision craftsman | Vintage timepiece collector',
    followers: [],
    following: []
  },
  {
    username: 'iris_van_berg',
    email: 'iris@example.com',
    password: 'password123',
    bio: 'Florist 🌺 | Garden designer | Botanical artist',
    followers: [],
    following: []
  },
  {
    username: 'dante_ferrari',
    email: 'dante@example.com',
    password: 'password123',
    bio: 'Motorcycle mechanic 🏍️ | Custom bike builder | Speed enthusiast',
    followers: [],
    following: []
  },
  {
    username: 'sage_rivers',
    email: 'sage@example.com',
    password: 'password123',
    bio: 'Meditation teacher 🧘 | Spiritual guide | Holistic wellness coach',
    followers: [],
    following: []
  },
  {
    username: 'felix_hoffman',
    email: 'felix@example.com',
    password: 'password123',
    bio: 'Magician 🎩 | Illusion artist | Entertainment specialist',
    followers: [],
    following: []
  },
  {
    username: 'luna_castillo',
    email: 'luna@example.com',
    password: 'password123',
    bio: 'Astronomer 🔭 | Space educator | Night sky photographer',
    followers: [],
    following: []
  },
  {
    username: 'axel_lindqvist',
    email: 'axel@example.com',
    password: 'password123',
    bio: 'Ice hockey player 🏒 | Winter sports coach | Nordic lifestyle advocate',
    followers: [],
    following: []
  },
  {
    username: 'valentina_rossi',
    email: 'valentina@example.com',
    password: 'password123',
    bio: 'Opera singer 🎭 | Classical music performer | Voice coach',
    followers: [],
    following: []
  },
  {
    username: 'jackson_brooks',
    email: 'jackson@example.com',
    password: 'password123',
    bio: 'Drone pilot 🚁 | Aerial photographer | Tech enthusiast',
    followers: [],
    following: []
  }
];

const dummyPosts = [
  {
    caption: 'Beautiful sunset at the beach! 🌅 #sunset #beach #photography',
    image: 'https://picsum.photos/600/600?random=1',
    authorUsername: 'james_taylor', // Professional photographer
    likes: [],
    comments: []
  },
  {
    caption: 'Homemade pizza night! 🍕 Who wants the recipe? #food #homemade #pizza',
    image: 'https://picsum.photos/600/600?random=2',
    authorUsername: 'carlos_rodriguez', // Chef
    likes: [],
    comments: []
  },
  {
    caption: 'Morning workout complete! 💪 #fitness #motivation #workout',
    image: 'https://picsum.photos/600/600?random=3',
    authorUsername: 'ryan_murphy', // Personal trainer
    likes: [],
    comments: []
  },
  {
    caption: 'New artwork in progress 🎨 #art #painting #creative',
    image: 'https://picsum.photos/600/600?random=4',
    authorUsername: 'sarah_jones', // Artist
    likes: [],
    comments: []
  },
  {
    caption: 'Coffee and code ☕💻 #tech #programming #startup',
    image: 'https://picsum.photos/600/600?random=5',
    authorUsername: 'kevin_chen', // Software engineer
    likes: [],
    comments: []
  },
  {
    caption: 'Street style inspiration 👗 #fashion #style #ootd',
    image: 'https://picsum.photos/600/600?random=6',
    authorUsername: 'zara_ahmed', // Fashion stylist
    likes: [],
    comments: []
  },
  {
    caption: 'Studio session vibes 🎵 #music #studio #producer',
    image: 'https://picsum.photos/600/600?random=7',
    authorUsername: 'david_miller', // Musician & Producer
    likes: [],
    comments: []
  },
  {
    caption: 'Mountain hiking adventure! 🏔️ #nature #hiking #adventure',
    image: 'https://picsum.photos/600/600?random=8',
    authorUsername: 'ethan_clark', // Rock climber & Adventure guide
    likes: [],
    comments: []
  },
  {
    caption: 'Golden hour magic ✨ #photography #goldenhour #nature',
    image: 'https://picsum.photos/600/600?random=9',
    authorUsername: 'lisa_garcia', // Nature photographer
    likes: [],
    comments: []
  },
  {
    caption: 'Delicious brunch spread 🥐 #food #brunch #weekend',
    image: 'https://picsum.photos/600/600?random=10',
    authorUsername: 'chloe_dubois', // Pastry chef
    likes: [],
    comments: []
  },
  {
    caption: 'Aerial view of the city skyline 🏙️ #drone #cityscape #architecture',
    image: 'https://picsum.photos/600/600?random=11',
    authorUsername: 'jackson_brooks', // Drone pilot & Aerial photographer
    likes: [],
    comments: []
  },
  {
    caption: 'Opera performance tonight! 🎭 Break a leg to all performers #opera #classical #music',
    image: 'https://picsum.photos/600/600?random=12',
    authorUsername: 'valentina_rossi', // Opera singer
    likes: [],
    comments: []
  },
  {
    caption: 'Fresh sushi rolls ready to serve! 🍣 #sushi #japanese #cuisine',
    image: 'https://picsum.photos/600/600?random=13',
    authorUsername: 'yuki_tanaka', // Sushi chef
    likes: [],
    comments: []
  },
  {
    caption: 'Sustainable fashion is the future ♻️ #sustainablefashion #ecofriendly #ethical',
    image: 'https://picsum.photos/600/600?random=14',
    authorUsername: 'nora_larsson', // Sustainable fashion designer
    likes: [],
    comments: []
  },
  {
    caption: 'New mural coming to life 🎨 #streetart #mural #urbanculture',
    image: 'https://picsum.photos/600/600?random=15',
    authorUsername: 'oscar_mendez', // Street artist
    likes: [],
    comments: []
  },
  {
    caption: 'Yoga session at sunrise 🧘‍♀️ #yoga #mindfulness #wellness',
    image: 'https://picsum.photos/600/600?random=16',
    authorUsername: 'priya_patel', // Yoga instructor
    likes: [],
    comments: []
  },
  {
    caption: 'Interior design project reveal! 🏠 #interiordesign #homedecor #minimalist',
    image: 'https://picsum.photos/600/600?random=17',
    authorUsername: 'maria_gonzalez', // Interior designer
    likes: [],
    comments: []
  },
  {
    caption: 'Basketball training session 🏀 #basketball #sports #coaching',
    image: 'https://picsum.photos/600/600?random=18',
    authorUsername: 'marcus_johnson', // Basketball coach
    likes: [],
    comments: []
  },
  {
    caption: 'Ocean conservation awareness 🐠 #marinelife #conservation #ocean',
    image: 'https://picsum.photos/600/600?random=19',
    authorUsername: 'noah_anderson', // Marine biologist
    likes: [],
    comments: []
  },
  {
    caption: 'Craft beer brewing process 🍺 #craftbeer #brewing #flavor',
    image: 'https://picsum.photos/600/600?random=20',
    authorUsername: 'finn_oconnor', // Craft beer brewer
    likes: [],
    comments: []
  },
  {
    caption: 'Dance choreography practice 💃 #dance #choreography #kpop',
    image: 'https://picsum.photos/600/600?random=21',
    authorUsername: 'ava_kim', // K-pop choreographer
    likes: [],
    comments: []
  },
  {
    caption: 'Veterinary care for wildlife 🐾 #veterinary #wildlife #animalcare',
    image: 'https://picsum.photos/600/600?random=22',
    authorUsername: 'elena_petrov', // Veterinarian
    likes: [],
    comments: []
  },
  {
    caption: 'Architectural design concept 🏗️ #architecture #design #sustainable',
    image: 'https://picsum.photos/600/600?random=23',
    authorUsername: 'ahmed_hassan', // Architect
    likes: [],
    comments: []
  },
  {
    caption: 'Wine tasting notes 🍷 #wine #sommelier #italian',
    image: 'https://picsum.photos/600/600?random=24',
    authorUsername: 'isabella_rossi', // Wine sommelier
    likes: [],
    comments: []
  },
  {
    caption: 'Travel photography from Paris ✈️ #travel #photography #paris',
    image: 'https://picsum.photos/600/600?random=25',
    authorUsername: 'sophie_martin', // Travel blogger
    likes: [],
    comments: []
  },
  {
    caption: 'Game development progress 🎮 #gamedev #indie #digitalart',
    image: 'https://picsum.photos/600/600?random=26',
    authorUsername: 'kai_nakamura', // Game developer
    likes: [],
    comments: []
  },
  {
    caption: 'Pastry masterclass today 🧁 #pastry #baking #sweetcreations',
    image: 'https://picsum.photos/600/600?random=27',
    authorUsername: 'chloe_dubois', // Pastry chef
    likes: [],
    comments: []
  },
  {
    caption: 'Graphic design project 🎨 #graphicdesign #branding #creative',
    image: 'https://picsum.photos/600/600?random=28',
    authorUsername: 'anna_kowalski', // Graphic designer
    likes: [],
    comments: []
  },
  {
    caption: 'Professional dance performance 💃 #dance #choreography #performance',
    image: 'https://picsum.photos/600/600?random=29',
    authorUsername: 'diego_silva', // Professional dancer
    likes: [],
    comments: []
  },
  {
    caption: 'Pediatric care with love 👩‍⚕️ #healthcare #pediatrics #children',
    image: 'https://picsum.photos/600/600?random=30',
    authorUsername: 'grace_thompson', // Pediatric nurse
    likes: [],
    comments: []
  },
  {
    caption: 'Arabic calligraphy art ✍️ #calligraphy #arabic #art',
    image: 'https://picsum.photos/600/600?random=31',
    authorUsername: 'hassan_ali', // Calligraphy artist
    likes: [],
    comments: []
  },
  {
    caption: 'Data science insights 📊 #datascience #machinelearning #tech',
    image: 'https://picsum.photos/600/600?random=32',
    authorUsername: 'lily_wang', // Data scientist
    likes: [],
    comments: []
  },
  {
    caption: 'Classical violin performance 🎻 #classical #music #violin',
    image: 'https://picsum.photos/600/600?random=33',
    authorUsername: 'maya_sharma', // Classical musician
    likes: [],
    comments: []
  },
  {
    caption: 'Perfume creation process 🌸 #perfume #fragrance #scent',
    image: 'https://picsum.photos/600/600?random=34',
    authorUsername: 'gabriel_moreau', // Perfumer
    likes: [],
    comments: []
  },
  {
    caption: 'Podcast recording session 🎙️ #podcast #storytelling #mentalhealth',
    image: 'https://picsum.photos/600/600?random=35',
    authorUsername: 'ruby_jones', // Podcast host
    likes: [],
    comments: []
  },
  {
    caption: 'Vintage watch restoration ⌚ #watchmaking #vintage #craftsmanship',
    image: 'https://picsum.photos/600/600?random=36',
    authorUsername: 'theo_mueller', // Watchmaker
    likes: [],
    comments: []
  },
  {
    caption: 'Beautiful flower arrangements 🌺 #florist #flowers #botanical',
    image: 'https://picsum.photos/600/600?random=37',
    authorUsername: 'iris_van_berg', // Florist
    likes: [],
    comments: []
  },
  {
    caption: 'Custom motorcycle build 🏍️ #motorcycle #custom #speed',
    image: 'https://picsum.photos/600/600?random=38',
    authorUsername: 'dante_ferrari', // Motorcycle mechanic
    likes: [],
    comments: []
  },
  {
    caption: 'Meditation and mindfulness 🧘 #meditation #mindfulness #wellness',
    image: 'https://picsum.photos/600/600?random=39',
    authorUsername: 'sage_rivers', // Meditation teacher
    likes: [],
    comments: []
  },
  {
    caption: 'Magic show performance 🎩 #magic #illusion #entertainment',
    image: 'https://picsum.photos/600/600?random=40',
    authorUsername: 'felix_hoffman', // Magician
    likes: [],
    comments: []
  },
  {
    caption: 'Night sky astronomy 🔭 #astronomy #space #stars',
    image: 'https://picsum.photos/600/600?random=41',
    authorUsername: 'luna_castillo', // Astronomer
    likes: [],
    comments: []
  },
  {
    caption: 'Ice hockey training 🏒 #hockey #winter #sports',
    image: 'https://picsum.photos/600/600?random=42',
    authorUsername: 'axel_lindqvist', // Ice hockey player
    likes: [],
    comments: []
  }
];

export const seedDatabase = async () => {
  try {
    console.log('Starting database seeding...');

    // Clear existing data
    await prisma.post.deleteMany({});
    await prisma.user.deleteMany({});
    console.log('Cleared existing data');

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
