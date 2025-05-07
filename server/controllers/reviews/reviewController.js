import Review from '../../models/Review.js';
import { Project } from '../../models/Project.js';

// Create a new review for a completed project
export const createReview = async (req, res) => {
    try {
        const { projectId, freelancerId, rating, comment, isPublic = true } = req.body;
        const clientId = req.user.id;

        // Check if the project exists and is completed
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        if (project.status !== 'completed') {
            return res.status(400).json({ message: 'Can only review completed projects' });
        }

        // Verify that the client owns the project
        if (project.clientId.toString() !== clientId) {
            return res.status(403).json({ message: 'Not authorized to review this project' });
        }

        // Check if a review already exists for this project
        const existingReview = await Review.findOne({ projectId, clientId });
        if (existingReview) {
            return res.status(400).json({ message: 'You have already reviewed this project' });
        }

        // Create the review
        const review = new Review({
            projectId,
            clientId,
            freelancerId,
            rating,
            comment,
            isPublic
        });

        await review.save();

        // Calculate and update the freelancer's average rating
        const averageRating = await Review.calculateAverageRating(freelancerId);

        res.status(201).json({
            message: 'Review created successfully',
            review,
            averageRating
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error creating review', 
            error: error.message 
        });
    }
};

// Get all reviews for a freelancer
export const getFreelancerReviews = async (req, res) => {
    try {
        const { freelancerId } = req.params;
        const { sort = '-createdAt', rating } = req.query;

        let query = { freelancerId };
        
        // If user is not the freelancer or an admin, only show public reviews
        if (req.user.id !== freelancerId && req.user.role !== 'admin') {
            query.isPublic = true;
        }

        // Filter by rating if provided
        if (rating) {
            query.rating = parseInt(rating);
        }

        const reviews = await Review.find(query)
            .populate('clientId', 'name')
            .populate('projectId', 'title')
            .sort(sort);

        // Get average rating stats
        const averageRating = await Review.calculateAverageRating(freelancerId);

        res.json({
            reviews,
            stats: averageRating
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error fetching reviews', 
            error: error.message 
        });
    }
};

// Add a freelancer's response to a review
export const addFreelancerResponse = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { response } = req.body;
        const freelancerId = req.user.id;

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Verify that the freelancer is the one who was reviewed
        if (review.freelancerId.toString() !== freelancerId) {
            return res.status(403).json({ message: 'Not authorized to respond to this review' });
        }

        // Add the response
        review.freelancerResponse = response;
        await review.save();

        res.json({
            message: 'Response added successfully',
            review
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error adding response', 
            error: error.message 
        });
    }
};

// Get all reviews for a project
export const getProjectReviews = async (req, res) => {
    try {
        const { projectId } = req.params;

        const reviews = await Review.find({ projectId })
            .populate('clientId', 'name')
            .populate('freelancerId', 'name')
            .sort('-createdAt');

        res.json(reviews);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error fetching project reviews', 
            error: error.message 
        });
    }
};

// Update a review (client can update their own review)
export const updateReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { rating, comment, isPublic } = req.body;
        const clientId = req.user.id;

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Verify that the client owns the review
        if (review.clientId.toString() !== clientId) {
            return res.status(403).json({ message: 'Not authorized to update this review' });
        }

        // Update the review fields
        if (rating !== undefined) review.rating = rating;
        if (comment !== undefined) review.comment = comment;
        if (isPublic !== undefined) review.isPublic = isPublic;

        await review.save();

        // Recalculate average rating
        const averageRating = await Review.calculateAverageRating(review.freelancerId);

        res.json({
            message: 'Review updated successfully',
            review,
            averageRating
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error updating review', 
            error: error.message 
        });
    }
};

// Delete a review (client can delete their own review)
export const deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const clientId = req.user.id;

        const review = await Review.findById(reviewId);
        if (!review) {
            return res.status(404).json({ message: 'Review not found' });
        }

        // Verify that the client owns the review or is an admin
        if (review.clientId.toString() !== clientId && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to delete this review' });
        }

        const freelancerId = review.freelancerId;
        
        await Review.findByIdAndDelete(reviewId);

        // Recalculate average rating after deletion
        const averageRating = await Review.calculateAverageRating(freelancerId);

        res.json({
            message: 'Review deleted successfully',
            averageRating
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error deleting review', 
            error: error.message 
        });
    }
};