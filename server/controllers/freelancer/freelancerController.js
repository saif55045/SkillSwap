import { User } from '../../models/User.js';

export const searchFreelancers = async (req, res) => {
    try {
        const { 
            skills, 
            searchTerm,
            verificationStatus,
            sortBy = 'createdAt',
            page = 1,
            limit = 10
        } = req.query;

        let query = { role: 'freelancer' };

        // Add skills filter
        if (skills && skills.length > 0) {
            const skillsArray = skills.split(',');
            query.skills = { $in: skillsArray };
        }

        // Add search term filter (search in name or skills)
        if (searchTerm) {
            query.$or = [
                { name: { $regex: searchTerm, $options: 'i' } },
                { skills: { $regex: searchTerm, $options: 'i' } }
            ];
        }

        // Add verification status filter
        if (verificationStatus) {
            query.verified = verificationStatus === 'true';
        }

        // Convert pagination parameters to numbers
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        // Get total count for pagination
        const total = await User.countDocuments(query);

        // Execute query with pagination
        const freelancers = await User.find(query)
            .select('-password -__v')
            .sort(sortBy)
            .skip(skip)
            .limit(limitNum);

        res.json({
            freelancers,
            currentPage: pageNum,
            totalPages: Math.ceil(total / limitNum),
            total
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error searching freelancers', 
            error: error.message 
        });
    }
};

export const getFreelancerDetails = async (req, res) => {
    try {
        const freelancer = await User.findById(req.params.id)
            .select('-password -__v');

        if (!freelancer || freelancer.role !== 'freelancer') {
            return res.status(404).json({ message: 'Freelancer not found' });
        }

        res.json(freelancer);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error fetching freelancer details', 
            error: error.message 
        });
    }
};

export const getProfile = async (req, res) => {
    try {
        const freelancerId = req.user.id;
        
        const freelancer = await User.findById(freelancerId)
            .select('-password -__v');

        if (!freelancer) {
            return res.status(404).json({ message: 'Freelancer profile not found' });
        }

        // Response structure matching what the frontend expects
        res.json({
            data: freelancer,
            message: 'Profile fetched successfully'
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error fetching profile', 
            error: error.message 
        });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const freelancerId = req.user.id;
        const updateData = req.body;
        
        // Remove fields that shouldn't be updated directly
        const { _id, email, password, role, verified, createdAt, updatedAt, __v, ...safeUpdateData } = updateData;
        
        const updatedFreelancer = await User.findByIdAndUpdate(
            freelancerId,
            { $set: safeUpdateData },
            { new: true }
        ).select('-password -__v');

        if (!updatedFreelancer) {
            return res.status(404).json({ message: 'Freelancer not found' });
        }

        res.json({
            data: updatedFreelancer,
            message: 'Profile updated successfully'
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error updating profile', 
            error: error.message 
        });
    }
};

export const uploadPortfolioImage = async (req, res) => {
    try {
        // In a real app, this would handle file upload to a service like AWS S3
        // For this demo, we'll simulate a successful upload and return a mock URL
        
        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided' });
        }

        // Mock response - in a real app this would be the URL from your file storage
        const imageUrl = `https://skillswap-portfolio-images.s3.amazonaws.com/${Date.now()}_${req.file.originalname}`;
        
        res.json({
            data: {
                url: imageUrl,
                filename: req.file.originalname
            },
            message: 'Image uploaded successfully'
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error uploading image', 
            error: error.message 
        });
    }
};

export const getSkills = async (req, res) => {
    try {
        // In a real app, this might be fetched from a database collection of skills
        // For this demo, we'll return a predefined list of skills
        const commonSkills = [
            'JavaScript',
            'React',
            'Node.js',
            'Python',
            'Java',
            'HTML/CSS',
            'UI/UX Design',
            'Graphic Design',
            'Content Writing',
            'Digital Marketing',
            'SEO',
            'WordPress',
            'Data Analysis',
            'Mobile Development',
            'Database Management'
        ];
        
        res.json({
            data: commonSkills,
            message: 'Skills fetched successfully'
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error fetching skills', 
            error: error.message 
        });
    }
};

export const getVerificationStatus = async (req, res) => {
    try {
        const freelancer = await User.findById(req.user.id)
            .select('verified verificationDocuments verificationStatus');

        if (!freelancer) {
            return res.status(404).json({ message: 'Freelancer not found' });
        }

        res.json({
            data: {
                verified: freelancer.verified || false,
                documents: freelancer.verificationDocuments || [],
                status: freelancer.verificationStatus || 'unverified' // unverified, pending, rejected, verified
            },
            message: 'Verification status fetched successfully'
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error fetching verification status', 
            error: error.message 
        });
    }
};

export const getPublicFreelancerProfile = async (req, res) => {
    try {
        const freelancer = await User.findById(req.params.id)
            .select('name skills portfolio verified role');
        if (!freelancer || freelancer.role !== 'freelancer') {
            return res.status(404).json({ message: 'Freelancer not found' });
        }
        res.json(freelancer);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching public freelancer profile', error: error.message });
    }
};