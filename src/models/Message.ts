import mongoose from 'mongoose';

interface IMessage extends mongoose.Document {
    matchId: mongoose.Types.ObjectId;
    sender: mongoose.Types.ObjectId;
    receiver: mongoose.Types.ObjectId;
    content: string;
    isRead: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const messageSchema = new mongoose.Schema<IMessage>({
    matchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Match',
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
    },
    isRead: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Create indexes for efficient querying
messageSchema.index({ matchId: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ receiver: 1 });
messageSchema.index({ isRead: 1, receiver: 1 });

const Message = mongoose.model<IMessage>('Message', messageSchema);

export default Message;