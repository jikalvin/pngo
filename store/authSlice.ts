import { createSlice, PayloadAction, createAsyncThunk } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as api from '../../services/api'; // Adjust path as per your project structure

interface Location {
  address?: string;
  city?: string;
  postalCode?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

interface UserProfile {
  fullName?: string;
  photoUrl?: string;
  dateOfBirth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_say';
  bio?: string;
  location?: Location;
  languages?: string[];
  // Add any other fields that come from GET /api/profile/me or are updated via PUT /api/profile/update
}

// Combine basic user identity with profile details
interface User extends UserProfile {
  id: string; // id should be mandatory for an existing user
  email: string; // email should be mandatory
  phoneNumber?: string;
  userType: 'user' | 'picker'; // userType should be mandatory
  isVerified?: boolean;
  isActive?: boolean;
  // any other non-profile specific but user-related fields
}

interface AuthState {
  token: string | null;
  user: Partial<User> | null; // User can be partial until fully loaded
  isLoading: boolean; // For login/register loading
  error: string | null; // For login/register errors
  isProfileLoading: boolean; // For profile fetching
  profileError: string | null; // For profile fetching errors
  isProfileUpdating: boolean; // For profile update operations
  profileUpdateError: string | null; // For profile update errors
  isAuthenticated: boolean;
  onboardingCompleted: boolean;
}

const initialState: AuthState = {
  token: null,
  user: null,
  isLoading: false,
  error: null,
  isProfileLoading: false,
  profileError: null,
  isProfileUpdating: false,
  profileUpdateError: null,
  isAuthenticated: false,
  onboardingCompleted: false,
};

// Async Thunks
export const updateUserProfile = createAsyncThunk(
  'auth/updateUserProfile',
  async (profileData: Partial<User>, { rejectWithValue }) => {
    try {
      // If profileData contains a 'photo' field with a local URI,
      // it needs to be handled to create FormData.
      // For now, assume api.updateUserProfile handles FormData creation if photo is present.
      const response = await api.updateUserProfile(profileData);
      return response.data; // Assuming API returns updated user profile
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const fetchUserProfile = createAsyncThunk(
  'auth/fetchUserProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.getMyProfile();
      return response.data; // Assuming API returns user profile data
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (credentials: any, { rejectWithValue }) => {
    try {
      const response = await api.loginUser(credentials);
      // Assuming the API returns { token, user }
      await AsyncStorage.setItem('jwtToken', response.data.token);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/registerUser',
  async (userData: any, { rejectWithValue }) => {
    try {
      const response = await api.registerUser(userData);
      // Assuming the API returns { token, user } (or just a success message)
      // If token and user are returned, store them similar to login
      if (response.data.token && response.data.user) {
        await AsyncStorage.setItem('jwtToken', response.data.token);
      }
      return response.data;
    } catch (error: any) { // Corrected this line
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const loadTokenFromStorage = createAsyncThunk(
  'auth/loadTokenFromStorage',
  async (_, { dispatch, rejectWithValue }) => { // Added rejectWithValue
    try {
      const token = await AsyncStorage.getItem('jwtToken');
      if (token) {
        dispatch(setToken(token));
        // Automatically fetch user profile if token is found
        // This ensures user data is loaded as soon as possible
        await dispatch(fetchUserProfile()).unwrap(); // Use unwrap to catch potential rejection here
      }
      // Do not return anything, or return a specific value if needed by other logic
    } catch (error: any) {
      // If fetchUserProfile (or other operations) fails, this error will be caught.
      // We can choose to reject the thunk, which would set loadTokenFromStorage.rejected.
      // Or, handle it more gracefully, e.g., by logging and not setting the user as authenticated.
      console.error('Failed to load token or fetch profile from storage flow', error);
      // Optionally clear token if profile fetch fails critically
      // await AsyncStorage.removeItem('jwtToken');
      // dispatch(logout()); // This would clear auth state
      return rejectWithValue(error.message || 'Failed to initialize session');
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload;
      state.isAuthenticated = !!action.payload;
    },
    setUser: (state, action: PayloadAction<AuthState['user']>) => {
      state.user = action.payload;
    },
    setOnboardingCompleted: (state, action: PayloadAction<boolean>) => {
      state.onboardingCompleted = action.payload;
    },
    logout: (state) => {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      AsyncStorage.removeItem('jwtToken');
    },
    // Reducers for sync actions if still needed for start/failure, otherwise handled by thunk meta
    loginStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    loginSuccess: (state, action: PayloadAction<{ token: string; user: User }>) => {
      state.isLoading = false;
      state.token = action.payload.token;
      // The user object from login response might be partial or complete.
      // If it's complete, it will overwrite state.user.
      // If it's partial, and you expect more data, fetchUserProfile might be needed
      // either here or in the component. For now, we assume login provides sufficient user data.
      state.user = action.payload.user as User;
      state.isAuthenticated = true;
      state.error = null;
      state.isProfileLoading = false; // Ensure profile loading is reset
      state.profileError = null;
    },
    loginFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
      state.isProfileLoading = false;
    },
    registerStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    registerSuccess: (state, action: PayloadAction<{ token?: string; user?: Partial<User>; message?: string }>) => {
      state.isLoading = false;
      if (action.payload.token) { // User might not be fully authenticated/profiled until verification
        state.token = action.payload.token;
        // If user object is returned from registration, store it.
        // It might be partial, full profile fetch might occur after verification.
        if (action.payload.user) {
          state.user = { ...state.user, ...action.payload.user };
        }
        // Decide on isAuthenticated status based on app flow (e.g., post-verification)
        // For now, setting to true if token is received.
        state.isAuthenticated = true;
      }
      state.error = null;
    },
    registerFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.token = action.payload.token;
        // User data from login response is stored.
        // Consider if this data is the full profile or if fetchUserProfile should be dispatched.
        // For now, assume login response provides a usable User object.
        state.user = action.payload.user as User;
        state.isAuthenticated = true;
        state.error = null;
        state.isProfileLoading = false; // Reset profile loading state
        state.profileError = null;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isProfileLoading = false;
      })
      // Register
      .addCase(registerUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isLoading = false;
        // If registration returns a token, user might be partially authenticated.
        // Full profile and isAuthenticated might depend on further steps like email verification.
        if (action.payload.token) {
          state.token = action.payload.token;
          // Store user data if returned, merging with any existing partial data.
          if (action.payload.user) {
            state.user = { ...state.user, ...action.payload.user };
          }
          // Potentially set isAuthenticated to true, or wait for verification.
          // state.isAuthenticated = true; // This depends on exact registration flow
        }
        // If user needs to verify email, they might not be fully "authenticated" yet.
        // The UI should guide them. Login after verification would fetch full profile.
        state.error = null;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch User Profile
      .addCase(fetchUserProfile.pending, (state) => {
        state.isProfileLoading = true;
        state.profileError = null;
      })
      .addCase(fetchUserProfile.fulfilled, (state, action: PayloadAction<User>) => {
        state.isProfileLoading = false;
        // Merge fetched profile data with existing user data
        // This ensures fields not part of profile API (like id from login) are preserved
        state.user = { ...state.user, ...action.payload };
        state.isAuthenticated = true; // Ensure isAuthenticated is true if profile is fetched successfully
      })
      .addCase(fetchUserProfile.rejected, (state, action) => {
        state.isProfileLoading = false;
        state.profileError = action.payload as string;
        // Optionally, if profile fetch fails critically after token load, log out user
        // state.isAuthenticated = false;
        // state.token = null;
        // AsyncStorage.removeItem('jwtToken');
      })
      // Update User Profile
      .addCase(updateUserProfile.pending, (state) => {
        state.isProfileUpdating = true;
        state.profileUpdateError = null;
      })
      .addCase(updateUserProfile.fulfilled, (state, action: PayloadAction<User>) => {
        state.isProfileUpdating = false;
        // Merge updated profile data with existing user data
        state.user = { ...state.user, ...action.payload };
        // Potentially show a success message to the user via a different state field if needed
      })
      .addCase(updateUserProfile.rejected, (state, action) => {
        state.isProfileUpdating = false;
        state.profileUpdateError = action.payload as string;
      });
  },
});

export const {
  setToken,
  setUser,
  setOnboardingCompleted,
  logout,
  loginStart,
  loginSuccess,
  loginFailure,
  registerStart,
  registerSuccess,
  registerFailure,
} = authSlice.actions;

export default authSlice.reducer;