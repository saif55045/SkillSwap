import express from 'express';
import { protect, isAdmin } from '../../middleware/authMiddleware.js';
import * as userController from '../../controllers/admin/userController.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(protect, isAdmin);

// Get all users with pagination and filtering
router.get('/', userController.getAllUsers);

// Get user statistics
router.get('/stats', userController.getUserStats);

// Get specific user details
router.get('/:userId', userController.getUserById);

// Update user
router.put('/:userId', userController.updateUser);

export default router;