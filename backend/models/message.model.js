import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User'
    },
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
        required: true
    },
    message: {
        type: String,
        required: function() {
            return !this.file;
        }
    },
    file: {
        url: String,
        name: String,
        type: String,
        size: Number
    },
    messageType: {
        type: String,
        enum: ['text', 'image', 'video', 'audio', 'file'],
        default: 'text'
    },
    reactions: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        reaction: {
            type: String,
            enum: ['like', 'love', 'laugh', 'angry', 'sad', 'wow']
        }
    }],
    isRead: {
        type: Boolean,
        default: false
    },
    readBy: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        readAt: {
            type: Date,
            default: Date.now
        }
    }],
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export const Message = mongoose.model('Message', messageSchema);