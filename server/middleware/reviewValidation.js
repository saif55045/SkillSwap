import { body, param, validationResult } from 'express-validator';
import mongoose from 'mongoose';

// Validation for creating a review
export const validateReviewCreation = [
    // Validate projectId
    body('projectId')
        .isMongoId().withMessage('Invalid project ID format')
        .notEmpty().withMessage('Project ID is required'),
    
    // Validate freelancerId 
    body('freelancerId')
        .isMongoId().withMessage('Invalid freelancer ID format')
        .notEmpty().withMessage('Freelancer ID is required'),
    
    // Validate rating (1-5 stars)
    body('rating')
        .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    
    // Validate comment
    body('comment')
        .isString().withMessage('Comment must be a string')
        .isLength({ min: 3, max: 500 }).withMessage('Comment must be between 3 and 500 characters'),
    
    // Optional isPublic flag
    body('isPublic')
        .optional()
        .isBoolean().withMessage('isPublic must be a boolean value'),
    
    // Check validation results
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

// Validation for updating a review
export const validateReviewUpdate = [
    // Validate reviewId
    param('reviewId')
        .isMongoId().withMessage('Invalid review ID format'),
    
    // Validate rating if provided
    body('rating')
        .optional()
        .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    
    // Validate comment if provided
    body('comment')
        .optional()
        .isString().withMessage('Comment must be a string')
        .isLength({ min: 3, max: 500 }).withMessage('Comment must be between 3 and 500 characters'),
    
    // Optional isPublic flag
    body('isPublic')
        .optional()
        .isBoolean().withMessage('isPublic must be a boolean value'),
    
    // Check validation results
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

// Validation for adding a freelancer response
export const validateFreelancerResponse = [
    // Validate reviewId
    param('reviewId')
        .isMongoId().withMessage('Invalid review ID format'),
    
    // Validate response
    body('response')
        .isString().withMessage('Response must be a string')
        .isLength({ min: 3, max: 500 }).withMessage('Response must be between 3 and 500 characters'),
    
    // Check validation results
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];