import mongoose from "mongoose";

const reactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Post',
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['like', 'laugh', 'wow', 'sad', 'thumbs'],
        default: 'like'
    }
}, { timestamps: true });

// Ensure one reaction per user per post
reactionSchema.index({ userId: 1, postId: 1 }, { unique: true });

export const Reaction = mongoose.model('Reaction', reactionSchema);