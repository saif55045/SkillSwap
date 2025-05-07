import { body, validationResult } from 'express-validator';

export const validateBid = [
    body('amount')
        .isNumeric()
        .withMessage('Bid amount must be a number')
        .custom(value => value > 0)
        .withMessage('Bid amount must be greater than 0'),
    body('proposal')
        .trim()
        .isLength({ min: 50, max: 1000 })
        .withMessage('Proposal must be between 50 and 1000 characters'),
    body('deliveryTime')
        .isInt({ min: 1, max: 365 })
        .withMessage('Delivery time must be between 1 and 365 days'),
    (req, res, next) => {
        const errors = validationResult(req);
        
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];

export const validateCounterOffer = [
    body('amount')
        .isNumeric()
        .withMessage('Counter offer amount must be a number')
        .custom(value => value > 0)
        .withMessage('Counter offer amount must be greater than 0'),
    body('message')
        .trim()
        .isLength({ min: 10, max: 500 })
        .withMessage('Counter offer message must be between 10 and 500 characters'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];