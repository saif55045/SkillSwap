import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
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
    freelancerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true,
        trim: true,
        minlength: 3,
        maxlength: 500
    },
    freelancerResponse: {
        type: String,
        trim: true,
        maxlength: 500
    },
    isPublic: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Static method to calculate average rating for a freelancer
reviewSchema.statics.calculateAverageRating = async function(freelancerId) {
    const result = await this.aggregate([
        { $match: { freelancerId: new mongoose.Types.ObjectId(freelancerId) } },
        { $group: { _id: '$freelancerId', averageRating: { $avg: '$rating' }, totalReviews: { $sum: 1 } } }
    ]);

    return result.length > 0 
        ? { averageRating: result[0].averageRating, totalReviews: result[0].totalReviews } 
        : { averageRating: 0, totalReviews: 0 };
};

const Review = mongoose.model('Review', reviewSchema);

export default Review;