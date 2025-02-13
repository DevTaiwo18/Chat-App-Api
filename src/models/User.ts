import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

interface IUser extends mongoose.Document {
  email: string;
  password: string;
  isEmailVerified: boolean;
  verificationToken?: string;
  resetPasswordToken?: string;
  resetPasswordExpires?: Date;
  name?: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  location: {
    type: string;
    coordinates: number[];
  };
  profilePicture?: string;
  bio?: string;
  interests: string[];
  preferences: {
    ageRange: {
      min: number;
      max: number;
    };
    gender: ('male' | 'female' | 'other')[];
    maxDistance: number;
  };
  comparePassword(candidatePassword: string): Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  name: {
    type: String,
    trim: true
  },
  age: {
    type: Number,
    min: 18
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true,
      default: [0, 0]
    }
  },
  profilePicture: String,
  bio: {
    type: String,
    maxlength: 500
  },
  interests: [{
    type: String,
    enum: ['travel', 'music', 'movies', 'books', 'sports', 'cooking', 'photography', 'art', 'gaming', 'fitness', 'nature', 'technology', 'food', 'pets', 'dancing']
  }],
  preferences: {
    ageRange: {
      min: {
        type: Number,
        min: 18,
        default: 18
      },
      max: {
        type: Number,
        min: 18,
        default: 99
      }
    },
    gender: [{
      type: String,
      enum: ['male', 'female', 'other']
    }],
    maxDistance: {
      type: Number,
      default: 50
    }
  }
}, {
  timestamps: true
});

userSchema.index({ location: '2dsphere' });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error as Error);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model<IUser>('User', userSchema);

export default User;