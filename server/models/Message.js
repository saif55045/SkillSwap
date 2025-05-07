import mongoose from 'mongoose';
import crypto from 'crypto';

const messageSchema = new mongoose.Schema({
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    receiverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: false // Optional, only if message is related to a project
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    readStatus: {
        type: Boolean,
        default: false
    },
    // Hashed metadata as required
    metadata: {
        type: String,
        default: function() {
            // Hash a combination of sender, receiver, timestamp, and user agent (if available)
            const data = `${this.senderId}-${this.receiverId}-${Date.now()}`;
            return crypto.createHash('sha256').update(data).digest('hex');
        }
    }
}, {
    timestamps: true
});

// Create indexes for better query performance
messageSchema.index({ senderId: 1, receiverId: 1 });
messageSchema.index({ projectId: 1 });
messageSchema.index({ createdAt: -1 });

export const Message = mongoose.model('Message', messageSchema);