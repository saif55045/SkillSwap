import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { config } from '../utils/config.js';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['client', 'freelancer', 'admin'],
        required: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    projects: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project'
    }],
    // Additional fields for freelancers
    skills: {
        type: [String],
        default: undefined
    },
    portfolio: {
        type: [{
            title: String,
            description: String,
            link: String
        }],
        default: undefined
    },
    verified: {
        type: Boolean,
        default: false
    },
    // Verification fields
    verificationLevel: {
        type: String,
        enum: ['none', 'basic', 'verified', 'premium'],
        default: 'none'
    },
    verificationStatus: {
        type: String,
        enum: ['unverified', 'pending', 'rejected', 'verified'],
        default: 'unverified'
    },
    verificationDocuments: [{
        type: {
            type: String,
            required: true,
            enum: ['id', 'certificate', 'portfolio', 'other']
        },
        filename: {
            type: String,
            required: true
        },
        fileUrl: {
            type: String,
            required: true
        },
        uploadDate: {
            type: Date,
            default: Date.now
        },
        status: {
            type: String,
            enum: ['pending', 'approved', 'rejected'],
            default: 'pending'
        },
        adminFeedback: {
            type: String,
            default: ''
        }
    }],
    rejectionReason: {
        type: String,
        default: ''
    },
    title: String,
    bio: String,
    hourlyRate: Number,
    education: [{
        institution: String,
        degree: String,
        field: String,
        from: Date,
        to: Date,
        current: Boolean
    }],
    experience: [{
        company: String,
        position: String,
        from: Date,
        to: Date,
        current: Boolean,
        description: String
    }]
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        this.password = await bcrypt.hash(this.password, config.SALT_ROUNDS);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model('User', userSchema);