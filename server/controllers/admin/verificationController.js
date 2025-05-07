import { User } from '../../models/User.js';
import fs from 'fs';
import path from 'path';

// Get all freelancers with pending verification requests
export const getPendingVerifications = async (req, res) => {
    try {
        // Find all freelancers with pending verification status
        const freelancers = await User.find({
            role: 'freelancer',
            verificationStatus: 'pending',
            'verificationDocuments.0': { $exists: true } // Has at least one document
        })
        .select('-password -__v')
        .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: freelancers.length,
            data: freelancers
        });
    } catch (error) {
        console.error('Error fetching pending verifications:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching pending verification requests',
            error: error.message
        });
    }
};

// Get all freelancers by verification status
export const getFreelancersByVerificationStatus = async (req, res) => {
    try {
        const { status } = req.params;
        
        // Validate status parameter
        const validStatuses = ['unverified', 'pending', 'rejected', 'verified'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status parameter'
            });
        }

        // Find freelancers by verification status
        const freelancers = await User.find({
            role: 'freelancer',
            verificationStatus: status
        })
        .select('-password -__v')
        .sort({ updatedAt: -1 });

        res.json({
            success: true,
            count: freelancers.length,
            data: freelancers
        });
    } catch (error) {
        console.error(`Error fetching ${req.params.status} freelancers:`, error);
        res.status(500).json({
            success: false,
            message: 'Error fetching freelancers',
            error: error.message
        });
    }
};

// Get detailed verification info for a specific freelancer
export const getFreelancerVerificationDetails = async (req, res) => {
    try {
        const { freelancerId } = req.params;

        const freelancer = await User.findById(freelancerId)
            .select('name email verificationStatus verificationLevel verificationDocuments rejectionReason');

        if (!freelancer) {
            return res.status(404).json({
                success: false,
                message: 'Freelancer not found'
            });
        }

        res.json({
            success: true,
            data: freelancer
        });
    } catch (error) {
        console.error('Error fetching freelancer verification details:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching verification details',
            error: error.message
        });
    }
};

// Process verification request (approve or reject)
export const processVerification = async (req, res) => {
    try {
        const { freelancerId } = req.params;
        const { action, verificationLevel, rejectionReason, documentStatuses } = req.body;

        // Validate inputs
        if (!['approve', 'reject'].includes(action)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid action. Must be either "approve" or "reject"'
            });
        }

        const freelancer = await User.findById(freelancerId);
        if (!freelancer) {
            return res.status(404).json({
                success: false,
                message: 'Freelancer not found'
            });
        }

        // Update verification status based on action
        if (action === 'approve') {
            // Validate verification level if approving
            if (!['basic', 'verified', 'premium'].includes(verificationLevel)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid verification level'
                });
            }

            freelancer.verificationStatus = 'verified';
            freelancer.verificationLevel = verificationLevel;
            freelancer.verified = true; // Legacy field for backward compatibility
            
            // Update individual document statuses if provided
            if (documentStatuses && Array.isArray(documentStatuses)) {
                documentStatuses.forEach(docStatus => {
                    const docIndex = freelancer.verificationDocuments.findIndex(
                        doc => doc._id.toString() === docStatus.documentId
                    );
                    
                    if (docIndex !== -1) {
                        freelancer.verificationDocuments[docIndex].status = docStatus.status;
                        if (docStatus.adminFeedback) {
                            freelancer.verificationDocuments[docIndex].adminFeedback = docStatus.adminFeedback;
                        }
                    }
                });
            } else {
                // Default: mark all documents as approved
                freelancer.verificationDocuments.forEach(doc => {
                    doc.status = 'approved';
                });
            }
        } else {
            // For rejection
            if (!rejectionReason) {
                return res.status(400).json({
                    success: false,
                    message: 'Rejection reason is required'
                });
            }

            freelancer.verificationStatus = 'rejected';
            freelancer.rejectionReason = rejectionReason;

            // Mark all documents as rejected
            freelancer.verificationDocuments.forEach(doc => {
                doc.status = 'rejected';
            });
        }

        await freelancer.save();

        // TODO: Send notification to freelancer about verification result
        // This would connect to a notification service

        res.json({
            success: true,
            message: `Freelancer verification ${action === 'approve' ? 'approved' : 'rejected'} successfully`,
            data: {
                freelancerId: freelancer._id,
                status: freelancer.verificationStatus,
                level: freelancer.verificationLevel
            }
        });
    } catch (error) {
        console.error('Error processing verification:', error);
        res.status(500).json({
            success: false,
            message: 'Error processing verification request',
            error: error.message
        });
    }
};

// Get verification statistics
export const getVerificationStats = async (req, res) => {
    try {
        // Get count of freelancers by verification status
        const stats = await User.aggregate([
            { $match: { role: 'freelancer' } },
            { $group: { 
                _id: '$verificationStatus', 
                count: { $sum: 1 }
            }},
            { $project: {
                status: '$_id',
                count: 1,
                _id: 0
            }}
        ]);

        // Get count by verification level
        const levelStats = await User.aggregate([
            { $match: { role: 'freelancer', verificationStatus: 'verified' } },
            { $group: { 
                _id: '$verificationLevel', 
                count: { $sum: 1 }
            }},
            { $project: {
                level: '$_id',
                count: 1,
                _id: 0
            }}
        ]);

        res.json({
            success: true,
            data: {
                statusStats: stats,
                levelStats: levelStats
            }
        });
    } catch (error) {
        console.error('Error getting verification stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching verification statistics',
            error: error.message
        });
    }
};

// Update verification level of a verified freelancer
export const updateVerificationLevel = async (req, res) => {
    try {
        const { freelancerId } = req.params;
        const { verificationLevel } = req.body;

        // Validate verification level
        if (!['basic', 'verified', 'premium'].includes(verificationLevel)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid verification level'
            });
        }

        const freelancer = await User.findById(freelancerId);
        if (!freelancer) {
            return res.status(404).json({
                success: false,
                message: 'Freelancer not found'
            });
        }

        // Ensure freelancer is already verified
        if (freelancer.verificationStatus !== 'verified') {
            return res.status(400).json({
                success: false,
                message: 'Cannot update level for non-verified freelancer'
            });
        }

        freelancer.verificationLevel = verificationLevel;
        await freelancer.save();

        res.json({
            success: true,
            message: 'Verification level updated successfully',
            data: {
                freelancerId: freelancer._id,
                verificationLevel: freelancer.verificationLevel
            }
        });
    } catch (error) {
        console.error('Error updating verification level:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating verification level',
            error: error.message
        });
    }
};