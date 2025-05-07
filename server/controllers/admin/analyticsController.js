import { User } from '../../models/User.js';
import { Project } from '../../models/Project.js';
import { Bid } from '../../models/Bid.js';
import Earnings from '../../models/Earnings.js';

// Get platform growth analytics
export const getPlatformGrowth = async (req, res) => {
  try {
    const { period = 'monthly' } = req.query;
    
    let groupBy = {
      month: { $month: '$createdAt' },
      year: { $year: '$createdAt' }
    };
    
    if (period === 'weekly') {
      groupBy = {
        week: { $week: '$createdAt' },
        year: { $year: '$createdAt' }
      };
    } else if (period === 'daily') {
      groupBy = {
        day: { $dayOfMonth: '$createdAt' },
        month: { $month: '$createdAt' },
        year: { $year: '$createdAt' }
      };
    }

    const userGrowth = await User.aggregate([
      {
        $group: {
          _id: groupBy,
          newUsers: { $sum: 1 },
          freelancers: {
            $sum: { $cond: [{ $eq: ['$role', 'freelancer'] }, 1, 0] }
          },
          clients: {
            $sum: { $cond: [{ $eq: ['$role', 'client'] }, 1, 0] }
          }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    const projectGrowth = await Project.aggregate([
      {
        $group: {
          _id: groupBy,
          newProjects: { $sum: 1 },
          totalBudget: { $sum: '$budget' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.status(200).json({
      success: true,
      data: {
        userGrowth,
        projectGrowth
      }
    });
  } catch (error) {
    console.error('Error getting platform growth:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving platform growth data',
      error: error.message
    });
  }
};

// Get revenue analytics
export const getRevenueAnalytics = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const matchCriteria = {};
    if (startDate && endDate) {
      matchCriteria.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    
    const revenueData = await Earnings.aggregate([
      { $match: matchCriteria },
      {
        $group: {
          _id: {
            month: { $month: '$createdAt' },
            year: { $year: '$createdAt' }
          },
          totalRevenue: { $sum: '$platformFee' },
          transactionCount: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    // Calculate revenue projections based on growth rate
    let projections = [];
    if (revenueData.length > 1) {
      const lastMonth = revenueData[revenueData.length - 1];
      const secondLastMonth = revenueData[revenueData.length - 2];
      
      if (lastMonth.totalRevenue && secondLastMonth.totalRevenue) {
        const growthRate = (lastMonth.totalRevenue - secondLastMonth.totalRevenue) / secondLastMonth.totalRevenue;
        
        // Project next 3 months
        let projectedRevenue = lastMonth.totalRevenue;
        for (let i = 1; i <= 3; i++) {
          projectedRevenue = projectedRevenue * (1 + growthRate);
          projections.push({
            month: i,
            projectedRevenue: Math.round(projectedRevenue)
          });
        }
      }
    }
    
    res.status(200).json({
      success: true,
      data: {
        revenueData,
        projections
      }
    });
  } catch (error) {
    console.error('Error getting revenue analytics:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving revenue analytics',
      error: error.message
    });
  }
};

// Get popular skills analytics
export const getPopularSkills = async (req, res) => {
  try {
    // Get most popular skills based on freelancer profiles
    const popularSkills = await User.aggregate([
      { $match: { role: 'freelancer' } },
      { $unwind: '$skills' },
      {
        $group: {
          _id: '$skills',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    // Get most demanded skills based on project requirements
    const demandedSkills = await Project.aggregate([
      { $unwind: '$requiredSkills' },
      {
        $group: {
          _id: '$requiredSkills',
          count: { $sum: 1 },
          avgBudget: { $avg: '$budget' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        popularSkills,
        demandedSkills
      }
    });
  } catch (error) {
    console.error('Error getting popular skills:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving popular skills data',
      error: error.message
    });
  }
};

// Get verification statistics
export const getVerificationStats = async (req, res) => {
  try {
    const verificationStats = await User.aggregate([
      { $match: { role: 'freelancer' } },
      {
        $group: {
          _id: '$verificationStatus',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const totalFreelancers = await User.countDocuments({ role: 'freelancer' });
    
    res.status(200).json({
      success: true,
      data: {
        verificationStats,
        totalFreelancers
      }
    });
  } catch (error) {
    console.error('Error getting verification stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving verification statistics',
      error: error.message
    });
  }
};

// Get transaction statistics
export const getTransactionStats = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    let dateFilter = {};
    if (period === 'week') {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      dateFilter = { createdAt: { $gte: oneWeekAgo } };
    } else if (period === 'month') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      dateFilter = { createdAt: { $gte: oneMonthAgo } };
    } else if (period === 'year') {
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      dateFilter = { createdAt: { $gte: oneYearAgo } };
    }
    
    const transactions = await Earnings.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          averageAmount: { $avg: '$amount' },
          platformRevenue: { $sum: '$platformFee' },
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.status(200).json({
      success: true,
      data: transactions[0] || {
        totalAmount: 0,
        averageAmount: 0,
        platformRevenue: 0,
        count: 0
      }
    });
  } catch (error) {
    console.error('Error getting transaction stats:', error);
    res.status(500).json({
      success: false,
      message: 'Error retrieving transaction statistics',
      error: error.message
    });
  }
};

/**
 * Get dashboard statistics for admin overview
 * Combines key stats in a single API call for dashboard display
 */
export const getDashboardStats = async (req, res) => {
    try {
        const { User } = await import('../../models/User.js');
        const { Project } = await import('../../models/Project.js');
        
        // Get verification requests count (pending verification)
        const pendingVerifications = await User.countDocuments({
            role: 'freelancer',
            verificationStatus: 'pending'
        });
        
        // Get new users count (registered in the last 7 days)
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        const newUsers = await User.countDocuments({
            createdAt: { $gte: oneWeekAgo }
        });
        
        // Get active projects count
        const activeProjects = await Project.countDocuments({
            status: { $in: ['open', 'in-progress'] }
        });
        
        // Platform health: Check if there are major issues (simple calculation for demo)
        // In a real app, you might check various system metrics
        const totalUsers = await User.countDocuments();
        const totalProjects = await Project.countDocuments();
        const projectsPerUser = totalProjects / (totalUsers || 1);
        
        let platformHealth;
        if (projectsPerUser > 0.5) {
            platformHealth = 'Excellent';
        } else if (projectsPerUser > 0.2) {
            platformHealth = 'Good';
        } else if (projectsPerUser > 0.1) {
            platformHealth = 'Fair';
        } else {
            platformHealth = 'Needs Attention';
        }
        
        // Notification count (new system notifications)
        // In a real app, you would have a Notification model
        const notificationsCount = 'Active'; // Placeholder
        
        res.json({
            success: true,
            data: {
                pendingVerifications,
                newUsers,
                activeProjects,
                platformHealth,
                notificationsCount
            }
        });
    } catch (error) {
        console.error('Error getting dashboard stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error retrieving dashboard statistics',
            error: error.message
        });
    }
};