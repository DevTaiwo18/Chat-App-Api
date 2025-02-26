import mongoose from 'mongoose';

interface IMatch extends mongoose.Document {
    users: mongoose.Types.ObjectId[];
    userLikes: Map<string, boolean>;
    isMatched: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const matchSchema = new mongoose.Schema<IMatch>({
    users: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }],
    userLikes: {
        type: Map,
        of: Boolean,
        default: new Map()
    },
    isMatched: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true
});

// Ensure we can query matches efficiently
matchSchema.index({ users: 1 });
matchSchema.index({ isMatched: 1 });

const Match = mongoose.model<IMatch>('Match', matchSchema);

export default Match;