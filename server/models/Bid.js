import mongoose from 'mongoose';

const bidSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    freelancerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    proposal: {
        type: String,
        required: true,
        minlength: 50,
        maxlength: 1000
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected', 'countered'],
        default: 'pending'
    },
    counterOffer: {
        amount: Number,
        message: String,
        timestamp: Date
    },
    deliveryTime: {
        type: Number,
        required: true,
        min: 1,
        max: 365
    }
}, {
    timestamps: true
});

// Index for better query performance
bidSchema.index({ projectId: 1, freelancerId: 1 });
bidSchema.index({ status: 1 });

export const Bid = mongoose.model('Bid', bidSchema);