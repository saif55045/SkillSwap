import axios from 'axios';

const API_URL = 'http://localhost:5000/api/admin';

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

export const adminService = {
    // Verification Management
    async getPendingVerifications() {
        try {
            const response = await authAxios().get(`${API_URL}/verification/pending`);
            return response.data;
        } catch (error) {
            console.error('Error fetching pending verifications:', error);
            throw new Error(error.response?.data?.message || 'Failed to fetch pending verifications');
        }
    },

    async getFreelancersByStatus(status) {
        try {
            const response = await authAxios().get(`${API_URL}/verification/freelancers/${status}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching ${status} freelancers:`, error);
            throw new Error(error.response?.data?.message || 'Failed to fetch freelancers');
        }
    },

    async getFreelancerVerificationDetails(freelancerId) {
        try {
            const response = await authAxios().get(`${API_URL}/verification/freelancer/${freelancerId}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching freelancer verification details:', error);
            throw new Error(error.response?.data?.message || 'Failed to fetch verification details');
        }
    },

    async processVerification(freelancerId, actionData) {
        try {
            const response = await authAxios().post(`${API_URL}/verification/process/${freelancerId}`, actionData);
            return response.data;
        } catch (error) {
            console.error('Error processing verification:', error);
            throw new Error(error.response?.data?.message || 'Failed to process verification');
        }
    },

    async getVerificationStats() {
        try {
            const response = await authAxios().get(`${API_URL}/verification/stats`);
            return response.data;
        } catch (error) {
            console.error('Error fetching verification stats:', error);
            throw new Error(error.response?.data?.message || 'Failed to fetch verification statistics');
        }
    },

    async updateVerificationLevel(freelancerId, verificationLevel) {
        try {
            const response = await authAxios().patch(`${API_URL}/verification/level/${freelancerId}`, { verificationLevel });
            return response.data;
        } catch (error) {
            console.error('Error updating verification level:', error);
            throw new Error(error.response?.data?.message || 'Failed to update verification level');
        }
    }
};