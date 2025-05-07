import { Bid } from '../../models/Bid.js';

export const getBidStats = async (req, res) => {
    try {
        const { projectId } = req.params;

        // Get basic bid statistics
        const stats = await Bid.aggregate([
            { $match: { projectId: projectId } },
            {
                $group: {
                    _id: null,
                    totalBids: { $sum: 1 },
                    averageAmount: { $avg: '$amount' },
                    minAmount: { $min: '$amount' },
                    maxAmount: { $max: '$amount' },
                    averageDeliveryTime: { $avg: '$deliveryTime' }
                }
            }
        ]);

        // Get status distribution
        const statusDistribution = await Bid.aggregate([
            { $match: { projectId: projectId } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Get delivery time ranges
        const deliveryTimeRanges = await Bid.aggregate([
            { $match: { projectId: projectId } },
            {
                $bucket: {
                    groupBy: '$deliveryTime',
                    boundaries: [0, 7, 15, 30, Infinity],
                    default: 'other',
                    output: {
                        count: { $sum: 1 },
                        bids: { $push: { amount: '$amount', deliveryTime: '$deliveryTime' } }
                    }
                }
            }
        ]);

        // Get hourly bid trends
        const hourlyTrends = await Bid.aggregate([
            { $match: { projectId: projectId } },
            {
                $group: {
                    _id: {
                        hour: { $hour: '$createdAt' },
                        date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }
                    },
                    count: { $sum: 1 },
                    averageAmount: { $avg: '$amount' }
                }
            },
            { $sort: { '_id.date': 1, '_id.hour': 1 } }
        ]);

        res.json({
            basicStats: stats[0] || {
                totalBids: 0,
                averageAmount: 0,
                minAmount: 0,
                maxAmount: 0,
                averageDeliveryTime: 0
            },
            statusDistribution: statusDistribution.reduce((acc, curr) => {
                acc[curr._id] = curr.count;
                return acc;
            }, {}),
            deliveryTimeRanges,
            hourlyTrends
        });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching bid statistics', error: error.message });
    }
}; 