import express from 'express';
import { authenticateToken } from '../../middleware/authMiddleware.js';
import { 
    upload, 
    requestVerification, 
    getVerificationStatus, 
    getVerificationDocuments,
    deleteVerificationDocument 
} from '../../controllers/freelancer/verificationController.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Freelancer verification routes
router.post('/request', upload, requestVerification);
router.get('/status', getVerificationStatus);
router.get('/documents', getVerificationDocuments);
router.delete('/documents/:documentId', deleteVerificationDocument);

export default router;