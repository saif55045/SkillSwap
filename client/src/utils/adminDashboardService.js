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

export const adminDashboardService = {
    async getDashboardStats() {
        try {
            const response = await authAxios().get(`${API_URL}/analytics/dashboard-stats`);
            return response.data;
        } catch (error) {
            console.error('Error fetching dashboard stats:', error);
            throw new Error(error.response?.data?.message || 'Failed to fetch dashboard statistics');
        }
    }
};