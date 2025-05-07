import express from 'express';
import { getClientAnalytics, exportAnalyticsCSV } from '../../controllers/projects/analyticsController.js';
import { protect, authorize } from '../../middleware/authMiddleware.js';

const router = express.Router();

// Get client analytics - protected and only accessible by clients
router.get('/client/:clientId', protect, authorize('client'), getClientAnalytics);

// Export client analytics to CSV
router.get('/client/:clientId/export-csv', protect, authorize('client'), exportAnalyticsCSV);

export default router;