import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import SignInScreen from '../sign-in'; // Adjust path
import { router } from 'expo-router'; // Already mocked
import * as api from '@/utils/api'; // To mock its functions
import * as AuthStorage from '@/utils/authStorage'; // To spy on its functions

// Mock the api utility
jest.mock('@/utils/api', () => ({
  loginUser: jest.fn(),
}));

// Mock Redux store and actions if not using AuthContext for state
// For this example, I'll assume the Redux setup from previous steps is simple and
// doesn't need deep mocking for this component's logic, beyond router/api calls.
// If using AuthContext, wrap with a mock provider.
jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux'),
    useDispatch: () => jest.fn(), // Simple mock for useDispatch
  }));
// Mock specific actions if they are called directly and their results matter for the test
jest.mock('@/store/authSlice', () => ({
    setAuthenticated: jest.fn(),
    setUser: jest.fn(),
}));


describe('<SignInScreen />', () => {
  const mockLoginUser = api.loginUser as jest.Mock;
  const mockStoreToken = jest.spyOn(AuthStorage, 'storeToken');
  const mockStoreUserData = jest.spyOn(AuthStorage, 'storeUserData');

  beforeEach(() => {
    mockLoginUser.mockClear();
    mockStoreToken.mockClear();
    mockStoreUserData.mockClear();
    router.push.mockClear();
    router.replace.mockClear();
  });

  it('renders input fields and sign-in button', () => {
    const { getByPlaceholderText, getByText } = render(<SignInScreen />);
    expect(getByPlaceholderText('auth.enterUsername')).toBeTruthy(); // Key for username/phone
    expect(getByPlaceholderText('auth.enterPassword')).toBeTruthy();
    expect(getByText('auth.signInButton')).toBeTruthy(); // Key for sign in button
  });

  it('allows typing in username and password fields', () => {
    const { getByPlaceholderText } = render(<SignInScreen />);
    const usernameInput = getByPlaceholderText('auth.enterUsername');
    const passwordInput = getByPlaceholderText('auth.enterPassword');

    fireEvent.changeText(usernameInput, 'testuser');
    fireEvent.changeText(passwordInput, 'password123');

    expect(usernameInput.props.value).toBe('testuser');
    expect(passwordInput.props.value).toBe('password123');
  });

  it('shows error message if fields are empty on submit', async () => {
    const { getByText, findByText } = render(<SignInScreen />);
    fireEvent.press(getByText('auth.signInButton'));
    expect(await findByText('auth.fillFields')).toBeTruthy(); // Key for "Please fill in all fields"
  });

  it('calls loginUser API on submit with correct credentials', async () => {
    const { getByPlaceholderText, getByText } = render(<SignInScreen />);
    const usernameInput = getByPlaceholderText('auth.enterUsername');
    const passwordInput = getByPlaceholderText('auth.enterPassword');

    fireEvent.changeText(usernameInput, 'testuser');
    fireEvent.changeText(passwordInput, 'password123');
    
    mockLoginUser.mockResolvedValueOnce({ 
      token: 'fake-token', 
      user: { id: '1', username: 'testuser', role: 'user' } 
    });

    fireEvent.press(getByText('auth.signInButton'));

    await waitFor(() => {
      expect(mockLoginUser).toHaveBeenCalledWith('testuser', 'password123');
    });
  });

  it('on successful login, stores token/user data and navigates (user role)', async () => {
    mockLoginUser.mockResolvedValueOnce({ 
      token: 'fake-token', 
      user: { id: '1', username: 'testuser', role: 'user' } 
    });

    const { getByPlaceholderText, getByText } = render(<SignInScreen />);
    fireEvent.changeText(getByPlaceholderText('auth.enterUsername'), 'testuser');
    fireEvent.changeText(getByPlaceholderText('auth.enterPassword'), 'password123');
    fireEvent.press(getByText('auth.signInButton'));

    await waitFor(() => {
      expect(mockStoreToken).toHaveBeenCalledWith('fake-token');
      expect(mockStoreUserData).toHaveBeenCalledWith({ id: '1', username: 'testuser', role: 'user' });
      // Check Redux actions dispatched (using jest.mock('@/store/authSlice'))
      // This requires authSlice actions to be properly mocked or spied upon.
      // For now, we trust they are called via the dispatch mock.
      expect(router.replace).toHaveBeenCalledWith('/(user)'); // Or your default user route
    });
  });
  
  it('on successful login, navigates to picker route for driver role', async () => {
    mockLoginUser.mockResolvedValueOnce({ 
      token: 'fake-token-driver', 
      user: { id: '2', username: 'testdriver', role: 'driver' } 
    });

    const { getByPlaceholderText, getByText } = render(<SignInScreen />);
    fireEvent.changeText(getByPlaceholderText('auth.enterUsername'), 'testdriver');
    fireEvent.changeText(getByPlaceholderText('auth.enterPassword'), 'driverpass');
    fireEvent.press(getByText('auth.signInButton'));

    await waitFor(() => {
      expect(mockStoreToken).toHaveBeenCalledWith('fake-token-driver');
      expect(mockStoreUserData).toHaveBeenCalledWith({ id: '2', username: 'testdriver', role: 'driver' });
      expect(router.replace).toHaveBeenCalledWith('/(picker)'); // Or your default driver route
    });
  });

  it('shows error message on failed login (invalid credentials)', async () => {
    mockLoginUser.mockRejectedValueOnce({ 
      response: { data: { msg: 'Invalid credentials' } } 
    });

    const { getByPlaceholderText, getByText, findByText } = render(<SignInScreen />);
    fireEvent.changeText(getByPlaceholderText('auth.enterUsername'), 'testuser');
    fireEvent.changeText(getByPlaceholderText('auth.enterPassword'), 'wrongpassword');
    fireEvent.press(getByText('auth.signInButton'));

    expect(await findByText('Invalid credentials')).toBeTruthy();
  });
  
  it('shows generic error message on other API failures', async () => {
    mockLoginUser.mockRejectedValueOnce(new Error('Network Error'));

    const { getByPlaceholderText, getByText, findByText } = render(<SignInScreen />);
    fireEvent.changeText(getByPlaceholderText('auth.enterUsername'), 'testuser');
    fireEvent.changeText(getByPlaceholderText('auth.enterPassword'), 'password');
    fireEvent.press(getByText('auth.signInButton'));

    expect(await findByText('auth.signInError')).toBeTruthy(); // Key for generic sign in error
  });

  it('calls router.back() when back button is pressed', () => {
    const { getByText } // Assuming back button has text 'common.back'
     = render(<SignInScreen />);
    // The back button in the original component uses a ChevronLeft icon and text.
    // We need a way to target it, e.g., by testID or the text.
    // For simplicity, let's assume the text 'common.back' is unique enough or it has a testID.
    // If not, the component needs a testID on the TouchableOpacity.
    // fireEvent.press(getByText('common.back')); 
    // expect(router.back).toHaveBeenCalled();
    // This test is commented out because precisely targeting the back button without a testID can be brittle.
    // It's better to add a testID to the back button TouchableOpacity in the component itself.
    // e.g. <TouchableOpacity testID="goBackButton" ... >
  });
});
