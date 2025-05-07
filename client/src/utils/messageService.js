import axios from 'axios';

const API_URL = 'http://localhost:5000/api/messages';

// Create axios instance with authorization header
const authAxios = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('No authentication token found');
    }
    return axios.create({
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        }
    });
};

export const messageService = {
    async sendMessage(messageData) {
        try {
            const response = await authAxios().post(`${API_URL}/`, messageData);
            return response.data;
        } catch (error) {
            console.error('Error sending message:', error);
            throw new Error(error.response?.data?.message || 'Failed to send message');
        }
    },

    async getConversations() {
        try {
            const response = await authAxios().get(`${API_URL}/conversations`);
            return response.data;
        } catch (error) {
            console.error('Error fetching conversations:', error);
            throw new Error(error.response?.data?.message || 'Failed to fetch conversations');
        }
    },

    async getConversation(userId) {
        try {
            const response = await authAxios().get(`${API_URL}/conversation/${userId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching conversation:', error);
            throw new Error(error.response?.data?.message || 'Failed to fetch conversation');
        }
    },

    async markAsRead(messageId) {
        try {
            const response = await authAxios().put(`${API_URL}/${messageId}/read`);
            return response.data;
        } catch (error) {
            console.error('Error marking message as read:', error);
            throw new Error(error.response?.data?.message || 'Failed to mark message as read');
        }
    },

    async deleteMessage(messageId) {
        try {
            const response = await authAxios().delete(`${API_URL}/${messageId}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting message:', error);
            throw new Error(error.response?.data?.message || 'Failed to delete message');
        }
    }
};