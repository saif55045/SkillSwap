import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { User } from '../models/User.js';
import { Project } from '../models/Project.js';
import { Bid } from '../models/Bid.js';
import { config } from './config.js';

// Connect to MongoDB
mongoose.connect(config.MONGO_URI)
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch(err => {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    });

// Function to hash password
const hashPassword = async (password) => {
    return await bcrypt.hash(password, 10);
};

// Current date for reference
const currentDate = new Date();

// Function to get date X days ago
const daysAgo = (days) => {
    const date = new Date(currentDate);
    date.setDate(date.getDate() - days);
    return date;
};

// Function to get date X days in the future
const daysFromNow = (days) => {
    const date = new Date(currentDate);
    date.setDate(date.getDate() + days);
    return date;
};

// Test data
const testData = {
    testFreelancer: {
        name: 'Ali Hassan',
        email: 'ali@gmail.com',
        password: 'password123',
        role: 'freelancer',
        isVerified: true,
        skills: ['React', 'Node.js', 'MongoDB', 'Express', 'JavaScript', 'CSS', 'HTML'],
        portfolio: [
            {
                title: 'E-commerce Platform',
                description: 'Built a full-stack e-commerce platform using MERN stack',
                link: 'https://example.com/ali/project1'
            },
            {
                title: 'Social Media Dashboard',
                description: 'Developed an analytics dashboard for social media management',
                link: 'https://example.com/ali/project2'
            },
            {
                title: 'Food Delivery App',
                description: 'Created a mobile-responsive food delivery application',
                link: 'https://example.com/ali/project3'
            }
        ],
        verified: true
    },
    
    // Client users who will post projects
    clients: [
        {
            name: 'Tech Solutions Inc.',
            email: 'tech@example.com',
            password: 'password123',
            role: 'client',
            isVerified: true
        },
        {
            name: 'Marketing Pro',
            email: 'marketing@example.com',
            password: 'password123',
            role: 'client',
            isVerified: true
        },
        {
            name: 'Design Studio',
            email: 'design@example.com',
            password: 'password123',
            role: 'client',
            isVerified: true
        }
    ],
    
    // Projects to create
    projects: [
        {
            title: 'E-commerce Website Development',
            description: 'Looking for a skilled developer to build a full-stack e-commerce site with product catalog, user authentication, shopping cart, and payment processing.',
            minBudget: 1000,
            maxBudget: 2500,
            duration: 30,
            skills: ['React', 'Node.js', 'MongoDB'],
            status: 'in-progress',
            createdAt: daysAgo(30),
            updatedAt: daysAgo(25)
        },
        {
            title: 'Mobile App UI Design',
            description: 'Need a professional UI designer to create clean and modern user interfaces for our iOS and Android application. The app is focused on fitness tracking.',
            minBudget: 500,
            maxBudget: 1000,
            duration: 15,
            skills: ['UI/UX', 'Mobile Design', 'Figma'],
            status: 'completed',
            createdAt: daysAgo(60),
            updatedAt: daysAgo(20),
            completionDate: daysAgo(5)
        },
        {
            title: 'Blog Website Redesign',
            description: 'Our blog needs a fresh look. We need a developer to redesign our WordPress blog with a modern, responsive design that focuses on readability.',
            minBudget: 350,
            maxBudget: 700,
            duration: 7,
            skills: ['WordPress', 'CSS', 'HTML'],
            status: 'completed',
            createdAt: daysAgo(45),
            updatedAt: daysAgo(40),
            completionDate: daysAgo(30)
        },
        {
            title: 'Dashboard Development',
            description: 'We need a developer to build a data visualization dashboard that displays business metrics from our API. Should be responsive and include charts/graphs.',
            minBudget: 600,
            maxBudget: 1200,
            duration: 14,
            skills: ['JavaScript', 'Chart.js', 'React'],
            status: 'open',
            createdAt: daysAgo(10),
            updatedAt: daysAgo(10)
        },
        {
            title: 'Marketing Website',
            description: 'Developing a marketing website for our new SaaS product. Need strong front-end skills and experience with animation libraries.',
            minBudget: 800,
            maxBudget: 1500,
            duration: 21,
            skills: ['HTML', 'CSS', 'JavaScript'],
            status: 'open',
            createdAt: daysAgo(5),
            updatedAt: daysAgo(5)
        }
    ],
    
    // Bid templates
    bidTemplates: [
        {
            amount: 2000,
            proposal: "I'm excited about your e-commerce project. With my 5+ years of experience with the MERN stack, I can deliver a robust solution that meets all your requirements. I'll implement secure user auth, product management, shopping cart functionality, and seamless payment processing with Stripe. I'll also ensure the UI is responsive and user-friendly.",
            deliveryTime: 28
        },
        {
            amount: 750,
            proposal: "I specialize in mobile UI design and have worked on multiple fitness apps. My approach focuses on clean, intuitive interfaces that prioritize user experience. I'll provide designs for all core screens with alternative variations, icon sets, and a comprehensive UI kit to ensure development consistency.",
            deliveryTime: 14
        },
        {
            amount: 600,
            proposal: "I've helped redesign over 20 WordPress blogs with a focus on readability and performance. I'll create a custom theme that matches your brand identity while ensuring mobile responsiveness and SEO optimization. I'll also implement caching and image optimization to improve page load times.",
            deliveryTime: 7
        },
        {
            amount: 1100,
            proposal: "As a data visualization specialist, I've built multiple dashboards that transform complex data into actionable insights. I'll create an interactive dashboard using React and Chart.js that connects to your API, with features like custom date ranges, exportable reports, and real-time updates.",
            deliveryTime: 14
        },
        {
            amount: 1300,
            proposal: "I've developed marketing websites for multiple SaaS companies that effectively communicate product value and drive conversions. I'll create a high-performance site with engaging animations, clear CTAs, and a responsive design that works across all devices.",
            deliveryTime: 20
        }
    ]
};

// Seed data function
const seedTestData = async () => {
    try {
        console.log('Starting to seed test data...');
        
        // Create or update test freelancer (Ali)
        let aliUser = await User.findOne({ email: testData.testFreelancer.email });
        if (aliUser) {
            console.log('Updating existing ali@gmail.com user...');
            aliUser.name = testData.testFreelancer.name;
            aliUser.skills = testData.testFreelancer.skills;
            aliUser.portfolio = testData.testFreelancer.portfolio;
            aliUser.verified = testData.testFreelancer.verified;
            await aliUser.save();
        } else {
            console.log('Creating new ali@gmail.com user...');
            const hashedPassword = await hashPassword(testData.testFreelancer.password);
            aliUser = await User.create({
                ...testData.testFreelancer,
                password: hashedPassword
            });
        }
        console.log('Test freelancer created/updated:', aliUser.email);
        
        // Create client users
        const clientUsers = [];
        for (const client of testData.clients) {
            let clientUser = await User.findOne({ email: client.email });
            if (clientUser) {
                console.log(`Client ${client.email} already exists, skipping...`);
                clientUsers.push(clientUser);
            } else {
                const hashedPassword = await hashPassword(client.password);
                clientUser = await User.create({
                    ...client,
                    password: hashedPassword
                });
                console.log(`Client created: ${clientUser.email}`);
                clientUsers.push(clientUser);
            }
        }
        
        // Create projects
        const projects = [];
        for (let i = 0; i < testData.projects.length; i++) {
            const projectData = testData.projects[i];
            const clientIndex = i % clientUsers.length;
            
            const project = await Project.create({
                ...projectData,
                clientId: clientUsers[clientIndex]._id
            });
            console.log(`Project created: ${project.title}`);
            
            // Update client with project reference
            await User.findByIdAndUpdate(clientUsers[clientIndex]._id, {
                $push: { projects: project._id }
            });
            
            projects.push(project);
        }
        
        // Create bids for Ali on all projects
        for (let i = 0; i < projects.length; i++) {
            const project = projects[i];
            const bidTemplate = testData.bidTemplates[i % testData.bidTemplates.length];
            
            // Check if bid already exists
            const existingBid = await Bid.findOne({
                projectId: project._id,
                freelancerId: aliUser._id
            });
            
            if (existingBid) {
                console.log(`Bid already exists for project ${project.title}, updating...`);
                existingBid.amount = bidTemplate.amount;
                existingBid.proposal = bidTemplate.proposal;
                existingBid.deliveryTime = bidTemplate.deliveryTime;
                
                // For completed projects, set bid as accepted
                if (project.status === 'completed' || project.status === 'in-progress') {
                    existingBid.status = 'accepted';
                    
                    // Update the project with selected freelancer
                    await Project.findByIdAndUpdate(project._id, {
                        selectedFreelancer: aliUser._id,
                        finalBidAmount: bidTemplate.amount
                    });
                }
                
                await existingBid.save();
            } else {
                // Create new bid
                const bid = await Bid.create({
                    projectId: project._id,
                    freelancerId: aliUser._id,
                    amount: bidTemplate.amount,
                    proposal: bidTemplate.proposal,
                    deliveryTime: bidTemplate.deliveryTime,
                    status: (project.status === 'completed' || project.status === 'in-progress') ? 'accepted' : 'pending'
                });
                
                console.log(`Bid created for project: ${project.title}`);
                
                // If project is completed or in progress, set Ali as selected freelancer
                if (project.status === 'completed' || project.status === 'in-progress') {
                    await Project.findByIdAndUpdate(project._id, {
                        selectedFreelancer: aliUser._id,
                        finalBidAmount: bidTemplate.amount
                    });
                }
            }
        }
        
        // Check if we need to create an earnings collection
        const hasEarningsCollection = mongoose.connection.collections['earnings'];
        if (!hasEarningsCollection) {
            // Create earnings schema
            const earningsSchema = new mongoose.Schema({
                freelancerId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                    required: true
                },
                projectId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'Project',
                    required: true
                },
                clientId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                    required: true
                },
                amount: {
                    type: Number,
                    required: true
                },
                date: {
                    type: Date,
                    default: Date.now
                },
                status: {
                    type: String,
                    enum: ['pending', 'completed'],
                    default: 'completed'
                }
            });
            
            mongoose.model('Earnings', earningsSchema);
            console.log('Created Earnings collection schema');
        }
        
        const Earnings = mongoose.model('Earnings');
        
        // Create earnings records for completed projects
        const completedProjects = projects.filter(p => p.status === 'completed');
        for (const project of completedProjects) {
            // Check if earnings record already exists
            const existingEarning = await Earnings.findOne({
                projectId: project._id,
                freelancerId: aliUser._id
            });
            
            if (!existingEarning) {
                const earning = await Earnings.create({
                    freelancerId: aliUser._id,
                    projectId: project._id,
                    clientId: project.clientId,
                    amount: project.finalBidAmount || testData.bidTemplates[completedProjects.indexOf(project) % testData.bidTemplates.length].amount,
                    date: project.completionDate || daysAgo(Math.floor(Math.random() * 30)),
                    status: 'completed'
                });
                
                console.log(`Earnings record created for project: ${project.title}`);
            } else {
                console.log(`Earnings record already exists for project ${project.title}, skipping...`);
            }
        }
        
        // Create pending earnings for in-progress projects
        const inProgressProjects = projects.filter(p => p.status === 'in-progress');
        for (const project of inProgressProjects) {
            // Check if earnings record already exists
            const existingEarning = await Earnings.findOne({
                projectId: project._id,
                freelancerId: aliUser._id
            });
            
            if (!existingEarning) {
                const earning = await Earnings.create({
                    freelancerId: aliUser._id,
                    projectId: project._id,
                    clientId: project.clientId,
                    amount: project.finalBidAmount || testData.bidTemplates[inProgressProjects.indexOf(project) % testData.bidTemplates.length].amount,
                    date: daysAgo(Math.floor(Math.random() * 10)),
                    status: 'pending'
                });
                
                console.log(`Pending earnings record created for project: ${project.title}`);
            } else {
                console.log(`Earnings record already exists for project ${project.title}, skipping...`);
            }
        }
        
        console.log('Test data seeding completed successfully!');
        
        // Return summary
        return {
            freelancer: { email: aliUser.email, _id: aliUser._id },
            clients: clientUsers.length,
            projects: projects.length,
            bids: projects.length,
            completedProjects: completedProjects.length,
            inProgressProjects: inProgressProjects.length,
            openProjects: projects.filter(p => p.status === 'open').length,
            earnings: completedProjects.length + inProgressProjects.length
        };
        
    } catch (error) {
        console.error('Error seeding test data:', error);
    } finally {
        // Close the database connection
        await mongoose.disconnect();
        console.log('Database connection closed');
    }
};

// Execute the seed function
seedTestData()
    .then(summary => {
        console.log('\n--- SEED DATA SUMMARY ---');
        console.log(JSON.stringify(summary, null, 2));
        console.log('\nYou can now login as:');
        console.log('Email: ali@gmail.com');
        console.log('Password: password123');
        console.log('\nTest clients:');
        testData.clients.forEach(client => {
            console.log(`- ${client.email} (password: password123)`);
        });
    })
    .catch(err => {
        console.error('Seed process failed:', err);
    });