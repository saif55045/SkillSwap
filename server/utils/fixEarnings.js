// Fix earnings records script - Updates all pending earnings for completed projects
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Project } from '../models/Project.js';
import Earnings from '../models/Earnings.js';
import { config } from './config.js';

dotenv.config();

// Connect to MongoDB Atlas
mongoose.connect(config.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('Connected to MongoDB Atlas successfully');
    fixEarningsRecords();
})
.catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
});

async function fixEarningsRecords() {
    try {
        console.log('Looking for completed projects with pending earnings...');
        
        // Find all completed projects
        const completedProjects = await Project.find({
            status: 'completed'
        });
        
        console.log(`Found ${completedProjects.length} completed projects`);
        
        let updatedCount = 0;
        
        // For each completed project, update any pending earnings
        for (const project of completedProjects) {
            const earnings = await Earnings.findOne({
                projectId: project._id,
                status: 'pending'
            });
            
            if (earnings) {
                console.log(`Updating earnings for project: ${project._id} (${project.title || 'Untitled'})`);
                earnings.status = 'completed';
                await earnings.save();
                updatedCount++;
            }
        }
        
        console.log(`Updated ${updatedCount} earnings records from pending to completed`);
        console.log('Done!');
        process.exit(0);
    } catch (error) {
        console.error('Error fixing earnings records:', error);
        process.exit(1);
    }
}