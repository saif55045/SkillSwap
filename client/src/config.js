// API configuration
export const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://api.skillswap.com/api' 
  : 'http://localhost:5000/api';