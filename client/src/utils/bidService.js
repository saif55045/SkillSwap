import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

// Helper function to create axios instance with auth headers
const authAxios = () => {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('Authentication token not found');
    }
    return axios.create({
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
        }
    });
};

export const bidService = {
    createBid: async (projectId, bidData) => {
        try {
            const response = await authAxios().post(
                `${API_URL}/bids/projects/${projectId}/bids`,
                bidData
            );
            return response.data;
        } catch (error) {
            console.error('Error creating bid:', error.response?.data || error);
            throw new Error(error.response?.data?.message || 'Failed to create bid');
        }
    },

    getProjectBids: async (projectId) => {
        try {
            const response = await authAxios().get(`${API_URL}/bids/projects/${projectId}/bids`);
            console.log('Fetched bids:', response.data); // Add debugging to verify data
            return response.data;
        } catch (error) {
            console.error('Error getting bids:', error.response?.data || error);
            throw new Error(error.response?.data?.message || 'Failed to retrieve bids');
        }
    },

    getFreelancerBids: async (freelancerId) => {
        try {
            const response = await authAxios().get(`${API_URL}/bids/freelancers/${freelancerId}/bids`);
            console.log('Fetched freelancer bids:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error getting freelancer bids:', error.response?.data || error);
            throw new Error(error.response?.data?.message || 'Failed to retrieve freelancer bids');
        }
    },

    updateBidStatus: async (bidId, status) => {
        try {
            const response = await authAxios().patch(
                `${API_URL}/bids/bids/${bidId}/status`,
                { status }
            );
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to update bid status');
        }
    },

    createCounterOffer: async (bidId, counterOfferData) => {
        try {
            const response = await authAxios().post(
                `${API_URL}/bids/bids/${bidId}/counter-offer`,
                counterOfferData
            );
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to create counter offer');
        }
    },

    acceptCounterOffer: async (bidId) => {
        try {
            const response = await authAxios().post(
                `${API_URL}/bids/bids/${bidId}/accept-counter`
            );
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to accept counter offer');
        }
    }
};