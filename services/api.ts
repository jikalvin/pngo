import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://api.example.com'; // Replace with your actual API base URL

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Function to get JWT token from AsyncStorage
const getToken = async () => {
  try {
    const token = await AsyncStorage.getItem('jwtToken');
    return token;
  } catch (error) {
    console.error('Error getting token from AsyncStorage:', error);
    return null;
  }
};

// Add a request interceptor to include the token in headers
apiClient.interceptors.request.use(
  async (config) => {
    const token = await getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// API functions will be added here

// Auth endpoints
export const registerUser = (userData: any) => apiClient.post('/api/auth/register', userData);
export const loginUser = (credentials: any) => apiClient.post('/api/auth/login', credentials);
export const verifyEmail = (data: any) => apiClient.post('/api/auth/verify-email', data);
export const verifyPhone = (data: any) => apiClient.post('/api/auth/verify-phone', data);
export const getUsers = () => apiClient.get('/api/auth/users');
export const getUserById = (userId: string) => apiClient.get(`/api/auth/users/${userId}`);
export const searchUsers = (queryParams: any) => apiClient.get('/api/auth/users/search', { params: queryParams });
export const protectedRoute = () => apiClient.get('/api/auth/protected');
export const doerOnlyRoute = () => apiClient.get('/api/auth/doer-only');

// Profile endpoints
export const getMyProfile = () => apiClient.get('/api/profile/me');

export const updateUserProfile = (profileData: any) => {
  if (profileData.photo && typeof profileData.photo === 'object' && profileData.photo.uri) {
    const formData = new FormData();

    // Append photo
    // The photo object should have uri, name, and type: { uri: localUri, name: 'photo.jpg', type: 'image/jpeg' }
    formData.append('photo', profileData.photo as any); // Type assertion needed for FormData's append

    // Append other profile data fields
    for (const key in profileData) {
      if (key !== 'photo' && profileData.hasOwnProperty(key)) {
        // Handle nested objects like 'location' by stringifying them if your backend expects that
        if (typeof profileData[key] === 'object' && profileData[key] !== null) {
          formData.append(key, JSON.stringify(profileData[key]));
        } else if (profileData[key] !== undefined && profileData[key] !== null) {
          formData.append(key, profileData[key]);
        }
      }
    }

    return apiClient.put('/api/profile/update', formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // Explicitly set, though Axios might do it
      },
    });
  } else {
    // If no photo, send as JSON
    return apiClient.put('/api/profile/update', profileData);
  }
};

export const deleteUserProfile = () => apiClient.delete('/api/profile/delete');

// Task endpoints
export const createTask = (taskData: any) => {
  // Check if images are present and need FormData
  if (taskData.images && Array.isArray(taskData.images) && taskData.images.length > 0) {
    const formData = new FormData();

    // Append images
    // Each image object should be { uri: localUri, name: 'photo.jpg', type: 'image/jpeg' }
    taskData.images.forEach((image: any, index: number) => {
      formData.append('images', image as any); // Backend might expect 'images[]' or just multiple 'images' fields
    });

    // Append other task data fields
    for (const key in taskData) {
      if (key !== 'images' && taskData.hasOwnProperty(key)) {
        // Handle nested objects like 'location' by stringifying them if your backend expects that
        if (typeof taskData[key] === 'object' && taskData[key] !== null) {
          formData.append(key, JSON.stringify(taskData[key]));
        } else if (taskData[key] !== undefined && taskData[key] !== null) {
          formData.append(key, String(taskData[key])); // Ensure values are strings if not objects/files
        }
      }
    }

    return apiClient.post('/api/tasks', formData, {
      headers: {
        'Content-Type': 'multipart/form-data', // Axios might set this automatically for FormData
      },
    });
  } else {
    // If no images, send as JSON
    return apiClient.post('/api/tasks', taskData);
  }
};

export const getTasks = (params?: any) => apiClient.get('/api/tasks', { params }); // Added params
export const getTaskById = (id: string) => apiClient.get(`/api/tasks/${id}`);

export const updateTask = (id: string, taskData: any) => {
  // Check if new images are present and need FormData
  if (taskData.images && Array.isArray(taskData.images) && taskData.images.length > 0) {
    const formData = new FormData();

    // Append new images
    taskData.images.forEach((image: any) => {
      formData.append('images', image as any); // { uri, name, type }
    });

    // Append other task data fields
    for (const key in taskData) {
      if (key !== 'images' && taskData.hasOwnProperty(key)) {
        if (typeof taskData[key] === 'object' && taskData[key] !== null) {
          formData.append(key, JSON.stringify(taskData[key]));
        } else if (taskData[key] !== undefined && taskData[key] !== null) {
          formData.append(key, String(taskData[key]));
        }
      }
    }

    return apiClient.put(`/api/tasks/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  } else {
    // If no new images, send other data as JSON (remove 'images' if it's an empty array or null)
    const { images, ...jsonData } = taskData; // Exclude images if it's empty/null and not for FormData
    return apiClient.put(`/api/tasks/${id}`, jsonData);
  }
};

export const deleteTask = (id: string) => apiClient.delete(`/api/tasks/${id}`);
export const getAllTasksAdmin = () => apiClient.get('/api/tasks/admin/all');

// Payment endpoints
export const initiatePayment = (paymentData: any) => apiClient.post('/api/payments/initiate', paymentData);
export const getPaymentStatus = (paymentId: string) => apiClient.get(`/api/payments/status/${paymentId}`);
export const getPaymentHistory = () => apiClient.get('/api/payments/history');

// Notification endpoints
export const registerNotificationToken = (tokenData: any) => apiClient.post('/api/notifications/register-token', tokenData);
export const removeNotificationToken = (tokenData: any) => apiClient.delete('/api/notifications/remove-token', { data: tokenData });
export const getNotifications = () => apiClient.get('/api/notifications');
export const markNotificationAsRead = (notificationId: string) => apiClient.put(`/api/notifications/${notificationId}/read`);
export const deleteNotification = (notificationId: string) => apiClient.delete(`/api/notifications/${notificationId}`);
export const testSocketNotification = (data: any) => apiClient.post('/api/notifications/test/socket', data);
export const testPushNotification = (data: any) => apiClient.post('/api/notifications/test/push', data);
export const testBothNotifications = (data: any) => apiClient.post('/api/notifications/test/both', data);

// Recommendation endpoints
export const matchRecommendation = (data: any) => apiClient.post('/api/recommendations/match', data);
export const recommendRecommendation = (data: any) => apiClient.post('/api/recommendations/recommend', data);

export default apiClient;
