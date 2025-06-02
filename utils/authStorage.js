import * as SecureStore from 'expo-secure-store';

const TOKEN_KEY = 'jwt_token';
const USER_DATA_KEY = 'user_data'; // For storing user object {id, username, role}

export const storeToken = async (token) => {
  try {
    await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch (error) {
    console.error('Error storing the auth token', error);
  }
};

export const getToken = async () => {
  try {
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error('Error getting the auth token', error);
    return null;
  }
};

export const removeToken = async () => {
  try {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch (error) {
    console.error('Error removing the auth token', error);
  }
};

// Storing user data (optional, can also be derived from token or fetched on app load)
export const storeUserData = async (userData) => {
  try {
    await SecureStore.setItemAsync(USER_DATA_KEY, JSON.stringify(userData));
  } catch (error) {
    console.error('Error storing user data', error);
  }
};

export const getUserData = async () => {
  try {
    const userDataString = await SecureStore.getItemAsync(USER_DATA_KEY);
    return userDataString ? JSON.parse(userDataString) : null;
  } catch (error) {
    console.error('Error getting user data', error);
    return null;
  }
};

export const removeUserData = async () => {
  try {
    await SecureStore.deleteItemAsync(USER_DATA_KEY);
  } catch (error) {
    console.error('Error removing user data', error);
  }
};

export const clearAuthStorage = async () => {
    await removeToken();
    await removeUserData();
}
