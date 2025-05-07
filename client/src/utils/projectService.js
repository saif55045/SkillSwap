import axios from 'axios';

const API_URL = 'http://localhost:5000/api/projects';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    };
};

export const projectService = {
    async createProject(projectData) {
        try {
            const response = await axios.post(API_URL, projectData, getAuthHeader());
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to create project');
        }
    },

    async getProjects(params) {
        try {
            const queryString = new URLSearchParams(params).toString();
            
            const response = await axios.get(`${API_URL}?${queryString}`, getAuthHeader());
            
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch projects');
        }
    },

    async getProjectById(id) {
        try {
            const response = await axios.get(`${API_URL}/${id}`, getAuthHeader());
            
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to fetch project');
        }
    },

    async updateProject(id, projectData) {
        try {
            const response = await axios.put(`${API_URL}/${id}`, projectData, getAuthHeader());
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to update project');
        }
    },

    async deleteProject(id) {
        try {
            const response = await axios.delete(`${API_URL}/${id}`, getAuthHeader());
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to delete project');
        }
    },

    async changeProjectStatus(id, status) {
        try {
            const response = await axios.patch(
                `${API_URL}/${id}/status`,
                { status },
                getAuthHeader()
            );
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to change project status');
        }
    },

    async updateProjectProgress(id, progress) {
        try {
            const response = await axios.patch(
                `${API_URL}/${id}/progress`,
                { progress },
                getAuthHeader()
            );
            return response.data;
        } catch (error) {
            throw new Error(error.response?.data?.message || 'Failed to update project progress');
        }
    }
};