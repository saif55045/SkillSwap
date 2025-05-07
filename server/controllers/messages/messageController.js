import { Message } from '../../models/Message.js';
import { User } from '../../models/User.js';
import crypto from 'crypto';
import mongoose from 'mongoose';

// Send a new message
export const sendMessage = async (req, res) => {
    try {
        const { receiverId, content, projectId } = req.body;
        const senderId = req.user.id;

        // Validate receiver exists
        const receiver = await User.findById(receiverId);
        if (!receiver) {
            return res.status(404).json({ message: 'Receiver not found' });
        }

        // Create message with hashed metadata
        const message = new Message({
            senderId,
            receiverId,
            content,
            projectId,
            metadata: crypto.createHash('sha256')
                .update(`${senderId}-${receiverId}-${Date.now()}`)
                .digest('hex')
        });

        await message.save();

        // Emit real-time notification via Socket.io
        const io = req.app.get('io');
        io.to(`user_${receiverId}`).emit('new_message', {
            messageId: message._id,
            senderId,
            content: content.substring(0, 30) + (content.length > 30 ? '...' : '') // Preview
        });

        res.status(201).json(message);
    } catch (error) {
        res.status(500).json({ 
            message: 'Error sending message', 
            error: error.message 
        });
    }
};

// Get conversation between two users
export const getConversation = async (req, res) => {
    try {
        const { userId } = req.params;
        const currentUserId = req.user.id;
        const { page = 1, limit = 20 } = req.query;
        
        // Verify the other user exists
        const otherUser = await User.findById(userId);
        if (!otherUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Convert pagination params to numbers
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        
        // Get messages in conversation (sorted by newest first)
        const messages = await Message.find({
            $or: [
                { senderId: currentUserId, receiverId: userId },
                { senderId: userId, receiverId: currentUserId }
            ]
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .populate('senderId', 'name')
        .populate('receiverId', 'name');
        
        // Mark messages as read if current user is the receiver
        await Message.updateMany(
            { senderId: userId, receiverId: currentUserId, readStatus: false },
            { $set: { readStatus: true } }
        );
        
        // Get total count for pagination
        const total = await Message.countDocuments({
            $or: [
                { senderId: currentUserId, receiverId: userId },
                { senderId: userId, receiverId: currentUserId }
            ]
        });
        
        res.json({
            messages,
            currentPage: pageNum,
            totalPages: Math.ceil(total / limitNum),
            total
        });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error fetching conversation', 
            error: error.message 
        });
    }
};

// Get list of user's conversations
export const getUserConversations = async (req, res) => {
    try {
        
        const userId = req.user.id;
        
        // Find all distinct users the current user has conversed with
        const userObjectId = new mongoose.Types.ObjectId(userId);
        const conversations = await Message.aggregate([
            {
                $match: {
                    $or: [
                        { senderId: userObjectId },
                        { receiverId: userObjectId }
                    ]
                }
            },
            {
                $sort: { createdAt: -1 } // Sort by most recent message
            },
            {
                $group: {
                    _id: {
                        $cond: [
                            { $eq: ["$senderId", userObjectId] },
                            "$receiverId",
                            "$senderId"
                        ]
                    },
                    lastMessage: { $first: "$$ROOT" },
                    unreadCount: {
                        $sum: {
                            $cond: [
                                { $and: [
                                    { $eq: ["$receiverId", userObjectId] },
                                    { $eq: ["$readStatus", false] }
                                ]},
                                1,
                                0
                            ]
                        }
                    }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "userDetails"
                }
            },
            {
                $unwind: {
                    path: "$userDetails",
                    preserveNullAndEmptyArrays: true
                }
            },
            {
                $project: {
                    userId: "$_id",
                    userName: { $ifNull: ["$userDetails.name", "Unknown User"] },
                    lastMessage: {
                        content: "$lastMessage.content",
                        createdAt: "$lastMessage.createdAt",
                        senderId: "$lastMessage.senderId"
                    },
                    unreadCount: 1
                }
            },
            {
                $sort: { "lastMessage.createdAt": -1 }
            }
        ]);
        
        res.json(conversations);
    } catch (error) {
        console.error('Error in getUserConversations for user:', req.user?.id);
        console.error(error.stack || error);
        res.status(500).json({ 
            message: 'Error fetching conversations', 
            error: error.message 
        });
    }
};

// Mark message as read
export const markMessageAsRead = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user.id;
        
        const message = await Message.findById(messageId);
        
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }
        
        // Verify user is the receiver of this message
        if (message.receiverId.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized to mark this message as read' });
        }
        
        message.readStatus = true;
        await message.save();
        
        res.json({ message: 'Message marked as read' });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error marking message as read', 
            error: error.message 
        });
    }
};

// Delete a message (soft delete)
export const deleteMessage = async (req, res) => {
    try {
        const { messageId } = req.params;
        const userId = req.user.id;
        
        const message = await Message.findById(messageId);
        
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }
        
        // Verify user is the sender of this message
        if (message.senderId.toString() !== userId) {
            return res.status(403).json({ message: 'Not authorized to delete this message' });
        }
        
        // We're performing a soft delete by changing content
        message.content = '[Message deleted]';
        await message.save();
        
        res.json({ message: 'Message deleted successfully' });
    } catch (error) {
        res.status(500).json({ 
            message: 'Error deleting message', 
            error: error.message 
        });
    }
};