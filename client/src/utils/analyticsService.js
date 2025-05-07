import axios from 'axios';
import { API_URL } from '../config';

export const analyticsService = {
  // Get client analytics data
  getClientAnalytics: async (clientId, dateRange = {}) => {
    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.get(
        `${API_URL}/analytics/client/${clientId}`, 
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          params: dateRange
        }
      );
      return data.data;
    } catch (error) {
      console.error('Error fetching analytics data:', error);
      throw error.response?.data || error.message;
    }
  },

  // Export analytics data as CSV
  exportAnalyticsCSV: async (clientId, type, dateRange = {}) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${API_URL}/analytics/client/${clientId}/export-csv`, 
        {
          headers: {
            Authorization: `Bearer ${token}`
          },
          params: {
            ...dateRange,
            type
          },
          responseType: 'blob'
        }
      );
      
      // Create a download link and trigger download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `skillswap_${type}_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return true;
    } catch (error) {
      console.error('Error exporting analytics data:', error);
      throw error.response?.data || error.message;
    }
  }
};