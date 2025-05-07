import express from 'express';
import { authenticateToken, isAdmin } from '../../middleware/authMiddleware.js';
import { 
    getPendingVerifications,
    getFreelancersByVerificationStatus, 
    getFreelancerVerificationDetails, 
    processVerification,
    getVerificationStats,
    updateVerificationLevel
} from '../../controllers/admin/verificationController.js';

const router = express.Router();

// All admin routes are protected with authentication and admin role check
router.use(authenticateToken);
router.use(isAdmin);

// Get all pending verification requests
router.get('/pending', getPendingVerifications);

// Get all freelancers by verification status (unverified, pending, rejected, verified)
router.get('/freelancers/:status', getFreelancersByVerificationStatus);

// Get detailed verification info for a specific freelancer
router.get('/freelancer/:freelancerId', getFreelancerVerificationDetails);

// Process verification request (approve or reject)
router.post('/process/:freelancerId', processVerification);

// Get verification statistics
router.get('/stats', getVerificationStats);

// Update verification level of an already verified freelancer
router.patch('/level/:freelancerId', updateVerificationLevel);

export default router;