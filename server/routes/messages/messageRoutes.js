import express from 'express';
import { 
    sendMessage,
    getConversation,
    getUserConversations,
    markMessageAsRead,
    deleteMessage
} from '../../controllers/messages/messageController.js';
import { authenticateToken } from '../../middleware/authMiddleware.js';

const router = express.Router();

// All message routes require authentication
router.use(authenticateToken);

// Send a message
router.post('/', sendMessage);

// Get all conversations for the current user
router.get('/conversations', getUserConversations);

// Get conversation with another user
router.get('/conversation/:userId', getConversation);

// Mark message as read
router.put('/:messageId/read', markMessageAsRead);

// Delete a message
router.delete('/:messageId', deleteMessage);

export default router;