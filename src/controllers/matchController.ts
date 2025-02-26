import { Request, Response } from 'express';
import mongoose from 'mongoose';
import User from '../models/User';
import Match from '../models/Match';
import { sendEmail } from '../utils/sendEmail';

interface AuthRequest extends Request {
    userId?: string;
}

export const getPotentialMatches = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        console.log('Finding potential matches for user ID:', userId);

        const userObjectId = new mongoose.Types.ObjectId(userId);

        const totalUsers = await User.countDocuments();
        console.log('Total users in database:', totalUsers);

        const query = {
            _id: { $ne: userObjectId }
        };

        console.log('Using query:', JSON.stringify(query));

        const potentialMatches = await User.find(query)
            .select('-password -verificationToken -resetPasswordToken -resetPasswordExpires')
            .limit(20);

        console.log('Found potential matches count:', potentialMatches.length);

        console.log('Match IDs:', potentialMatches.map(match => match._id.toString()));

        res.status(200).json(potentialMatches);
    } catch (error) {
        console.error('Error getting potential matches:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Like or pass a user
export const likeOrPassUser = async (req: AuthRequest, res: Response) => {
    try {
        const { targetUserId, action } = req.body;
        const userId = req.userId;

        console.log(`User ${userId} is ${action}ing user ${targetUserId}`);

        if (!userId) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        if (action !== 'like' && action !== 'pass') {
            return res.status(400).json({ message: 'Action must be either "like" or "pass"' });
        }

        const userObjectId = new mongoose.Types.ObjectId(userId);
        const targetUserObjectId = new mongoose.Types.ObjectId(targetUserId);

        let match = await Match.findOne({
            users: { $all: [userObjectId, targetUserObjectId] }
        });

        if (match) {
            console.log('Found existing match document:', match._id.toString());
        } else {
            console.log('Creating new match document');
        }

        if (!match) {
            match = new Match({
                users: [userObjectId, targetUserObjectId],
                userLikes: new Map(),
                isMatched: false
            });
        }

        match.userLikes.set(userId.toString(), action === 'like');
        console.log('Updated userLikes:', Array.from(match.userLikes.entries()));

        const targetUserLikes = match.userLikes.get(targetUserId.toString());

        if (action === 'like' && targetUserLikes === true) {
            match.isMatched = true;
            console.log('It\'s a match! Both users like each other.');
        }

        await match.save();

        if (action === 'like' && !targetUserLikes) {
            try {
                const [currentUser, targetUser] = await Promise.all([
                    User.findById(userId),
                    User.findById(targetUserId)
                ]);

                if (currentUser && targetUser && targetUser.email) {
                    await sendEmail({
                        to: targetUser.email,
                        subject: `${currentUser.name || 'Someone'} likes you on HeartLink! 💖`,
                        text: `${currentUser.name || 'Someone'} likes you on HeartLink! Check your account to respond.`,
                        type: 'likeNotification',
                        userData: {
                            name: currentUser.name || 'Someone',
                            age: currentUser.age,
                            gender: currentUser.gender,
                            bio: currentUser.bio,
                            interests: currentUser.interests,
                            profilePicture: currentUser.profilePicture,
                            id: currentUser._id.toString()
                        }
                    });

                    console.log(`Sent like notification email to ${targetUser.email}`);
                }
            } catch (emailError) {
                console.error('Error sending like notification email:', emailError);
            }
        }

        res.status(200).json({
            message: action === 'like' ? 'User liked' : 'User passed',
            isMatch: match.isMatched
        });
    } catch (error) {
        console.error('Error in like/pass action:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Process like/pass action from email link
export const processEmailAction = async (req: AuthRequest, res: Response) => {
    try {
        const { action, userId: targetUserId } = req.query;
        const currentUserId = req.userId;

        if (!currentUserId) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        if (!targetUserId || typeof targetUserId !== 'string' || !mongoose.Types.ObjectId.isValid(targetUserId)) {
            return res.status(400).json({ message: 'Invalid user ID' });
        }

        if (action !== 'like' && action !== 'pass') {
            return res.status(400).json({ message: 'Action must be either "like" or "pass"' });
        }

        const likeResult = await likeOrPassUser({
            userId: currentUserId,
            body: { targetUserId, action },
        } as AuthRequest, res);

        return likeResult;
    } catch (error) {
        console.error('Error processing email action:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getMatches = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        console.log('Getting matches for user ID:', userId);

        const userObjectId = new mongoose.Types.ObjectId(userId);

        const matches = await Match.find({
            users: userObjectId,
            isMatched: true
        }).populate('users', 'name profilePicture');

        console.log('Found matches count:', matches.length);

        const formattedMatches = matches.map(match => {
            const otherUser = match.users.find(user => user._id.toString() !== userId);
            if (!otherUser) {
                console.log('Warning: Could not find other user in match:', match._id.toString());
            }
            return {
                matchId: match._id,
                user: otherUser || null,
                createdAt: match.createdAt
            };
        });

        res.status(200).json(formattedMatches);
    } catch (error) {
        console.error('Error getting matches:', error);
        res.status(500).json({ message: 'Server error' });
    }
};