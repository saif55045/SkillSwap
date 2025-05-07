import { User } from '../models/User.js';
import { config } from './config.js';
import mongoose from 'mongoose';

const freelancers = [
    {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        role: 'freelancer',
        skills: ['React', 'Node.js', 'MongoDB'],
        verified: true,
        portfolio: [
            {
                title: 'E-commerce Platform',
                description: 'Built a full-stack e-commerce platform using MERN stack',
                link: 'https://example.com/project1'
            }
        ]
    },
    {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'password123',
        role: 'freelancer',
        skills: ['UI/UX', 'Graphic Design', 'Figma'],
        verified: true,
        portfolio: [
            {
                title: 'Mobile App Design',
                description: 'Designed UI/UX for a fitness tracking app',
                link: 'https://example.com/project2'
            }
        ]
    },
    {
        name: 'Mike Johnson',
        email: 'mike@example.com',
        password: 'password123',
        role: 'freelancer',
        skills: ['Python', 'Data Analysis', 'Machine Learning'],
        verified: false,
        portfolio: [
            {
                title: 'Data Visualization Dashboard',
                description: 'Created interactive data visualizations',
                link: 'https://example.com/project3'
            }
        ]
    },
    {
        name: 'Sarah Williams',
        email: 'sarah@example.com',
        password: 'password123',
        role: 'freelancer',
        skills: ['Content Writing', 'Digital Marketing', 'SEO'],
        verified: true,
        portfolio: [
            {
                title: 'Content Strategy',
                description: 'Developed content strategy for a SaaS company',
                link: 'https://example.com/project4'
            }
        ]
    },
    {
        name: 'Alex Chen',
        email: 'alex@example.com',
        password: 'password123',
        role: 'freelancer',
        skills: ['Mobile Development', 'React Native', 'iOS'],
        verified: true,
        portfolio: [
            {
                title: 'Food Delivery App',
                description: 'Developed a cross-platform mobile app',
                link: 'https://example.com/project5'
            }
        ]
    },
    {
        name: 'Emma Wilson',
        email: 'emma@example.com',
        password: 'password123',
        role: 'freelancer',
        skills: ['Graphic Design', 'Illustration', 'Photoshop'],
        verified: true,
        portfolio: [
            {
                title: 'Brand Identity',
                description: 'Created brand identity for startups',
                link: 'https://example.com/project6'
            }
        ]
    },
    {
        name: 'David Lee',
        email: 'david@example.com',
        password: 'password123',
        role: 'freelancer',
        skills: ['Node.js', 'Express', 'MongoDB'],
        verified: false,
        portfolio: [
            {
                title: 'API Development',
                description: 'Built RESTful APIs for various clients',
                link: 'https://example.com/project7'
            }
        ]
    },
    {
        name: 'Lisa Brown',
        email: 'lisa@example.com',
        password: 'password123',
        role: 'freelancer',
        skills: ['Content Writing', 'Copywriting', 'Blog Writing'],
        verified: true,
        portfolio: [
            {
                title: 'Tech Blog',
                description: 'Managed tech blog with over 100k monthly readers',
                link: 'https://example.com/project8'
            }
        ]
    },
    {
        name: 'Tom Anderson',
        email: 'tom@example.com',
        password: 'password123',
        role: 'freelancer',
        skills: ['React', 'Vue.js', 'Angular'],
        verified: true,
        portfolio: [
            {
                title: 'SaaS Dashboard',
                description: 'Built admin dashboard for SaaS platform',
                link: 'https://example.com/project9'
            }
        ]
    },
    {
        name: 'Maria Garcia',
        email: 'maria@example.com',
        password: 'password123',
        role: 'freelancer',
        skills: ['Digital Marketing', 'Social Media', 'SEO'],
        verified: true,
        portfolio: [
            {
                title: 'Marketing Campaign',
                description: 'Managed successful marketing campaigns',
                link: 'https://example.com/project10'
            }
        ]
    },
    {
        name: 'Chris Taylor',
        email: 'chris@example.com',
        password: 'password123',
        role: 'freelancer',
        skills: ['Python', 'Django', 'Flask'],
        verified: true,
        portfolio: [
            {
                title: 'Web Scraping Tool',
                description: 'Developed automated data collection system',
                link: 'https://example.com/project11'
            }
        ]
    }
];

const seedDatabase = async () => {
    try {
        await mongoose.connect(config.MONGO_URI);
        console.log('Connected to MongoDB Atlas');

        // Clear existing freelancers
        await User.deleteMany({ role: 'freelancer' });
        console.log('Cleared existing freelancer data');

        // Insert new freelancers
        await User.create(freelancers);
        console.log('Successfully seeded freelancer data');

        process.exit(0);
    } catch (error) {
        console.error('Error seeding database:', error);
        process.exit(1);
    }
};

seedDatabase();