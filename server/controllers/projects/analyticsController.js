import { Project } from '../../models/Project.js';
import { User } from '../../models/User.js';
import { Bid } from '../../models/Bid.js';
import Review from '../../models/Review.js';
import mongoose from 'mongoose';

// Get project analytics for client dashboard
export const getClientAnalytics = async (req, res) => {
  try {
    const { clientId } = req.params;
    const { startDate, endDate } = req.query;
    
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }

    // Get projects by status count
    const projectStatusCounts = await Project.aggregate([
      { $match: { clientId: new mongoose.Types.ObjectId(clientId), ...dateFilter } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // Get bid analytics for client's projects
    const projects = await Project.find({ clientId: new mongoose.Types.ObjectId(clientId) }).select('_id');
    const projectIds = projects.map(project => project._id);

    const bidAnalytics = await Bid.aggregate([
      { $match: { projectId: { $in: projectIds }, ...dateFilter } },
      { $group: {
        _id: '$projectId',
        avgBidAmount: { $avg: '$amount' },
        minBid: { $min: '$amount' },
        maxBid: { $max: '$amount' },
        bidCount: { $sum: 1 }
      }}
    ]);

    // Get project activity timeline
    const projectTimeline = await Project.aggregate([
      { $match: { clientId: new mongoose.Types.ObjectId(clientId), ...dateFilter } },
      { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 }
      }},
      { $sort: { _id: 1 } }
    ]);

    // Get freelancer performance for client's projects
    const freelancerPerformance = await Project.aggregate([
      { $match: { 
        clientId: new mongoose.Types.ObjectId(clientId),
        status: 'completed',
        selectedFreelancer: { $exists: true }
      }},
      { $lookup: {
        from: 'users',
        localField: 'selectedFreelancer',
        foreignField: '_id',
        as: 'freelancerInfo'
      }},
      { $unwind: '$freelancerInfo' },
      { $lookup: {
        from: 'reviews',
        let: { projectId: '$_id', freelancerId: '$selectedFreelancer' },
        pipeline: [
          { $match: { 
            $expr: { 
              $and: [
                { $eq: ['$projectId', '$$projectId'] },
                { $eq: ['$freelancerId', '$$freelancerId'] }
              ]
            }
          }},
        ],
        as: 'reviewInfo'
      }},
      { $unwind: { path: '$reviewInfo', preserveNullAndEmptyArrays: true } },
      { $group: {
        _id: '$selectedFreelancer',
        name: { $first: '$freelancerInfo.name' },
        completedProjects: { $sum: 1 },
        avgRating: { $avg: { $ifNull: ['$reviewInfo.rating', 0] } },
        onTimeCompletion: {
          $sum: {
            $cond: [
              { $lte: ['$completedAt', '$deadline'] },
              1,
              0
            ]
          }
        }
      }},
      { $project: {
        _id: 1,
        name: 1,
        completedProjects: 1,
        avgRating: 1,
        onTimePercentage: {
          $multiply: [
            { $divide: ['$onTimeCompletion', '$completedProjects'] },
            100
          ]
        }
      }}
    ]);

    // Budget analytics - comparing project budgets with actual bid amounts
    const budgetAnalytics = await Project.aggregate([
      { $match: { clientId: new mongoose.Types.ObjectId(clientId), status: { $in: ['in-progress', 'completed'] } } },
      { $lookup: {
        from: 'bids',
        localField: 'selectedBid',
        foreignField: '_id',
        as: 'selectedBidInfo'
      }},
      { $unwind: { path: '$selectedBidInfo', preserveNullAndEmptyArrays: true } },
      { $project: {
        title: 1,
        minBudget: 1,
        maxBudget: 1,
        avgBudget: { $avg: ['$minBudget', '$maxBudget'] },
        actualAmount: { $ifNull: ['$selectedBidInfo.amount', 0] },
        difference: { 
          $subtract: [
            { $ifNull: ['$selectedBidInfo.amount', 0] }, 
            { $avg: ['$minBudget', '$maxBudget'] }
          ]
        }
      }}
    ]);

    res.status(200).json({
      success: true,
      data: {
        projectStatusCounts,
        bidAnalytics,
        projectTimeline,
        freelancerPerformance,
        budgetAnalytics
      }
    });
    
  } catch (error) {
    console.error('Error fetching client analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch analytics data',
      error: error.message
    });
  }
};

// Export analytics data in CSV format
export const exportAnalyticsCSV = async (req, res) => {
  try {
    const { clientId } = req.params;
    const { startDate, endDate, type } = req.query;
    
    let data = [];
    let fields = [];
    let csvData = '';
    
    // Date filter for queries
    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }
    
    switch(type) {
      case 'projects':
        // Export projects data
        const projects = await Project.find({ 
          clientId: new mongoose.Types.ObjectId(clientId),
          ...dateFilter
        }).lean();
        
        fields = ['title', 'status', 'minBudget', 'maxBudget', 'duration', 'createdAt'];
        data = projects.map(project => ({
          title: project.title,
          status: project.status,
          minBudget: project.minBudget,
          maxBudget: project.maxBudget,
          duration: project.duration,
          createdAt: project.createdAt.toISOString().split('T')[0]
        }));
        break;
        
      case 'bids':
        // Export bids data
        const projectIds = await Project.find({
          clientId: new mongoose.Types.ObjectId(clientId)
        }).select('_id').lean();
        
        const bids = await Bid.find({
          projectId: { $in: projectIds.map(p => p._id) },
          ...dateFilter
        }).populate('projectId', 'title').populate('freelancerId', 'name').lean();
        
        fields = ['project', 'freelancer', 'amount', 'deliveryTime', 'status', 'createdAt'];
        data = bids.map(bid => ({
          project: bid.projectId.title,
          freelancer: bid.freelancerId.name || 'Unknown',
          amount: bid.amount,
          deliveryTime: bid.deliveryTime,
          status: bid.status,
          createdAt: bid.createdAt.toISOString().split('T')[0]
        }));
        break;
        
      case 'freelancers':
        // Export freelancer performance data
        const freelancerData = await Project.aggregate([
          { $match: { 
            clientId: new mongoose.Types.ObjectId(clientId),
            status: 'completed',
            selectedFreelancer: { $exists: true }
          }},
          { $lookup: {
            from: 'users',
            localField: 'selectedFreelancer',
            foreignField: '_id',
            as: 'freelancerInfo'
          }},
          { $unwind: '$freelancerInfo' },
          { $lookup: {
            from: 'reviews',
            let: { projectId: '$_id', freelancerId: '$selectedFreelancer' },
            pipeline: [
              { $match: { 
                $expr: { 
                  $and: [
                    { $eq: ['$projectId', '$$projectId'] },
                    { $eq: ['$freelancerId', '$$freelancerId'] }
                  ]
                }
              }},
            ],
            as: 'reviewInfo'
          }},
          { $unwind: { path: '$reviewInfo', preserveNullAndEmptyArrays: true } },
          { $project: {
            'freelancerName': '$freelancerInfo.name',
            'projectTitle': '$title',
            'rating': { $ifNull: ['$reviewInfo.rating', 0] },
            'onTime': { $lte: ['$completedAt', '$deadline'] },
            'completedDate': '$completedAt'
          }}
        ]);
        
        fields = ['freelancerName', 'projectTitle', 'rating', 'onTime', 'completedDate'];
        data = freelancerData.map(item => ({
          freelancerName: item.freelancerName,
          projectTitle: item.projectTitle,
          rating: item.rating,
          onTime: item.onTime ? 'Yes' : 'No',
          completedDate: item.completedDate ? item.completedDate.toISOString().split('T')[0] : 'N/A'
        }));
        break;
        
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid export type requested'
        });
    }
    
    // Generate CSV header
    csvData = fields.join(',') + '\n';
    
    // Generate CSV rows
    data.forEach(item => {
      const row = fields.map(field => {
        // Handle fields that might contain commas
        let value = item[field] ? String(item[field]) : '';
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          value = `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      csvData += row.join(',') + '\n';
    });
    
    // Set response headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=skillswap_${type}_${new Date().toISOString().split('T')[0]}.csv`);
    
    res.status(200).send(csvData);
    
  } catch (error) {
    console.error('Error exporting analytics data:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export analytics data',
      error: error.message
    });
  }
};