import { configureStore } from '@reduxjs/toolkit';
import authReducer, { loadTokenFromStorage } from './authSlice';
import taskReducer from './taskSlice';
import userReducer from './userSlice'; // Import the user reducer

export const store = configureStore({
  reducer: {
    auth: authReducer,
    tasks: taskReducer,
    users: userReducer, // Add user reducer to the store
  },
});

// Dispatch loadTokenFromStorage to load the token when the app starts
store.dispatch(loadTokenFromStorage());

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;