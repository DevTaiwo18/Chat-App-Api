import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Message from '../models/Message';
import Match from '../models/Match';
import User from '../models/User';
import { sendEmail } from '../utils/sendEmail';

interface AuthRequest extends Request {
    userId?: string;
}

interface IUser extends mongoose.Document {
    _id: mongoose.Types.ObjectId;
    email?: string;
    name?: string;
    profilePicture?: string;
}

export const sendMessage = async (req: AuthRequest, res: Response) => {
    try {
        const { matchId, content } = req.body;
        const senderId = req.userId;

        if (!senderId) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        if (!matchId || !content || content.trim() === '') {
            return res.status(400).json({ message: 'Match ID and message content are required' });
        }

        const match = await Match.findOne({
            _id: matchId,
            users: new mongoose.Types.ObjectId(senderId),
            isMatched: true
        }).populate<{ users: IUser[] }>('users', 'name email profilePicture');

        if (!match) {
            return res.status(404).json({ message: 'Match not found or you are not part of this match' });
        }

        const receiver = match.users.find(user => user._id.toString() !== senderId);
        
        if (!receiver) {
            return res.status(500).json({ message: 'Could not determine message receiver' });
        }

        const message = new Message({
            matchId,
            sender: new mongoose.Types.ObjectId(senderId),
            receiver: receiver._id,
            content,
            isRead: false
        });

        await message.save();

        try {
            const sender = await User.findById(senderId);
            
            if (sender && receiver.email) {
                await sendEmail({
                    to: receiver.email,
                    subject: `New message from ${sender.name || 'someone'} on HeartLink! 💬`,
                    text: `You have received a new message from ${sender.name || 'someone'} on HeartLink! Check your account to respond.`,
                    type: 'messageNotification',
                    userData: {
                        name: sender.name || 'Someone',
                        id: sender._id.toString(),
                        profilePicture: sender.profilePicture
                    }
                });
                
                console.log(`Sent message notification email to ${receiver.email}`);
            }
        } catch (emailError) {
            console.error('Error sending message notification email:', emailError);
        }

        res.status(201).json({
            message: 'Message sent successfully',
            data: {
                id: message._id,
                content: message.content,
                createdAt: message.createdAt
            }
        });
    } catch (error) {
        console.error('Error sending message:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getMessages = async (req: AuthRequest, res: Response) => {
    try {
        const { matchId } = req.params;
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const match = await Match.findOne({
            _id: matchId,
            users: new mongoose.Types.ObjectId(userId)
        });

        if (!match) {
            return res.status(404).json({ message: 'Match not found or you are not part of this match' });
        }

        const messages = await Message.find({ matchId })
            .sort({ createdAt: 1 })
            .populate('sender', 'name profilePicture');

        await Message.updateMany(
            { 
                matchId,
                receiver: new mongoose.Types.ObjectId(userId),
                isRead: false
            },
            { isRead: true }
        );

        res.status(200).json(messages);
    } catch (error) {
        console.error('Error getting messages:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getUnreadCount = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const unreadCount = await Message.countDocuments({
            receiver: new mongoose.Types.ObjectId(userId),
            isRead: false
        });

        res.status(200).json({ unreadCount });
    } catch (error) {
        console.error('Error getting unread count:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

export const getConversations = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.userId;

        if (!userId) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const userObjectId = new mongoose.Types.ObjectId(userId);

        const matches = await Match.find({
            users: userObjectId,
            isMatched: true
        }).populate<{ users: IUser[] }>('users', 'name profilePicture email');

        const conversations = await Promise.all(matches.map(async match => {
            const otherUser = match.users.find(user => user._id.toString() !== userId);
            
            const latestMessage = await Message.findOne({ matchId: match._id })
                .sort({ createdAt: -1 })
                .limit(1)
                .lean();
            
            const unreadCount = await Message.countDocuments({
                matchId: match._id,
                receiver: userObjectId,
                isRead: false
            });
            
            return {
                matchId: match._id,
                user: otherUser || null,
                latestMessage: latestMessage || null,
                unreadCount,
                updatedAt: latestMessage?.createdAt || match.createdAt
            };
        }));
        
        conversations.sort((a, b) => 
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
        );

        res.status(200).json(conversations);
    } catch (error) {
        console.error('Error getting conversations:', error);
        res.status(500).json({ message: 'Server error' });
    }
};