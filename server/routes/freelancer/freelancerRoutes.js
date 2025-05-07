import express from 'express';
import { 
    searchFreelancers, 
    getFreelancerDetails,
    getProfile,
    updateProfile,
    uploadPortfolioImage,
    getSkills,
    getVerificationStatus,
    getPublicFreelancerProfile
} from '../../controllers/freelancer/freelancerController.js';
import { getEarnings, exportEarnings, syncMissingEarnings } from '../../controllers/freelancer/earningsController.js';
import { authenticateToken } from '../../middleware/authMiddleware.js';
import multer from 'multer';
import verificationRoutes from './freelancerVerificationRoutes.js';

const router = express.Router();

// Setup multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    }
});

// Public routes
router.get('/search', searchFreelancers);
router.get('/skills', getSkills);
router.get('/public/:id', getPublicFreelancerProfile);

// Protected routes - require authentication
router.use(authenticateToken);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/verification', getVerificationStatus);
router.post('/portfolio/upload', upload.single('image'), uploadPortfolioImage);

// Mount verification routes
router.use('/verification', verificationRoutes);

// Earnings routes - must come BEFORE the /:id route
router.get('/earnings', getEarnings);
router.get('/earnings/export', exportEarnings);
router.post('/earnings/sync', syncMissingEarnings); // New route to sync missing earnings

// This route must come AFTER more specific routes since it's a catch-all
router.get('/:id', getFreelancerDetails);

export default router;