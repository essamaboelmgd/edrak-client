import axios from 'axios';

// Base URL from environment or default to localhost
// Postman says http://localhost:3000
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const client = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor to attach token
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add interceptors for token management if needed later
client.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle global errors
    return Promise.reject(error);
  }
);

export const userApi = {
  getPublicTeacherProfile: async (subdomain: string) => {
    const response = await client.get(`/users/public/${subdomain}`);
    return response.data.data;
  }
};
