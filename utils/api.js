import axios from 'axios';
import * as AuthStorage from './authStorage'; // We'll create this next

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api'; // Adjust if your backend port is different

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to add the token to requests
api.interceptors.request.use(
  async (config) => {
    const token = await AuthStorage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling token expiration or other auth errors (optional)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response && error.response.status === 401) {
      if (!originalRequest._retry) {
        originalRequest._retry = true;
        // Here you could try to refresh the token if you have a refresh token mechanism
        // For now, we'll just remove the token and signal for logout
        console.log('Authentication error (401), logging out.');
        await AuthStorage.removeToken();
        // Potentially redirect to login or emit an event for logout
        // window.location.href = '/login'; // Not suitable for React Native, use navigation
      }
    }
    return Promise.reject(error);
  }
);

export default api;

// Example auth service functions (can be in a separate authService.js or here)

export const loginUser = async (username, password) => {
  const response = await api.post('/auth/login', { username, password });
  return response.data; // { token, user: { id, username, role } }
};

export const registerUser = async (username, password, role) => {
  // Ensure role is 'user' or 'driver' as per backend enum (or 'admin')
  // The `user-type.tsx` will provide this role.
  const response = await api.post('/auth/register', { username, password, role });
  return response.data; // { msg: 'User registered successfully' }
};
