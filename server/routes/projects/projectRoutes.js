import express from 'express';
import { 
    createProject, 
    getProjects, 
    getProjectById, 
    updateProject, 
    deleteProject,
    changeProjectStatus,
    updateProjectProgress
} from '../../controllers/projects/projectController.js';
import { validateProject } from '../../middleware/projectValidation.js';
import { authenticateToken } from '../../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Create a new project (clients only)
router.post('/', 
    (req, res, next) => {
        if (req.user.role !== 'client') {
            return res.status(403).json({ message: 'Only clients can create projects' });
        }
        next();
    },
    validateProject,
    createProject
);

// Get all projects (filtered based on user role)
router.get('/', getProjects);

// Get specific project
router.get('/:id', getProjectById);

// Update project (clients only, their own projects)
router.put('/:id',
    (req, res, next) => {
        if (req.user.role !== 'client') {
            return res.status(403).json({ message: 'Only clients can update projects' });
        }
        next();
    },
    validateProject,
    updateProject
);

// Change project status (clients only)
router.patch('/:id/status',
    (req, res, next) => {
        if (req.user.role !== 'client') {
            return res.status(403).json({ message: 'Only clients can change project status' });
        }
        next();
    },
    changeProjectStatus
);

// Update project progress (freelancers only)
router.patch('/:id/progress',
    (req, res, next) => {
        if (req.user.role !== 'freelancer') {
            return res.status(403).json({ message: 'Only freelancers can update project progress' });
        }
        next();
    },
    updateProjectProgress
);

// Delete project (clients only, their own projects)
router.delete('/:id',
    (req, res, next) => {
        if (req.user.role !== 'client') {
            return res.status(403).json({ message: 'Only clients can delete projects' });
        }
        next();
    },
    deleteProject
);

export default router;