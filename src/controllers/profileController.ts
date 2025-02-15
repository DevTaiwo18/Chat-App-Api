import { Request, Response } from 'express';
import User from '../models/User';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

export const createProfile = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const {
            name,
            age,
            gender,
            bio,
            interests,
            preferences,
            location
        } = req.body;

        const existingProfile = await User.findById(userId);
        if (!existingProfile) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (existingProfile.name || existingProfile.age) {
            return res.status(400).json({ message: 'Profile already exists. Use update endpoint.' });
        }

        if (age && (age < 18 || age > 100)) {
            return res.status(400).json({ message: 'Age must be between 18 and 100' });
        }

        const validInterests = [
            'travel', 'music', 'movies', 'books', 'sports',
            'cooking', 'photography', 'art', 'gaming', 'fitness',
            'nature', 'technology', 'food', 'pets', 'dancing'
        ];
        if (interests && !interests.every((interest: string) => validInterests.includes(interest))) {
            return res.status(400).json({ message: 'Invalid interests provided' });
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    name,
                    age,
                    gender,
                    bio,
                    interests,
                    'preferences.ageRange': preferences?.ageRange,
                    'preferences.gender': preferences?.gender,
                    'preferences.maxDistance': preferences?.maxDistance,
                    location
                }
            },
            { new: true, runValidators: true }
        ).select('-password -verificationToken -resetPasswordToken');

        res.status(201).json(updatedUser);
    } catch (error: any) {
        res.status(500).json({ 
            message: 'Error creating profile', 
            error: error.message || 'Unknown error occurred' 
        });
    }
};

export const getProfile = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const user = await User.findById(userId)
            .select('-password -verificationToken -resetPasswordToken');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error: any) {
        res.status(500).json({ 
            message: 'Error fetching profile', 
            error: error.message || 'Unknown error occurred' 
        });
    }
};

export const updateProfile = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const {
            name,
            age,
            gender,
            bio,
            interests,
            preferences,
            location
        } = req.body;

        const existingProfile = await User.findById(userId);
        if (!existingProfile) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!existingProfile.name && !existingProfile.age) {
            return res.status(400).json({ message: 'Profile does not exist. Use create endpoint first.' });
        }

        if (age && (age < 18 || age > 100)) {
            return res.status(400).json({ message: 'Age must be between 18 and 100' });
        }

        const validInterests = [
            'travel', 'music', 'movies', 'books', 'sports',
            'cooking', 'photography', 'art', 'gaming', 'fitness',
            'nature', 'technology', 'food', 'pets', 'dancing'
        ];
        if (interests && !interests.every((interest: string) => validInterests.includes(interest))) {
            return res.status(400).json({ message: 'Invalid interests provided' });
        }

        if (preferences?.ageRange) {
            if (preferences.ageRange.min < 18) {
                return res.status(400).json({ message: 'Minimum age preference must be at least 18' });
            }
            if (preferences.ageRange.max < preferences.ageRange.min) {
                return res.status(400).json({ 
                    message: 'Maximum age preference must be greater than minimum age' 
                });
            }
        }

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            {
                $set: {
                    name,
                    age,
                    gender,
                    bio,
                    interests,
                    'preferences.ageRange': preferences?.ageRange,
                    'preferences.gender': preferences?.gender,
                    'preferences.maxDistance': preferences?.maxDistance,
                    location
                }
            },
            { new: true, runValidators: true }
        ).select('-password -verificationToken -resetPasswordToken');

        res.json(updatedUser);
    } catch (error: any) {
        res.status(500).json({ 
            message: 'Error updating profile', 
            error: error.message || 'Unknown error occurred' 
        });
    }
};

export const uploadProfilePicture = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;

        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const b64 = Buffer.from(req.file.buffer).toString('base64');
        const dataURI = `data:${req.file.mimetype};base64,${b64}`;

        const result = await cloudinary.uploader.upload(dataURI, {
            folder: 'profile_pictures',
            resource_type: 'auto'
        });

        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { $set: { profilePicture: result.secure_url } },
            { new: true }
        ).select('-password -verificationToken -resetPasswordToken');

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({ profilePicture: result.secure_url });
    } catch (error: any) {
        res.status(500).json({ 
            message: 'Error uploading profile picture', 
            error: error.message || 'Unknown error occurred' 
        });
    }
};