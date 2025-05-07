import mongoose from 'mongoose';
import { User } from './models/User.js';
import { Project } from './models/Project.js';
import { Bid } from './models/Bid.js';

const MONGO_URI = 'mongodb://localhost:27017/YOUR_DB_NAME'; // Change to your DB

async function seed() {
  await mongoose.connect(MONGO_URI);

  // 1. Create Ali as a freelancer
  let ali = await User.findOne({ email: 'ali@gmail.com' });
  if (!ali) {
    ali = await User.create({
      name: 'Ali',
      email: 'ali@gmail.com',
      password: 'hashedpassword', // Use a real hash in production!
      role: 'freelancer',
      skills: ['WordPress', 'UI/UX', 'Frontend'],
      verified: true
    });
  }

  // 2. Create a client
  let client = await User.findOne({ email: 'client@example.com' });
  if (!client) {
    client = await User.create({
      name: 'Client User',
      email: 'client@example.com',
      password: 'hashedpassword',
      role: 'client'
    });
  }

  // 3. Create a project assigned to Ali
  const startDate = new Date('2025-05-01T00:00:00.000Z');
  const duration = 30;
  const deadline = new Date(startDate.getTime() + duration * 24 * 60 * 60 * 1000);

  let project = await Project.create({
    title: 'Blog Website Redesign',
    description: 'Redesign our WordPress blog with a modern, responsive design.',
    clientId: client._id,
    minBudget: 500,
    maxBudget: 1000,
    duration,
    startDate,
    deadline,
    status: 'in-progress',
    selectedFreelancer: ali._id,
    progress: 20,
    skills: ['WordPress', 'UI/UX', 'Frontend']
  });

  // 4. Create a bid from Ali
  await Bid.create({
    projectId: project._id,
    freelancerId: ali._id,
    amount: 600,
    proposal: 'I can deliver a modern, responsive redesign for your blog.',
    deliveryTime: 30,
    status: 'accepted'
  });

  // 5. Update project with bid reference (optional, if your schema has a bids array)
  // const bid = await Bid.findOne({ projectId: project._id, freelancerId: ali._id });
  // project.bids = [bid._id];
  // await project.save();

  console.log('Seeded data for ali@gmail.com');
  await mongoose.disconnect();
}

seed();