import { body, validationResult } from 'express-validator';

export const validateProject = [
    body('title')
        .trim()
        .isLength({ min: 5, max: 100 })
        .withMessage('Title must be between 5 and 100 characters'),
    body('description')
        .trim()
        .isLength({ min: 20, max: 1000 })
        .withMessage('Description must be between 20 and 1000 characters'),
    body('requirements')
        .isArray()
        .withMessage('Requirements must be an array')
        .custom(requirements => requirements.length > 0)
        .withMessage('At least one requirement is needed'),
    body('requirements.*')
        .trim()
        .notEmpty()
        .withMessage('Each requirement must not be empty'),
    body('deadline')
        .isISO8601()
        .withMessage('Invalid deadline date')
        .custom(value => new Date(value) > new Date())
        .withMessage('Deadline must be in the future'),
    body('minBudget')
        .isNumeric()
        .withMessage('Minimum budget must be a number')
        .custom(value => value > 0)
        .withMessage('Minimum budget must be greater than 0'),
    body('maxBudget')
        .isNumeric()
        .withMessage('Maximum budget must be a number')
        .custom((value, { req }) => value >= req.body.minBudget)
        .withMessage('Maximum budget must be greater than or equal to minimum budget'),
    body('duration')
        .isInt({ min: 1, max: 365 })
        .withMessage('Duration must be between 1 and 365 days'),
    body('category')
        .trim()
        .notEmpty()
        .withMessage('Category is required'),
    body('skills')
        .isArray()
        .withMessage('Skills must be an array')
        .custom(skills => skills.length > 0)
        .withMessage('At least one skill is required'),
    body('skills.*')
        .trim()
        .notEmpty()
        .withMessage('Each skill must not be empty'),
    (req, res, next) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        next();
    }
];