import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import { User } from '../models/User.js';
import { config } from './config.js';

// Connect to MongoDB Atlas
mongoose
  .connect(config.MONGO_URI)
  .then(() => console.log('Connected to MongoDB Atlas'))
  .catch((err) => console.error('Could not connect to MongoDB Atlas', err));

// Admin user details - you can customize these
const adminUser = {
  name: 'Admin User',
  email: 'admin@skillswap.com',
  password: 'Admin@123', // This will be hashed before saving
  role: 'admin'
};

// Function to create admin user
const createAdminUser = async () => {
  try {
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminUser.email });
    
    if (existingAdmin) {
      console.log('Admin user already exists!');
      console.log('Email:', adminUser.email);
      console.log('Password:', adminUser.password, '(not hashed)');
    } else {
      // Create new admin user - password will be hashed by the User model pre-save hook
      const newAdmin = new User({
        name: adminUser.name,
        email: adminUser.email,
        password: adminUser.password,
        role: adminUser.role,
        isVerified: true,
        verificationStatus: 'verified',
        verificationLevel: 'premium'
      });
      
      // Save to database
      await newAdmin.save();
      console.log('Admin user created successfully!');
      console.log('Email:', adminUser.email);
      console.log('Password:', adminUser.password, '(not hashed)');
    }
    
    // Disconnect from database
    mongoose.connection.close();
  } catch (error) {
    console.error('Error creating admin user:', error);
    mongoose.connection.close();
  }
};

// Execute the function
createAdminUser();