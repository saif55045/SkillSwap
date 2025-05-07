import axios from 'axios';

const API_URL = 'http://localhost:5000/api/auth';

export const authService = {
    async register(userData) {
        try {
            const response = await axios.post(`${API_URL}/signup`, userData);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || 'Registration failed';
            throw new Error(message);
        }
    },

    async login(credentials) {
        try {
            const response = await axios.post(`${API_URL}/login`, credentials);
            return response.data;
        } catch (error) {
            const message = error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || 'Login failed';
            throw new Error(message);
        }
    }
};