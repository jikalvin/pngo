import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import * as api from '../../services/api'; // Adjust path as per your project structure
import type { User } from './authSlice'; // Re-use User interface from authSlice

// Define the state structure for users/pickers
export interface UserState {
  users: User[]; // For lists of users/pickers
  selectedUser: User | null; // For viewing a single user/picker profile
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalUsers: number;
  limit: number;
  // For matchPicker specifically
  isMatchingPicker: boolean;
  matchPickerError: string | null;
  matchResult: any | null; // Define a proper interface for match result
}

const initialState: UserState = {
  users: [],
  selectedUser: null,
  isLoading: false,
  error: null,
  currentPage: 1,
  totalPages: 0,
  totalUsers: 0,
  limit: 10,
  isMatchingPicker: false,
  matchPickerError: null,
  matchResult: null,
};

// Async Thunks
interface FetchUsersParams {
  page?: number;
  limit?: number;
  role?: 'user' | 'picker';
  // Add other potential query params for GET /api/auth/users or /api/auth/users/search
}

export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (params: FetchUsersParams = {}, { rejectWithValue }) => {
    try {
      // Assuming api.getUsers can handle these params.
      // The API endpoint might be /api/auth/users or /api/auth/users/search
      // For now, let's assume api.getUsers is flexible or we might need a more specific API call.
      const response = await api.getUsers(params);
      // Assuming API response is { data: User[], meta: { currentPage, totalPages, totalItems, limit } }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchUserById = createAsyncThunk(
  'users/fetchUserById',
  async (userId: string, { rejectWithValue }) => {
    try {
      const response = await api.getUserById(userId);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

interface MatchData {
  taskId: string;
  // other criteria for matching, e.g., location, skills
  [key: string]: any;
}

export const matchPicker = createAsyncThunk(
  'users/matchPicker',
  async (matchData: MatchData, { rejectWithValue }) => {
    try {
      const response = await api.matchRecommendation(matchData); // Ensure this API function exists
      return response.data; // Define what the match result looks like
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);


const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    resetSelectedUser: (state) => {
      state.selectedUser = null;
    },
    clearMatchResult: (state) => {
      state.matchResult = null;
      state.matchPickerError = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // fetchUsers
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action: PayloadAction<{ data: User[], meta: any }>) => {
        state.isLoading = false;
        state.users = action.payload.data; // Replace or append based on pagination
        state.currentPage = action.payload.meta.currentPage;
        state.totalPages = action.payload.meta.totalPages;
        state.totalUsers = action.payload.meta.totalItems;
        state.limit = action.payload.meta.limit;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // fetchUserById
      .addCase(fetchUserById.pending, (state) => {
        state.isLoading = true;
        state.selectedUser = null;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.selectedUser = action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string; // Consider a specific error field for selectedUser
      })
      // matchPicker
      .addCase(matchPicker.pending, (state) => {
        state.isMatchingPicker = true;
        state.matchPickerError = null;
        state.matchResult = null;
      })
      .addCase(matchPicker.fulfilled, (state, action: PayloadAction<any>) => {
        state.isMatchingPicker = false;
        state.matchResult = action.payload;
      })
      .addCase(matchPicker.rejected, (state, action) => {
        state.isMatchingPicker = false;
        state.matchPickerError = action.payload as string;
      });
  },
});

export const { resetSelectedUser, clearMatchResult } = userSlice.actions;
export default userSlice.reducer;
