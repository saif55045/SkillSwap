import express from 'express';
import { validateBid, validateCounterOffer } from '../../middleware/bidValidation.js';
import { 
    createBid, 
    getProjectBids, 
    updateBidStatus, 
    createCounterOffer, 
    acceptCounterOffer, 
    getFreelancerBids 
} from '../../controllers/bids/bidController.js';
import { getBidStats } from '../../controllers/bids/bidStatsController.js';
import { authenticateToken } from '../../middleware/authMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateToken);

// Create a new bid for a project
router.post('/projects/:projectId/bids', validateBid, createBid);

// Get all bids for a project
router.get('/projects/:projectId/bids', getProjectBids);

// Get bid statistics for a project
router.get('/projects/:projectId/bids/stats', getBidStats);

// Get all bids by a freelancer
router.get('/freelancers/:freelancerId/bids', getFreelancerBids);

// Update bid status (accept/reject)
router.patch('/bids/:bidId/status', updateBidStatus);

// Create counter offer for a bid
router.post('/bids/:bidId/counter-offer', validateCounterOffer, createCounterOffer);

// Accept counter offer
router.post('/bids/:bidId/accept-counter', acceptCounterOffer);

export default router;