import express from 'express';
import { protect, isAdmin } from '../../middleware/authMiddleware.js';
import * as notificationController from '../../controllers/notifications/notificationController.js';

const router = express.Router();

// Routes that require admin privileges
router.use('/admin', protect, isAdmin);
router.get('/admin/templates', notificationController.getNotificationTemplates);
router.put('/admin/templates', notificationController.updateNotificationTemplate);

// Routes for sending notifications (admin only)
router.post('/admin/verification', notificationController.sendVerificationNotification);
router.post('/admin/project', notificationController.sendProjectNotification);
router.post('/admin/payment', notificationController.sendPaymentNotification);
router.post('/admin/milestone', notificationController.sendMilestoneNotification);

export default router;