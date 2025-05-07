import express from 'express';
import { protect, isAdmin } from '../../middleware/authMiddleware.js';
import * as projectController from '../../controllers/admin/projectController.js';

const router = express.Router();

// All routes require authentication and admin role
router.use(protect, isAdmin);

// Get all projects with pagination and filtering
router.get('/', projectController.getAllProjects);

// Get project statistics
router.get('/stats', projectController.getProjectStats);

// Get specific project details
router.get('/:projectId', projectController.getProjectById);

// Update project status
router.put('/:projectId/status', projectController.updateProjectStatus);

export default router;