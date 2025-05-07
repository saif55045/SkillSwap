import mongoose from 'mongoose';
import Earnings from '../../models/Earnings.js';
import { Project } from '../../models/Project.js';

export const getEarnings = async (req, res) => {
    try {
        console.log('erning');
        const { period, status } = req.query;
        const freelancerId = req.user.id;
        
        console.log('Fetching earnings for freelancer:', freelancerId);
        console.log('Query params:', { period, status });

        // Build query based on filters
        const query = { freelancerId };

        // Add status filter if not 'all'
        if (status && status !== 'all') {
            query.status = status;
        }

        // Add date filter based on period
        if (period && period !== 'all') {
            const now = new Date();
            let startDate;

            switch (period) {
                case 'week':
                    startDate = new Date(now.setDate(now.getDate() - 7));
                    break;
                case 'month':
                    startDate = new Date(now.setMonth(now.getMonth() - 1));
                    break;
                case 'year':
                    startDate = new Date(now.setFullYear(now.getFullYear() - 1));
                    break;
                default:
                    startDate = new Date(0); // Beginning of time
            }

            query.date = { $gte: startDate };
        }

        console.log('Final query:', query);

        // Fetch earnings with populated project and client details
        const earnings = await Earnings.find(query)
            .populate('projectId', 'title')
            .populate('clientId', 'name')
            .sort({ date: -1 });

        console.log(`Found ${earnings.length} earnings records`);

        // If no earnings found, return empty array instead of error
        if (!earnings || earnings.length === 0) {
            return res.json({
                data: [],
                message: 'No earnings found for the given criteria'
            });
        }

        res.json({
            data: earnings,
            message: 'Earnings fetched successfully'
        });
    } catch (error) {
        console.error('Error fetching earnings:', error);
        res.status(500).json({
            message: 'Error fetching earnings data',
            error: error.message
        });
    }
};

export const exportEarnings = async (req, res) => {
    try {
        const { period, status, format } = req.query;
        const freelancerId = req.user.id;

        // Build query based on filters (same as getEarnings)
        const query = { freelancerId };

        if (status && status !== 'all') {
            query.status = status;
        }

        if (period && period !== 'all') {
            const now = new Date();
            let startDate;

            switch (period) {
                case 'week':
                    startDate = new Date(now.setDate(now.getDate() - 7));
                    break;
                case 'month':
                    startDate = new Date(now.setMonth(now.getMonth() - 1));
                    break;
                case 'year':
                    startDate = new Date(now.setFullYear(now.getFullYear() - 1));
                    break;
                default:
                    startDate = new Date(0);
            }

            query.date = { $gte: startDate };
        }

        const earnings = await Earnings.find(query)
            .populate('projectId', 'title')
            .populate('clientId', 'name')
            .sort({ date: -1 });

        // Format data based on requested format
        let formattedData;
        let contentType;
        let fileExtension;

        if (format === 'csv') {
            formattedData = formatToCSV(earnings);
            contentType = 'text/csv';
            fileExtension = 'csv';
        } else {
            formattedData = JSON.stringify(earnings, null, 2);
            contentType = 'application/json';
            fileExtension = 'json';
        }

        // Set response headers for file download
        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Disposition', `attachment; filename=earnings-${Date.now()}.${fileExtension}`);

        res.send(formattedData);
    } catch (error) {
        console.error('Error exporting earnings:', error);
        res.status(500).json({
            message: 'Error exporting earnings data',
            error: error.message
        });
    }
};

// Helper function to format earnings data to CSV
const formatToCSV = (earnings) => {
    const headers = ['Project', 'Client', 'Amount', 'Date', 'Status'];
    const rows = earnings.map(earning => [
        earning.projectId.title,
        earning.clientId.name,
        earning.amount,
        new Date(earning.date).toLocaleDateString(),
        earning.status
    ]);

    return [
        headers.join(','),
        ...rows.map(row => row.join(','))
    ].join('\n');
};

// New function to sync missing earnings for completed projects
export const syncMissingEarnings = async (req, res) => {
    try {
        const freelancerId = req.user.id;
        console.log(`Syncing missing earnings for freelancer: ${freelancerId}`);
        
        // Find all projects where this freelancer is selected and either:
        // 1. Project status is completed, or
        // 2. Progress is 100%
        const completedProjects = await Project.find({
            selectedFreelancer: freelancerId,
            $or: [
                { status: 'completed' },
                { progress: 100 }
            ]
        });
        
        console.log(`Found ${completedProjects.length} completed projects`);
        
        let newEarningsCount = 0;
        
        // For each completed project, check if earnings record exists
        for (const project of completedProjects) {
            // Skip if no finalBidAmount is set
            if (!project.finalBidAmount) {
                console.log(`Project ${project._id} has no finalBidAmount, skipping`);
                continue;
            }
            
            // Check if earnings record already exists
            const existingEarning = await Earnings.findOne({ 
                projectId: project._id,
                freelancerId: freelancerId
            });
            
            if (!existingEarning) {
                // Create new earnings record
                const earning = new Earnings({
                    freelancerId: freelancerId,
                    projectId: project._id,
                    clientId: project.clientId,
                    amount: project.finalBidAmount,
                    date: project.completionDate || new Date(),
                    status: project.status === 'completed' ? 'completed' : 'pending'
                });
                
                await earning.save();
                newEarningsCount++;
                console.log(`Created earnings record for project ${project._id}`);
            }
        }
        
        res.json({
            message: `Synced missing earnings. Created ${newEarningsCount} new earnings records.`,
            newRecordsCount: newEarningsCount
        });
    } catch (error) {
        console.error('Error syncing missing earnings:', error);
        res.status(500).json({
            message: 'Error syncing missing earnings',
            error: error.message
        });
    }
};