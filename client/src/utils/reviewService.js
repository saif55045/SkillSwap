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

export const reviewService = {
    // Create a new review
    createReview: async (reviewData) => {
        try {
            const response = await authAxios().post(
                `${API_URL}/reviews/create`,
                reviewData
            );
            return response.data;
        } catch (error) {
            console.error('Error creating review:', error.response?.data || error);
            throw new Error(error.response?.data?.message || 'Failed to create review');
        }
    },

    // Get all reviews for a freelancer
    getFreelancerReviews: async (freelancerId, filters = {}) => {
        try {
            let queryParams = new URLSearchParams();
            
            // Add filter parameters if provided
            if (filters.rating) queryParams.append('rating', filters.rating);
            if (filters.sort) queryParams.append('sort', filters.sort);
            
            const response = await authAxios().get(
                `${API_URL}/reviews/freelancers/${freelancerId}?${queryParams.toString()}`
            );
            return response.data;
        } catch (error) {
            console.error('Error getting freelancer reviews:', error.response?.data || error);
            throw new Error(error.response?.data?.message || 'Failed to get freelancer reviews');
        }
    },

    // Get all reviews for a project
    getProjectReviews: async (projectId) => {
        try {
            const response = await authAxios().get(
                `${API_URL}/reviews/projects/${projectId}`
            );
            return response.data;
        } catch (error) {
            console.error('Error getting project reviews:', error.response?.data || error);
            throw new Error(error.response?.data?.message || 'Failed to get project reviews');
        }
    },

    // Add a freelancer's response to a review
    addFreelancerResponse: async (reviewId, response) => {
        try {
            const result = await authAxios().post(
                `${API_URL}/reviews/${reviewId}/response`,
                { response }
            );
            return result.data;
        } catch (error) {
            console.error('Error adding response:', error.response?.data || error);
            throw new Error(error.response?.data?.message || 'Failed to add response');
        }
    },

    // Update a review
    updateReview: async (reviewId, updateData) => {
        try {
            const response = await authAxios().put(
                `${API_URL}/reviews/${reviewId}`,
                updateData
            );
            return response.data;
        } catch (error) {
            console.error('Error updating review:', error.response?.data || error);
            throw new Error(error.response?.data?.message || 'Failed to update review');
        }
    },

    // Delete a review
    deleteReview: async (reviewId) => {
        try {
            const response = await authAxios().delete(
                `${API_URL}/reviews/${reviewId}`
            );
            return response.data;
        } catch (error) {
            console.error('Error deleting review:', error.response?.data || error);
            throw new Error(error.response?.data?.message || 'Failed to delete review');
        }
    }
};