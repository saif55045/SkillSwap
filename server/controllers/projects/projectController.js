import { Project } from '../../models/Project.js';
import Earnings from '../../models/Earnings.js';

// Create a new project
export const createProject = async (req, res) => {
    try {
        // Transform the incoming data to match schema
        const projectData = {
            ...req.body,
            clientId: req.user.id,
            minBudget: Number(req.body.minBudget),
            maxBudget: Number(req.body.maxBudget),
            duration: Number(req.body.duration),
            // Ensure skills is an array of strings
            skills: Array.isArray(req.body.skills) ? req.body.skills.map(s => s.trim()) : []
        };

        const project = new Project(projectData);
        await project.save();
        
        res.status(201).json({
            message: 'Project created successfully',
            project
        });
    } catch (error) {
        console.error('Project creation error:', error);
        res.status(500).json({ 
            message: 'Error creating project', 
            error: error.message 
        });
    }
};

// Get all projects with filters
export const getProjects = async (req, res) => {
    try {
        const { 
            status, 
            category,
            search,
            page = 1,
            limit = 10
        } = req.query;

        let query = {};

        // Add filters
        if (status) query.status = status;
        // if (category) query.category = category;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } }
            ];
        }

        // Add client/freelancer specific filters
        if (req.user.role === 'client') {
            query.clientId = req.user.id;
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const projects = await Project.find(query)
            .populate('clientId', 'name')
            .populate('selectedFreelancer', 'name')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));
        
        const total = await Project.countDocuments(query);
        res.json({
            projects,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / parseInt(limit)),
            total
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error fetching projects', 
            error: error.message 
        });
    }
};

// Get a specific project
export const getProjectById = async (req, res) => {
    try {
        console.log('Fetching project with ID:', req.params.id);
        const project = await Project.findById(req.params.id)
            .populate('clientId', 'name')
            .populate('selectedFreelancer', 'name')
            .populate({
                path: 'bids',
                populate: {
                    path: 'freelancerId',
                    select: 'name'
                }
            });
        
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Ensure all required fields are present and properly formatted
        const formattedProject = {
            ...project.toObject(),
            skills: project.skills || [],
            status: project.status || 'open',
            startDate: project.startDate || null,
            completionDate: project.completionDate || null,
            finalBidAmount: project.finalBidAmount || null
        };

        res.json(formattedProject);
    } catch (error) {
        console.error('Error in getProjectById:', error);
        res.status(500).json({ 
            message: 'Error fetching project', 
            error: error.message 
        });
    }
};

// Update a project
export const updateProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Only allow client who created the project to update it
        if (project.clientId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to update this project' });
        }

        // Don't allow updates if project is completed or cancelled
        if (['completed', 'cancelled'].includes(project.status)) {
            return res.status(400).json({ message: 'Cannot update completed or cancelled projects' });
        }

        // Transform the update data
        const updateData = {
            ...req.body,
            minBudget: req.body.minBudget || req.body.budget,
            maxBudget: req.body.maxBudget || req.body.budget,
            skills: Array.isArray(req.body.skills) ? req.body.skills : 
                   req.body.skills?.split(',').map(s => s.trim()) || project.skills
        };

        const updatedProject = await Project.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true }
        );

        res.json({
            message: 'Project updated successfully',
            project: updatedProject
        });
    } catch (error) {
        console.error('Project update error:', error);
        res.status(500).json({ 
            message: 'Error updating project', 
            error: error.message 
        });
    }
};

// Delete a project
export const deleteProject = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Only allow client who created the project to delete it
        if (project.clientId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to delete this project' });
        }

        // Don't allow deletion if project is in progress
        if (project.status === 'in-progress') {
            return res.status(400).json({ message: 'Cannot delete a project that is in progress' });
        }

        await Project.findByIdAndDelete(req.params.id);

        res.json({ message: 'Project deleted successfully' });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error deleting project', 
            error: error.message 
        });
    }
};

// Change project status
export const changeProjectStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const project = await Project.findById(req.params.id);

        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Only allow client who created the project to change status
        if (project.clientId.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Not authorized to change project status' });
        }

        // Validate status transitions
        const validTransitions = {
            'open': ['in-progress', 'cancelled'],
            'in-progress': ['completed', 'cancelled'],
            'completed': [], // Cannot change status once completed
            'cancelled': [] // Cannot change status once cancelled
        };

        if (!validTransitions[project.status].includes(status)) {
            return res.status(400).json({ 
                message: `Cannot change status from ${project.status} to ${status}` 
            });
        }

        // Additional validation for in-progress
        if (status === 'in-progress' && !project.selectedFreelancer) {
            return res.status(400).json({ 
                message: 'Cannot start project without selecting a freelancer' 
            });
        }

        // Update status and completion date if needed
        const updateData = { 
            status,
            ...(status === 'completed' ? { completionDate: new Date() } : {})
        };

        const updatedProject = await Project.findByIdAndUpdate(
            req.params.id,
            { $set: updateData },
            { new: true }
        );

        // Handle earnings when project is completed
        if (status === 'completed' && project.selectedFreelancer) {
            try {
                // Check if earnings record already exists for this project
                const existingEarning = await Earnings.findOne({ projectId: project._id });
                
                if (!existingEarning) {
                    // Create a new earnings record if none exists
                    const earning = new Earnings({
                        freelancerId: project.selectedFreelancer,
                        projectId: project._id,
                        clientId: project.clientId,
                        amount: project.finalBidAmount,
                        date: new Date(),
                        status: 'completed'
                    });
                    
                    await earning.save();
                    console.log(`Created earnings record for project ${project._id}`);
                } else {
                    // Update existing earnings record from pending to completed
                    existingEarning.status = 'completed';
                    await existingEarning.save();
                    console.log(`Updated earnings record for project ${project._id} to completed`);
                }
            } catch (earningError) {
                console.error('Error handling earnings record:', earningError);
                // Don't fail the whole request if earnings creation fails
            }
        }

        res.json({
            message: 'Project status updated successfully',
            project: updatedProject
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error changing project status', 
            error: error.message 
        });
    }
};

// Update project progress
export const updateProjectProgress = async (req, res) => {
    try {
        const { id } = req.params;
        const { progress } = req.body;
        const userId = req.user.id;

        console.log(`Updating progress for project ${id} to ${progress}% by user ${userId}`);

        // Validate progress value
        if (progress < 0 || progress > 100) {
            return res.status(400).json({ message: 'Progress must be between 0 and 100' });
        }

        const project = await Project.findById(id);
        if (!project) {
            return res.status(404).json({ message: 'Project not found' });
        }

        // Check if the project has a selected freelancer
        if (!project.selectedFreelancer) {
            return res.status(400).json({ message: 'Project does not have an assigned freelancer' });
        }

        // Convert the selectedFreelancer to string for comparison
        // This handles both object ID and string ID formats
        const selectedFreelancerId = project.selectedFreelancer._id 
            ? project.selectedFreelancer._id.toString() 
            : project.selectedFreelancer.toString();
        
        console.log('Selected freelancer ID:', selectedFreelancerId);
        console.log('Request user ID:', userId);
        
        // For testing purposes, temporarily allow any freelancer to update progress
        // Uncomment for production use
        /*
        if (selectedFreelancerId !== userId) {
            return res.status(403).json({ 
                message: 'Not authorized to update this project',
                selectedFreelancerId,
                userId
            });
        }
        */

        // Update the progress field
        project.progress = progress;
        await project.save();

        // If progress is 100%, create an earnings record and optionally update project status
        if (progress === 100 && project.status === 'in-progress') {
            try {
                // Check if earnings record already exists for this project
                const existingEarning = await Earnings.findOne({ projectId: project._id });
                
                if (!existingEarning) {
                    const earning = new Earnings({
                        freelancerId: selectedFreelancerId,
                        projectId: project._id,
                        clientId: project.clientId,
                        amount: project.finalBidAmount,
                        date: new Date(),
                        status: 'pending' // Set as pending until client marks project as completed
                    });
                    
                    await earning.save();
                    console.log(`Created pending earnings record for project ${project._id}`);
                    
                    // Optionally notify client that project is ready for review
                    // This would integrate with your notification system
                }
            } catch (earningError) {
                console.error('Error creating earnings record:', earningError);
                // Don't fail the whole request if earnings creation fails
            }
        }

        // Get the updated project with populated fields
        const updatedProject = await Project.findById(id)
            .populate('clientId', 'name')
            .populate('selectedFreelancer', 'name');

        res.json({
            message: 'Project progress updated successfully',
            project: updatedProject
        });
    } catch (error) {
        console.error('Error updating project progress:', error);
        res.status(500).json({ 
            message: 'Error updating project progress', 
            error: error.message 
        });
    }
};