import mongoose from 'mongoose';

const earningsSchema = new mongoose.Schema({
    freelancerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: true
    },
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['pending', 'completed'],
        default: 'completed'
    }
}, {
    timestamps: true
});

// Index for faster queries
earningsSchema.index({ freelancerId: 1, date: -1 });
earningsSchema.index({ freelancerId: 1, status: 1 });

const Earnings = mongoose.model('Earnings', earningsSchema);

export default Earnings; 