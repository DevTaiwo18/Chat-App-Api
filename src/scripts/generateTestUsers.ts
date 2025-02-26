import mongoose from 'mongoose';
import User from '../models/User';
import bcrypt from 'bcryptjs';

const users = [
  {
    email: "sophia.chen@example.com",
    password: "testPass123!",
    name: "Sophia Chen",
    age: 28,
    gender: "female",
    location: {
      type: "Point",
      coordinates: [-122.419416, 37.774929] // San Francisco
    },
    bio: "Tech enthusiast and yoga lover. Looking for someone to explore new restaurants with!",
    interests: ["technology", "fitness", "food"],
    preferences: {
      ageRange: { min: 25, max: 35 },
      gender: ["male"],
      maxDistance: 25
    }
  },
  {
    email: "james.wilson@example.com",
    password: "testPass123!",
    name: "James Wilson",
    age: 31,
    gender: "male",
    location: {
      type: "Point",
      coordinates: [-122.431297, 37.773972] // San Francisco
    },
    bio: "Software engineer by day, amateur chef by night. Dog lover 🐕",
    interests: ["cooking", "technology", "pets"],
    preferences: {
      ageRange: { min: 25, max: 35 },
      gender: ["female"],
      maxDistance: 30
    }
  },
  {
    email: "emma.taylor@example.com",
    password: "testPass123!",
    name: "Emma Taylor",
    age: 25,
    gender: "female",
    location: {
      type: "Point",
      coordinates: [-122.409668, 37.784878] // San Francisco
    },
    bio: "Art gallery curator with a passion for photography. Love discovering hidden coffee shops.",
    interests: ["art", "photography", "food"],
    preferences: {
      ageRange: { min: 24, max: 32 },
      gender: ["male"],
      maxDistance: 20
    }
  },
  {
    email: "marcus.johnson@example.com",
    password: "testPass123!",
    name: "Marcus Johnson",
    age: 29,
    gender: "male",
    location: {
      type: "Point",
      coordinates: [-122.425454, 37.767197] // San Francisco
    },
    bio: "Music producer and fitness enthusiast. Looking for someone to share adventures with.",
    interests: ["music", "fitness", "travel"],
    preferences: {
      ageRange: { min: 25, max: 33 },
      gender: ["female"],
      maxDistance: 25
    }
  },
  {
    email: "olivia.brown@example.com",
    password: "testPass123!",
    name: "Olivia Brown",
    age: 27,
    gender: "female",
    location: {
      type: "Point",
      coordinates: [-122.415364, 37.789794] // San Francisco
    },
    bio: "Environmental lawyer who loves hiking and outdoor photography.",
    interests: ["nature", "photography", "fitness"],
    preferences: {
      ageRange: { min: 26, max: 34 },
      gender: ["male"],
      maxDistance: 30
    }
  },
  {
    email: "daniel.lee@example.com",
    password: "testPass123!",
    name: "Daniel Lee",
    age: 33,
    gender: "male",
    location: {
      type: "Point",
      coordinates: [-122.405823, 37.778694] // San Francisco
    },
    bio: "Startup founder who loves rock climbing and playing guitar.",
    interests: ["technology", "music", "fitness"],
    preferences: {
      ageRange: { min: 27, max: 35 },
      gender: ["female"],
      maxDistance: 20
    }
  },
  {
    email: "ava.martinez@example.com",
    password: "testPass123!",
    name: "Ava Martinez",
    age: 26,
    gender: "female",
    location: {
      type: "Point",
      coordinates: [-122.448687, 37.771789] // San Francisco
    },
    bio: "Travel blogger and foodie. Always planning my next adventure!",
    interests: ["travel", "food", "photography"],
    preferences: {
      ageRange: { min: 25, max: 35 },
      gender: ["male"],
      maxDistance: 25
    }
  },
  {
    email: "ethan.williams@example.com",
    password: "testPass123!",
    name: "Ethan Williams",
    age: 30,
    gender: "male",
    location: {
      type: "Point",
      coordinates: [-122.437689, 37.783795] // San Francisco
    },
    bio: "UX designer who loves board games and craft beer.",
    interests: ["technology", "gaming", "food"],
    preferences: {
      ageRange: { min: 25, max: 32 },
      gender: ["female"],
      maxDistance: 15
    }
  },
  {
    email: "zoe.garcia@example.com",
    password: "testPass123!",
    name: "Zoe Garcia",
    age: 29,
    gender: "female",
    location: {
      type: "Point",
      coordinates: [-122.428932, 37.796355] // San Francisco
    },
    bio: "Dance instructor and part-time DJ. Looking for someone who can keep up!",
    interests: ["music", "dancing", "fitness"],
    preferences: {
      ageRange: { min: 27, max: 35 },
      gender: ["male"],
      maxDistance: 20
    }
  },
  {
    email: "lucas.thompson@example.com",
    password: "testPass123!",
    name: "Lucas Thompson",
    age: 32,
    gender: "male",
    location: {
      type: "Point",
      coordinates: [-122.412547, 37.765432] // San Francisco
    },
    bio: "Chef at a local bistro. Food is my love language.",
    interests: ["cooking", "food", "art"],
    preferences: {
      ageRange: { min: 27, max: 35 },
      gender: ["female"],
      maxDistance: 25
    }
  },
  {
    email: "mia.patel@example.com",
    password: "testPass123!",
    name: "Mia Patel",
    age: 28,
    gender: "female",
    location: {
      type: "Point",
      coordinates: [-122.445678, 37.789012] // San Francisco
    },
    bio: "Pediatric nurse who loves painting and weekend hikes.",
    interests: ["art", "nature", "fitness"],
    preferences: {
      ageRange: { min: 26, max: 34 },
      gender: ["male"],
      maxDistance: 30
    }
  },
  {
    email: "alex.kim@example.com",
    password: "testPass123!",
    name: "Alex Kim",
    age: 31,
    gender: "male",
    location: {
      type: "Point",
      coordinates: [-122.421234, 37.776543] // San Francisco
    },
    bio: "Product manager and amateur photographer. Always up for an adventure!",
    interests: ["technology", "photography", "travel"],
    preferences: {
      ageRange: { min: 25, max: 33 },
      gender: ["female"],
      maxDistance: 25
    }
  },
  {
    email: "isabella.rodriguez@example.com",
    password: "testPass123!",
    name: "Isabella Rodriguez",
    age: 27,
    gender: "female",
    location: {
      type: "Point",
      coordinates: [-122.398765, 37.787654] // San Francisco
    },
    bio: "Marketing specialist with a passion for vintage fashion and indie films.",
    interests: ["art", "movies", "music"],
    preferences: {
      ageRange: { min: 26, max: 34 },
      gender: ["male"],
      maxDistance: 20
    }
  },
  {
    email: "william.zhang@example.com",
    password: "testPass123!",
    name: "William Zhang",
    age: 30,
    gender: "male",
    location: {
      type: "Point",
      coordinates: [-122.432109, 37.775432] // San Francisco
    },
    bio: "Data scientist who loves surfing and beach volleyball.",
    interests: ["technology", "sports", "nature"],
    preferences: {
      ageRange: { min: 25, max: 32 },
      gender: ["female"],
      maxDistance: 25
    }
  },
  {
    email: "lily.anderson@example.com",
    password: "testPass123!",
    name: "Lily Anderson",
    age: 26,
    gender: "female",
    location: {
      type: "Point",
      coordinates: [-122.415678, 37.792345] // San Francisco
    },
    bio: "Graphic designer and plant mom. Looking for someone to explore art galleries with.",
    interests: ["art", "nature", "photography"],
    preferences: {
      ageRange: { min: 25, max: 33 },
      gender: ["male"],
      maxDistance: 20
    }
  }
];

async function generateTestUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb+srv://adeyemitaiwo24434:rtC6zJingtXSbZGW@cluster0.joj4v.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
    
    // Clear existing users
    await User.deleteMany({});
    
    // Create users with hashed passwords
    for (const userData of users) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(userData.password, salt);
      
      const user = new User({
        ...userData,
        password: hashedPassword,
        isEmailVerified: true 
      });
      
      await user.save();
      console.log(`Created user: ${userData.name}`);
    }
    
    console.log('Test users created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error creating test users:', error);
    process.exit(1);
  }
}

generateTestUsers();