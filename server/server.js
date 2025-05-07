import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { config } from './utils/config.js';
import authRoutes from './routes/auth/authRoutes.js';
import freelancerRoutes from './routes/freelancer/freelancerRoutes.js';
import projectRoutes from './routes/projects/projectRoutes.js';
import bidRoutes from './routes/bids/bidRoutes.js';
import messageRoutes from './routes/messages/messageRoutes.js';
import reviewRoutes from './routes/reviews/reviewRoutes.js';
import analyticsRoutes from './routes/projects/analyticsRoutes.js';
import adminVerificationRoutes from './routes/admin/verificationRoutes.js';
import adminAnalyticsRoutes from './routes/admin/analyticsRoutes.js';
import adminUserRoutes from './routes/admin/userRoutes.js';
import adminProjectRoutes from './routes/admin/projectRoutes.js';
import notificationRoutes from './routes/notifications/notificationRoutes.js';
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST", "PATCH", "DELETE"]
    }
});

// Middleware to authenticate socket connections
io.use(async (socket, next) => {
    try {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication error'));
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        socket.user = decoded;
        next();
    } catch (error) {
        next(new Error('Authentication error'));
    }
});

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    // Join a user's personal room for direct messages
    if (socket.user && socket.user.id) {
        socket.join(`user_${socket.user.id}`);
        console.log(`User ${socket.user.id} joined their personal room`);
    }

    // Join a project room to receive bid updates
    socket.on('join_project', (projectId) => {
        socket.join(`project_${projectId}`);
        console.log(`User joined project: ${projectId}`);
    });

    // Leave a project room
    socket.on('leave_project', (projectId) => {
        socket.leave(`project_${projectId}`);
        console.log(`User left project: ${projectId}`);
    });

    // Join a chat room for real-time messaging
    socket.on('join_chat', (chatId) => {
        socket.join(`chat_${chatId}`);
        console.log(`User joined chat: ${chatId}`);
    });

    // Handle private messages
    socket.on('private_message', (data) => {
        const { receiverId, message, senderId } = data;
        io.to(`user_${receiverId}`).emit('receive_message', {
            senderId,
            message,
            timestamp: new Date()
        });
    });

    // Handle new bid submission
    socket.on('new_bid', (bid) => {
        io.to(`project_${bid.projectId}`).emit('bid_received', bid);
    });

    // Handle bid status updates
    socket.on('bid_status_update', (data) => {
        io.to(`project_${data.projectId}`).emit('bid_status_updated', data);
    });

    // Handle counter offers
    socket.on('counter_offer', (data) => {
        io.to(`project_${data.projectId}`).emit('counter_offer_received', data);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });

    // Handle errors
    socket.on('error', (error) => {
        console.error('Socket error:', error);
    });
});

// Make io accessible to routes
app.set('io', io);

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/freelancers', freelancerRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/bids', bidRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/admin/verification', adminVerificationRoutes);
app.use('/api/admin/analytics', adminAnalyticsRoutes);
app.use('/api/admin/users', adminUserRoutes);
app.use('/api/admin/projects', adminProjectRoutes);
app.use('/api/notifications', notificationRoutes);

// MongoDB Atlas Connection
mongoose.connect(config.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('Connected to MongoDB Atlas successfully');
})
.catch((error) => {
    console.error('MongoDB connection error:', error);
    process.exit(1);
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        message: 'Something went wrong!', 
        error: process.env.NODE_ENV === 'development' ? err.message : undefined 
    });
});

// Start server
const PORT = config.PORT || 5000;
httpServer.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});