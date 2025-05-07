import { Bid } from '../../models/Bid.js';
import { Project } from '../../models/Project.js';

// Create a new bid
export const createBid = async (req, res) => {
    try {
        console.log(req.params);
        const { projectId } = req.params;
        
        const { amount, proposal, deliveryTime } = req.body;
        console.log(amount, proposal, deliveryTime);
        // Check if project exists and is open
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }
        if (project.status !== 'open') {
            return res.status(400).json({ message: 'Cannot bid on a closed project' });
        }

        // Create the bid
        const bid = new Bid({
            projectId,
            freelancerId: req.user.id,
            amount,
            proposal,
            deliveryTime
        });

        await bid.save();

        // Add bid to project's bids array
        project.bids.push(bid._id);
        await project.save();

        // Emit real-time notification
        const io = req.app.get('io');
        io.to(`project_${projectId}`).emit('bid_received', {
            bid,
            message: 'New bid received'
        });

        res.status(201).json({
            message: 'Bid created successfully',
            bid
        });
    } catch (error) {
        console.error('Bid creation error:', error);
        res.status(500).json({ 
            message: 'Error creating bid', 
            error: error.message 
        });
    }
};

// Get all bids for a project
export const getProjectBids = async (req, res) => {
    try {
        const { projectId } = req.params;
        
        const bids = await Bid.find({ projectId })
            .populate('freelancerId', 'name')
            .sort({ createdAt: -1 });

        res.json(bids);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error fetching bids', 
            error: error.message 
        });
    }
};

// Update bid status
export const updateBidStatus = async (req, res) => {
    try {
        const { bidId } = req.params;
        const { status } = req.body;

        const bid = await Bid.findById(bidId);
        if (!bid) {
            return res.status(404).json({ message: 'Bid not found' });
        }

        // Only project owner can update bid status
        const project = await Project.findById(bid.projectId);
        if (project.clientId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to update bid status' });
        }

        bid.status = status;
        await bid.save();

        // If bid is accepted, update project
        if (status === 'accepted') {
            project.selectedFreelancer = bid.freelancerId;
            project.finalBidAmount = bid.amount;
            project.status = 'in-progress';
            project.startDate = new Date();
            await project.save();
        }

        res.json({
            message: 'Bid status updated successfully',
            bid
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error updating bid status', 
            error: error.message 
        });
    }
};

// Create counter offer
export const createCounterOffer = async (req, res) => {
    try {
        const { bidId } = req.params;
        const { amount, message } = req.body;

        const bid = await Bid.findById(bidId);
        if (!bid) {
            return res.status(404).json({ message: 'Bid not found' });
        }

        // Only project owner can create counter offer
        const project = await Project.findById(bid.projectId);
        if (project.clientId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to create counter offer' });
        }

        bid.counterOffer = {
            amount,
            message,
            timestamp: new Date()
        };
        bid.status = 'countered';
        await bid.save();

        res.json({
            message: 'Counter offer created successfully',
            bid
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error creating counter offer', 
            error: error.message 
        });
    }
};

export const acceptCounterOffer = async (req, res) => {
    try {
        const { bidId } = req.params;
        const freelancerId = req.user.id;

        const bid = await Bid.findById(bidId)
            .populate('freelancerId', 'name verified skills');

        if (!bid) {
            return res.status(404).json({ message: 'Bid not found' });
        }

        if (bid.freelancerId._id.toString() !== freelancerId) {
            return res.status(403).json({ message: 'Not authorized to accept this counter offer' });
        }

        if (bid.status !== 'countered') {
            return res.status(400).json({ message: 'No counter offer to accept' });
        }

        // Update bid with counter offer amount
        bid.amount = bid.counterOffer.amount;
        bid.status = 'pending';
        bid.counterOffer = undefined;
        await bid.save();

        // Emit real-time update
        const io = req.app.get('io');
        io.to(`project_${bid.projectId}`).emit('counter_offer_accepted', bid);

        res.json(bid);
    } catch (error) {
        res.status(500).json({ message: 'Error accepting counter offer', error: error.message });
    }
};

export const getFreelancerBids = async (req, res) => {
    try {
        const { freelancerId } = req.params;
        
        // Check if the user is requesting their own bids
        if (req.user.id !== freelancerId && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to view these bids' });
        }
        
        const bids = await Bid.find({ freelancerId })
            .populate('projectId', 'title description status clientId minBudget maxBudget duration deadline')
            .sort({ createdAt: -1 });
        
        res.json(bids);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching freelancer bids', error: error.message });
    }
};