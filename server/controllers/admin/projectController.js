import { Project } from '../../models/Project.js';
import { Bid } from '../../models/Bid.js';
import { User } from '../../models/User.js';

// Get all projects with pagination and filtering
export const getAllProjects = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      status,
      category, 
      search,
      sortBy = 'createdAt', 
      sortOrder = -1 
    } = req.query;
    
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Build filter object
    const filter = {};
    if (status) {
      filter.status = status;
    }

    if (category) {
      filter.category = category;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Build sort object
    const sort = {};
    sort[sortBy] = parseInt(sortOrder);

    // Execute query with filters
    const projects = await Project.find(filter)
      .populate('clientId', 'name')
      .populate('selectedFreelancer', 'name')
      .sort(sort)
      .skip(skip)
      .limit(limitNum);

    // Get total count for pagination
    const total = await Project.countDocuments(filter);

    res.json({
      success: true,
      count: projects.length,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      total,
      data: projects
    });
  } catch (error) {
    console.error('Error fetching projects:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching projects',
      error: error.message
    });
  }
};

// Get project details by ID
export const getProjectById = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId)
      .populate('clientId', 'name email')
      .populate('selectedFreelancer', 'name email');
      
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Get bids for this project
    const bids = await Bid.find({ projectId })
      .populate('freelancerId', 'name email')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: {
        project,
        bids
      }
    });
  } catch (error) {
    console.error('Error fetching project details:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching project details',
      error: error.message
    });
  }
};

// Update project status
export const updateProjectStatus = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { status } = req.body;

    // Validate status
    const validStatuses = ['open', 'in-progress', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid project status'
      });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Update status
    project.status = status;
    await project.save();

    res.json({
      success: true,
      message: 'Project status updated successfully',
      data: {
        id: project._id,
        status: project.status
      }
    });
  } catch (error) {
    console.error('Error updating project status:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating project status',
      error: error.message
    });
  }
};

// Get project statistics
export const getProjectStats = async (req, res) => {
  try {
    // Count projects by status
    const projectsByStatus = await Project.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Count projects by category
    const projectsByCategory = await Project.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);

    // Count recently created projects (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const newProjects = await Project.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    // Average bid count per project
    const bidStats = await Bid.aggregate([
      {
        $group: {
          _id: '$projectId',
          bidCount: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: null,
          averageBids: { $avg: '$bidCount' },
          totalProjects: { $sum: 1 }
        }
      }
    ]);

    const averageBidsPerProject = bidStats.length > 0 ? bidStats[0].averageBids : 0;

    res.json({
      success: true,
      data: {
        projectsByStatus: projectsByStatus.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        projectsByCategory: projectsByCategory.reduce((acc, item) => {
          acc[item._id] = item.count;
          return acc;
        }, {}),
        newProjects,
        averageBidsPerProject
      }
    });
  } catch (error) {
    console.error('Error fetching project statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching project statistics',
      error: error.message
    });
  }
};