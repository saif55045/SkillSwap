import express from 'express';
import { authenticateToken } from '../../middleware/authMiddleware.js';
import { 
    validateReviewCreation, 
    validateReviewUpdate, 
    validateFreelancerResponse 
} from '../../middleware/reviewValidation.js';
import {
    createReview,
    getFreelancerReviews,
    addFreelancerResponse,
    getProjectReviews,
    updateReview,
    deleteReview
} from '../../controllers/reviews/reviewController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Create a new review
router.post('/create', validateReviewCreation, createReview);

// Get all reviews for a freelancer
router.get('/freelancers/:freelancerId', getFreelancerReviews);

// Get all reviews for a project
router.get('/projects/:projectId', getProjectReviews);

// Add a freelancer's response to a review
router.post('/:reviewId/response', validateFreelancerResponse, addFreelancerResponse);

// Update a review
router.put('/:reviewId', validateReviewUpdate, updateReview);

// Delete a review
router.delete('/:reviewId', deleteReview);

export default router;