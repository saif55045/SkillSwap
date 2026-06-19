import mongoose from 'mongoose';
import { config } from './utils/config.js';
import { User } from './models/User.js';
import { Project } from './models/Project.js';
import { Bid } from './models/Bid.js';
import { Message } from './models/Message.js';
import Earnings from './models/Earnings.js';
import Review from './models/Review.js';

// Connect to MongoDB Atlas
mongoose.connect(config.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('Connected to MongoDB Atlas for Seeding'))
.catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
});

// Helper for dates relative to current time
const daysAgo = (days) => {
    const date = new Date();
    date.setDate(date.getDate() - days);
    return date;
};

const seedData = async () => {
    try {
        console.log('Clearing existing data...');
        await User.deleteMany({});
        await Project.deleteMany({});
        await Bid.deleteMany({});
        await Message.deleteMany({});
        await Earnings.deleteMany({});
        await Review.deleteMany({});
        console.log('Database cleared.');

        console.log('Seeding Users...');
        
        // 1. Create Admin User
        const admin = await User.create({
            name: 'Admin User',
            email: 'admin@example.com',
            password: '123456',
            role: 'admin',
            isVerified: true
        });
        console.log(`- Seeded Admin: ${admin.email}`);

        // 2. Create Freelancers
        const freelancerAli = await User.create({
            name: 'Ali Hassan',
            email: 'ali@gmail.com',
            password: '123456',
            role: 'freelancer',
            isVerified: true,
            verified: true,
            verificationLevel: 'verified',
            verificationStatus: 'verified',
            title: 'Full-Stack MERN Developer',
            bio: 'Passionate MERN Stack Developer with 3+ years of experience building scalable web applications. Expert in React, Node.js, Express, MongoDB, and modern UI frameworks.',
            hourlyRate: 35,
            skills: ['React', 'Node.js', 'MongoDB', 'Express', 'JavaScript', 'CSS', 'HTML', 'TailwindCSS', 'Redux'],
            portfolio: [
                {
                    title: 'E-commerce Platform',
                    description: 'A full-stack e-commerce marketplace featuring user roles, stripe payments, product management, and complex filters.',
                    link: 'https://example.com/ali/ecommerce'
                },
                {
                    title: 'SaaS Dashboard',
                    description: 'Dynamic data visualization dashboard containing real-time widgets, activity loggers, and analytics.',
                    link: 'https://example.com/ali/dashboard'
                }
            ],
            experience: [
                {
                    company: 'InnoTech Solutions',
                    position: 'Full Stack Developer',
                    from: daysAgo(730),
                    to: daysAgo(180),
                    current: false,
                    description: 'Developed and maintained consumer-facing web applications using React and Node.js.'
                }
            ]
        });
        console.log(`- Seeded Freelancer: ${freelancerAli.email}`);

        const freelancerSarah = await User.create({
            name: 'Sarah Khan',
            email: 'sarah@gmail.com',
            password: '123456',
            role: 'freelancer',
            isVerified: true,
            verified: true,
            verificationLevel: 'premium',
            verificationStatus: 'verified',
            title: 'Lead UI/UX & Mobile Designer',
            bio: 'Creative UI/UX Designer dedicated to crafting functional and stunning user experiences for mobile apps and web platforms. 4+ years of professional Figma and UI research experience.',
            hourlyRate: 45,
            skills: ['UI/UX', 'Figma', 'Mobile Design', 'Wireframing', 'Prototyping', 'CSS', 'TailwindCSS'],
            portfolio: [
                {
                    title: 'Fitness Tracker App UI',
                    description: 'Complete mobile UI kit and design system for a social fitness tracking and calorie monitoring mobile app.',
                    link: 'https://example.com/sarah/fitness-ui'
                }
            ]
        });
        console.log(`- Seeded Freelancer: ${freelancerSarah.email}`);

        // 3. Create Clients
        const clientTech = await User.create({
            name: 'Tech Solutions Inc.',
            email: 'tech@example.com',
            password: '123456',
            role: 'client',
            isVerified: true
        });
        console.log(`- Seeded Client: ${clientTech.email}`);

        const clientMarketing = await User.create({
            name: 'Marketing Pro',
            email: 'marketing@example.com',
            password: '123456',
            role: 'client',
            isVerified: true
        });
        console.log(`- Seeded Client: ${clientMarketing.email}`);

        const clientDesign = await User.create({
            name: 'Design Studio',
            email: 'design@example.com',
            password: '123456',
            role: 'client',
            isVerified: true
        });
        console.log(`- Seeded Client: ${clientDesign.email}`);


        console.log('Seeding Projects...');

        // Project 1: Completed Project for Sarah
        const projectUI = await Project.create({
            title: 'Mobile App UI Design',
            description: 'Looking for a talented UI designer to craft clean, modern, and engaging user interfaces for our wellness & fitness mobile app. We expect around 15 key screens, standard wireframes, interactive prototypes in Figma, and a comprehensive style guide. Experience with health/fitness tracking domains is highly preferred.',
            clientId: clientTech._id,
            minBudget: 500,
            maxBudget: 1000,
            duration: 15,
            skills: ['UI/UX', 'Mobile Design', 'Figma'],
            status: 'completed',
            progress: 100,
            selectedFreelancer: freelancerSarah._id,
            finalBidAmount: 850,
            startDate: daysAgo(45),
            completionDate: daysAgo(30)
        });
        console.log(`- Seeded Completed Project: ${projectUI.title}`);

        // Project 2: Completed Project for Ali
        const projectWordPress = await Project.create({
            title: 'Blog Website Redesign',
            description: 'Our tech blog website needs a massive facelift. We require a developer to redesign the existing blog theme on WordPress to be faster, SEO-friendly, fully mobile-responsive, and with clean navigation elements. Optimized typography is critical.',
            clientId: clientDesign._id,
            minBudget: 350,
            maxBudget: 700,
            duration: 7,
            skills: ['WordPress', 'CSS', 'HTML'],
            status: 'completed',
            progress: 100,
            selectedFreelancer: freelancerAli._id,
            finalBidAmount: 600,
            startDate: daysAgo(20),
            completionDate: daysAgo(13)
        });
        console.log(`- Seeded Completed Project: ${projectWordPress.title}`);

        // Project 3: In-Progress Project for Ali
        const projectEcommerce = await Project.create({
            title: 'E-commerce Website Development',
            description: 'Looking for a full-stack MERN developer to build a feature-rich e-commerce site for selling handcrafted goods. Requirements: Product listing & filtering, shopping cart, customer reviews, checkout integration with Stripe API, user authentication (JWT), and an admin dashboard to manage products and orders. Front-end must be responsive.',
            clientId: clientTech._id,
            minBudget: 1200,
            maxBudget: 2500,
            duration: 30,
            skills: ['React', 'Node.js', 'MongoDB', 'Express'],
            status: 'in-progress',
            progress: 45,
            selectedFreelancer: freelancerAli._id,
            finalBidAmount: 2000,
            startDate: daysAgo(10)
        });
        console.log(`- Seeded In-Progress Project: ${projectEcommerce.title}`);

        // Project 4: Open Project with multiple Bids
        const projectDashboard = await Project.create({
            title: 'Analytics Dashboard Development',
            description: 'We need an interactive dashboard designed in React.js that displays custom sales analytics, customer retention rates, and marketing campaign metrics from our custom backend JSON API. Must feature dynamic charts/graphs (Chart.js or Recharts), custom date filters, and data export capability to CSV.',
            clientId: clientMarketing._id,
            minBudget: 600,
            maxBudget: 1200,
            duration: 14,
            skills: ['React', 'JavaScript', 'Chart.js'],
            status: 'open',
            progress: 0,
            createdAt: daysAgo(3)
        });
        console.log(`- Seeded Open Project: ${projectDashboard.title}`);

        // Project 5: Open Project with no bids yet
        const projectSaaS = await Project.create({
            title: 'SaaS Landing Page',
            description: 'Need an outstanding landing page for our new AI SaaS product. Looking for a modern, sleek interface with interactive scroll animations (e.g. Framer Motion), email capture forms, clear pricing tiers, and highly detailed visual elements. Must be fully optimized for page speed and mobile screens.',
            clientId: clientMarketing._id,
            minBudget: 400,
            maxBudget: 800,
            duration: 10,
            skills: ['HTML', 'CSS', 'JavaScript'],
            status: 'open',
            progress: 0,
            createdAt: daysAgo(1)
        });
        console.log(`- Seeded Open Project: ${projectSaaS.title}`);


        console.log('Seeding Bids...');

        // Bids for Project 1 (Completed App UI)
        const bidUI1 = await Bid.create({
            projectId: projectUI._id,
            freelancerId: freelancerSarah._id,
            amount: 850,
            proposal: "I have reviewed your fitness app project and would love to design it. I have previously designed 3 health-related mobile applications and have an extensive UI kit library ready in Figma. I will deliver 15 high-fidelity screens, detailed wireframes, and an interactive prototype within 14 days. Let's make this app look amazing!",
            deliveryTime: 14,
            status: 'accepted'
        });
        const bidUI2 = await Bid.create({
            projectId: projectUI._id,
            freelancerId: freelancerAli._id,
            amount: 950,
            proposal: "I am a full stack developer but I have strong UI/UX instincts. I can design the wireframes and components in Figma and then even help code them if needed. I can complete the design screens in 15 days.",
            deliveryTime: 15,
            status: 'rejected'
        });

        // Bids for Project 2 (Completed WordPress)
        const bidWP = await Bid.create({
            projectId: projectWordPress._id,
            freelancerId: freelancerAli._id,
            amount: 600,
            proposal: "I can redesign your WordPress blog successfully. I have created over 20 custom WordPress themes and can guarantee a speed score above 90 on Google PageSpeed Insights. I'll make sure it is fully responsive, modern, and has highly optimized readable typography.",
            deliveryTime: 7,
            status: 'accepted'
        });

        // Bids for Project 3 (In-Progress E-commerce)
        const bidEco1 = await Bid.create({
            projectId: projectEcommerce._id,
            freelancerId: freelancerAli._id,
            amount: 2000,
            proposal: "I am excited to build your handcrafted goods e-commerce platform. I have built multiple full-stack MERN marketplaces. I will implement secure email/password registration, product catalog with advanced search filters, Stripe checkout API, and a robust admin dashboard for managing orders. Clean, structured, and modular code is guaranteed.",
            deliveryTime: 28,
            status: 'accepted'
        });
        const bidEco2 = await Bid.create({
            projectId: projectEcommerce._id,
            freelancerId: freelancerSarah._id,
            amount: 2400,
            proposal: "I can design the full UI for this e-commerce project and provide basic React front-end development, but I do not specialize in back-end Node/Express development. Let me know if you would like me to work on the UI designs first.",
            deliveryTime: 20,
            status: 'rejected'
        });

        // Bids for Project 4 (Open Dashboard - Active bidding)
        const bidDash1 = await Bid.create({
            projectId: projectDashboard._id,
            freelancerId: freelancerAli._id,
            amount: 1000,
            proposal: "Hi there! I am a full-stack developer with extensive experience building analytics dashboards. I can create a modern React dashboard with Recharts, fully responsive layouts, side navigation drawer, custom date-range queries, and a download to CSV utility. I can get started immediately.",
            deliveryTime: 12,
            status: 'pending'
        });
        const bidDash2 = await Bid.create({
            projectId: projectDashboard._id,
            freelancerId: freelancerSarah._id,
            amount: 950,
            proposal: "I specialize in clean React frontend layouts. I have built several dashboards and can ensure the user experience is highly intuitive and details are spaced perfectly. I'll utilize TailwindCSS and Chart.js to deliver a pixel-perfect mockup and functional implementation.",
            deliveryTime: 10,
            status: 'pending'
        });

        // Link bids array back to projects
        projectUI.bids = [bidUI1._id, bidUI2._id];
        await projectUI.save();

        projectWordPress.bids = [bidWP._id];
        await projectWordPress.save();

        projectEcommerce.bids = [bidEco1._id, bidEco2._id];
        await projectEcommerce.save();

        projectDashboard.bids = [bidDash1._id, bidDash2._id];
        await projectDashboard.save();

        console.log('- Seeded and linked project bids successfully.');


        console.log('Seeding Reviews...');

        // Review for Sarah (from Tech Solutions Inc.)
        const reviewUI = await Review.create({
            projectId: projectUI._id,
            clientId: clientTech._id,
            freelancerId: freelancerSarah._id,
            rating: 5,
            comment: 'Sarah did an absolutely outstanding job on our wellness app. The Figma mockups were gorgeous, well-structured, and her attention to detail in the design system was incredible. Highly recommended!'
        });

        // Review for Ali (from Design Studio)
        const reviewWP = await Review.create({
            projectId: projectWordPress._id,
            clientId: clientDesign._id,
            freelancerId: freelancerAli._id,
            rating: 4,
            comment: 'Ali redesigned our blog theme successfully. The pages load much faster now, and the mobile responsive adjustments are spot-on. Communication was great throughout.',
            freelancerResponse: 'Thank you for the review! It was a pleasure working with you. Feel free to reach out if you need additional updates.'
        });
        console.log('- Seeded client reviews.');


        console.log('Seeding Earnings...');

        // Earnings for Sarah (Completed)
        await Earnings.create({
            freelancerId: freelancerSarah._id,
            projectId: projectUI._id,
            clientId: clientTech._id,
            amount: 850,
            date: daysAgo(30),
            status: 'completed'
        });

        // Earnings for Ali (Completed)
        await Earnings.create({
            freelancerId: freelancerAli._id,
            projectId: projectWordPress._id,
            clientId: clientDesign._id,
            amount: 600,
            date: daysAgo(13),
            status: 'completed'
        });

        // Earnings for Ali (Pending - In Progress)
        await Earnings.create({
            freelancerId: freelancerAli._id,
            projectId: projectEcommerce._id,
            clientId: clientTech._id,
            amount: 2000,
            date: daysAgo(10),
            status: 'pending'
        });
        console.log('- Seeded completed and pending earnings records.');


        console.log('Seeding Chat Messages...');

        // Messages between Ali and Tech Solutions client
        await Message.create({
            senderId: clientTech._id,
            receiverId: freelancerAli._id,
            projectId: projectEcommerce._id,
            content: "Hello Ali, we reviewed your proposal for the e-commerce store and we are very impressed. Can we discuss the database structure for our products?"
        });

        await Message.create({
            senderId: freelancerAli._id,
            receiverId: clientTech._id,
            projectId: projectEcommerce._id,
            content: "Hi! Absolutely, thanks for reaching out. Yes, we can set up a schema supporting dynamic attributes, inventory control, and multi-category filters. I will prepare a quick diagram for you."
        });

        await Message.create({
            senderId: clientTech._id,
            receiverId: freelancerAli._id,
            projectId: projectEcommerce._id,
            content: "That sounds excellent. I have accepted your bid, let's get started on development!",
            readStatus: true
        });

        await Message.create({
            senderId: freelancerAli._id,
            receiverId: clientTech._id,
            projectId: projectEcommerce._id,
            content: "Awesome, thank you! I have initialized the repository and started building the authentication boilerplate. I will keep you updated.",
            readStatus: true
        });

        // Messages between Sarah and Tech Solutions client
        await Message.create({
            senderId: clientTech._id,
            receiverId: freelancerSarah._id,
            projectId: projectUI._id,
            content: "Hi Sarah, your final screens are fantastic! We have sent the Figma dashboard assets to our developers."
        });

        await Message.create({
            senderId: freelancerSarah._id,
            receiverId: clientTech._id,
            projectId: projectUI._id,
            content: "Great! Let me know if the dev team needs any asset exports or custom format versions. Happy to help."
        });

        console.log('- Seeded chat threads.');

        // Update Client's projects list references
        await User.findByIdAndUpdate(clientTech._id, { $push: { projects: { $each: [projectUI._id, projectEcommerce._id] } } });
        await User.findByIdAndUpdate(clientDesign._id, { $push: { projects: projectWordPress._id } });
        await User.findByIdAndUpdate(clientMarketing._id, { $push: { projects: { $each: [projectDashboard._id, projectSaaS._id] } } });

        console.log('\n=============================================');
        console.log('SEEDING SUCCESSFUL!');
        console.log('=============================================');
        console.log('Login credentials for your demo:');
        console.log('- ADMIN: admin@example.com (pw: 123456)');
        console.log('- FREELANCER (Ali): ali@gmail.com (pw: 123456)');
        console.log('- FREELANCER (Sarah): sarah@gmail.com (pw: 123456)');
        console.log('- CLIENT (Tech Solutions): tech@example.com (pw: 123456)');
        console.log('- CLIENT (Marketing Pro): marketing@example.com (pw: 123456)');
        console.log('- CLIENT (Design Studio): design@example.com (pw: 123456)');
        console.log('=============================================');

    } catch (error) {
        console.error('Error seeding data:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Database connection closed.');
    }
};

seedData();
