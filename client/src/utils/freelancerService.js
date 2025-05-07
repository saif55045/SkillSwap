import axios from 'axios';

const API_URL = 'http://localhost:5000/api/freelancers';

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

export const freelancerService = {
    async searchFreelancers(params) {
        try {
            const queryString = new URLSearchParams(params).toString();
            const response = await axios.get(`${API_URL}/search?${queryString}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to search freelancers');
        }
    },

    async getFreelancerDetails(id) {
        try {
            const response = await axios.get(`${API_URL}/${id}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch freelancer details');
        }
    },

    async getProfile() {
        try {
            const response = await authAxios().get(`${API_URL}/profile`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch profile');
        }
    },

    async updateProfile(profileData) {
        try {
            const response = await authAxios().put(`${API_URL}/profile`, profileData);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to update profile');
        }
    },

    async uploadPortfolioImage(formData) {
        try {
            const response = await authAxios().post(`${API_URL}/portfolio/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to upload image');
        }
    },
    
    async getSkills() {
        try {
            const response = await axios.get(`${API_URL}/skills`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch skills');
        }
    },
    
    async getVerificationStatus() {
        try {
            const response = await authAxios().get(`${API_URL}/verification/status`);
            return response.data;
        } catch (error) {
            console.error('Error fetching verification status:', error);
            throw new Error(error.response?.data?.message || 'Failed to fetch verification status');
        }
    },

    async getEarnings(filters = {}) {
        try {
            const queryString = new URLSearchParams(filters).toString();
            const response = await authAxios().get(`${API_URL}/earnings?${queryString}`);
            return response.data;
        } catch (error) {
            console.error('Earnings fetch error:', error);
            throw new Error(error.response?.data?.message || 'Failed to fetch earnings data');
        }
    },
    
    async syncMissingEarnings() {
        try {
            const response = await authAxios().post(`${API_URL}/earnings/sync`);
            return response.data;
        } catch (error) {
            console.error('Earnings sync error:', error);
            throw new Error(error.response?.data?.message || 'Failed to sync missing earnings');
        }
    },
    
    async exportEarningsData(filters = {}, format = 'csv') {
        try {
            const queryString = new URLSearchParams({...filters, format}).toString();
            const response = await authAxios().get(`${API_URL}/earnings/export?${queryString}`, {
                responseType: 'blob'
            });
            
            // Create a download link and trigger download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `earnings-export-${Date.now()}.${format}`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            
            return { success: true };
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to export earnings data');
        }
    },

    async getPublicFreelancerProfile(id) {
        try {
            const response = await axios.get(`${API_URL}/public/${id}`);
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch freelancer profile');
        }
    },

    async requestVerification(formData) {
        try {
            // We need to send the request with the correct Content-Type and authorization
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await axios.post(
                `${API_URL}/verification/request`,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        'Authorization': `Bearer ${token}`
                    }
                }
            );
            return response.data;
        } catch (error) {
            console.error('Error requesting verification:', error);
            throw new Error(error.response?.data?.message || 'Failed to request verification');
        }
    },

    async getVerificationDocuments() {
        try {
            const response = await authAxios().get(`${API_URL}/verification/documents`);
            return response.data;
        } catch (error) {
            console.error('Error fetching verification documents:', error);
            throw new Error(error.response?.data?.message || 'Failed to fetch verification documents');
        }
    },

    async deleteVerificationDocument(documentId) {
        try {
            const response = await authAxios().delete(`${API_URL}/verification/documents/${documentId}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting verification document:', error);
            throw new Error(error.response?.data?.message || 'Failed to delete verification document');
        }
    }
};