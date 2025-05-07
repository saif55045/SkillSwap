import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    minBudget: {
        type: Number,
        required: true
    },
    maxBudget: {
        type: Number,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    skills: [{
        type: String,
        required: true
    }],
    status: {
        type: String,
        enum: ['open', 'in-progress', 'completed', 'cancelled'],
        default: 'open'
    },
    progress: {
        type: Number,
        min: 0,
        max: 100,
        default: 0
    },
    selectedFreelancer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    finalBidAmount: {
        type: Number
    },
    startDate: {
        type: Date
    },
    completionDate: {
        type: Date
    },
    bids: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bid'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Add index for faster queries
projectSchema.index({ status: 1, clientId: 1 });
projectSchema.index({ status: 1, selectedFreelancer: 1 });
projectSchema.index({ skills: 1 });

export const Project = mongoose.model('Project', projectSchema);