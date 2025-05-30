import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  isAuthenticated: boolean;
  user: {
    id?: string;
    email?: string;
    phoneNumber?: string;
    userType?: 'customer' | 'driver';
  } | null;
  onboardingCompleted: boolean;
}

const initialState: AuthState = {
  isAuthenticated: false,
  user: null,
  onboardingCompleted: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthenticated: (state, action: PayloadAction<boolean>) => {
      state.isAuthenticated = action.payload;
    },
    setUser: (state, action: PayloadAction<AuthState['user']>) => {
      state.user = action.payload;
    },
    setOnboardingCompleted: (state, action: PayloadAction<boolean>) => {
      state.onboardingCompleted = action.payload;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.user = null;
    },
  },
});

export const { setAuthenticated, setUser, setOnboardingCompleted, logout } = authSlice.actions;
export default authSlice.reducer;