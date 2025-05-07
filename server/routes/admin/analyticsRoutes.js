import express from 'express';
import { protect, isAdmin } from '../../middleware/authMiddleware.js';
import * as analyticsController from '../../controllers/admin/analyticsController.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(protect, isAdmin);

// Platform growth analytics (users and projects over time)
router.get('/platform-growth', analyticsController.getPlatformGrowth);

// Revenue analytics
router.get('/revenue', analyticsController.getRevenueAnalytics);

// Popular skills analytics
router.get('/popular-skills', analyticsController.getPopularSkills);

// Verification statistics
router.get('/verification-stats', analyticsController.getVerificationStats);

// Transaction statistics
router.get('/transactions', analyticsController.getTransactionStats);

// Dashboard overview statistics
router.get('/dashboard-stats', analyticsController.getDashboardStats);

export default router;