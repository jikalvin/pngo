import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import SignUpScreen from '../sign-up'; // Adjust path
import { router, useLocalSearchParams } from 'expo-router'; // Already mocked
import * as api from '@/utils/api'; // To mock its functions
import { Alert } from 'react-native';

// Mock the api utility
jest.mock('@/utils/api', () => ({
  registerUser: jest.fn(),
  loginUser: jest.fn(), // Mocked in case auto-login path is tested
}));

// Mock Redux (if used for state, similar to sign-in test)
jest.mock('react-redux', () => ({
    ...jest.requireActual('react-redux'),
    useDispatch: () => jest.fn(),
}));
jest.mock('@/store/authSlice', () => ({
    setAuthenticated: jest.fn(),
    setUser: jest.fn(),
}));

// Mock Alert
jest.spyOn(Alert, 'alert');

describe('<SignUpScreen />', () => {
  const mockRegisterUser = api.registerUser as jest.Mock;
  // const mockLoginUser = api.loginUser as jest.Mock; // For auto-login test

  beforeEach(() => {
    mockRegisterUser.mockClear();
    // mockLoginUser.mockClear();
    router.push.mockClear();
    router.replace.mockClear();
    router.back.mockClear();
    (Alert.alert as jest.Mock).mockClear();
    // Mock useLocalSearchParams to return a userType
    (useLocalSearchParams as jest.Mock).mockReturnValue({ userType: 'user' });
  });

  it('renders input fields and sign-up button', () => {
    const { getByPlaceholderText, getByText } = render(<SignUpScreen />);
    expect(getByPlaceholderText('auth.enterUsername')).toBeTruthy();
    expect(getByPlaceholderText('auth.enterPassword')).toBeTruthy();
    expect(getByPlaceholderText('auth.enterConfirmPassword')).toBeTruthy();
    expect(getByText('auth.signUpButton')).toBeTruthy();
  });

  it('allows typing in all fields', () => {
    const { getByPlaceholderText } = render(<SignUpScreen />);
    const usernameInput = getByPlaceholderText('auth.enterUsername');
    const passwordInput = getByPlaceholderText('auth.enterPassword');
    const confirmPasswordInput = getByPlaceholderText('auth.enterConfirmPassword');

    fireEvent.changeText(usernameInput, 'newuser');
    fireEvent.changeText(passwordInput, 'newpass123');
    fireEvent.changeText(confirmPasswordInput, 'newpass123');

    expect(usernameInput.props.value).toBe('newuser');
    expect(passwordInput.props.value).toBe('newpass123');
    expect(confirmPasswordInput.props.value).toBe('newpass123');
  });

  it('shows error if fields are empty on submit', async () => {
    const { getByText, findByText } = render(<SignUpScreen />);
    fireEvent.press(getByText('auth.signUpButton'));
    expect(await findByText('auth.fillAllFields')).toBeTruthy();
  });

  it('shows error if passwords do not match', async () => {
    const { getByPlaceholderText, getByText, findByText } = render(<SignUpScreen />);
    fireEvent.changeText(getByPlaceholderText('auth.enterUsername'), 'newuser');
    fireEvent.changeText(getByPlaceholderText('auth.enterPassword'), 'pass1');
    fireEvent.changeText(getByPlaceholderText('auth.enterConfirmPassword'), 'pass2');
    fireEvent.press(getByText('auth.signUpButton'));
    expect(await findByText('auth.passwordsDoNotMatch')).toBeTruthy();
  });

  it('calls registerUser API on submit with correct data (user role)', async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ userType: 'user' });
    const { getByPlaceholderText, getByText } = render(<SignUpScreen />);
    fireEvent.changeText(getByPlaceholderText('auth.enterUsername'), 'newuser');
    fireEvent.changeText(getByPlaceholderText('auth.enterPassword'), 'newpass123');
    fireEvent.changeText(getByPlaceholderText('auth.enterConfirmPassword'), 'newpass123');
    
    mockRegisterUser.mockResolvedValueOnce({ msg: 'User registered successfully' });

    fireEvent.press(getByText('auth.signUpButton'));

    await waitFor(() => {
      expect(mockRegisterUser).toHaveBeenCalledWith('newuser', 'newpass123', 'user');
    });
  });
  
  it('calls registerUser API on submit with correct data (driver role)', async () => {
    (useLocalSearchParams as jest.Mock).mockReturnValue({ userType: 'driver' });
    const { getByPlaceholderText, getByText } = render(<SignUpScreen />);
    fireEvent.changeText(getByPlaceholderText('auth.enterUsername'), 'newdriver');
    fireEvent.changeText(getByPlaceholderText('auth.enterPassword'), 'driverpass');
    fireEvent.changeText(getByPlaceholderText('auth.enterConfirmPassword'), 'driverpass');
    
    mockRegisterUser.mockResolvedValueOnce({ msg: 'Driver registered successfully' });

    fireEvent.press(getByText('auth.signUpButton'));

    await waitFor(() => {
      expect(mockRegisterUser).toHaveBeenCalledWith('newdriver', 'driverpass', 'driver');
    });
  });

  it('on successful registration, shows alert and navigates to sign-in', async () => {
    mockRegisterUser.mockResolvedValueOnce({ msg: 'User registered successfully' });
    
    const { getByPlaceholderText, getByText } = render(<SignUpScreen />);
    fireEvent.changeText(getByPlaceholderText('auth.enterUsername'), 'newuser');
    fireEvent.changeText(getByPlaceholderText('auth.enterPassword'), 'newpass123');
    fireEvent.changeText(getByPlaceholderText('auth.enterConfirmPassword'), 'newpass123');
    fireEvent.press(getByText('auth.signUpButton'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'auth.registrationSuccessTitle', // title key
        'User registered successfully',    // message from API
        expect.any(Array) // buttons array
      );
    });

    // Simulate pressing "OK" on the Alert, which then navigates
    // The actual Alert.alert is mocked, so we need to manually trigger the onPress for the OK button.
    const alertArgs = (Alert.alert as jest.Mock).mock.calls[0];
    const okButton = alertArgs[2].find(button => button.text === 'common.ok');
    
    await act(async () => { // Wrap in act because it updates state (router)
        if (okButton && okButton.onPress) {
          okButton.onPress();
        }
      });

    expect(router.replace).toHaveBeenCalledWith('/onboarding/sign-in');
  });

  it('shows error message on failed registration (e.g., user exists)', async () => {
    mockRegisterUser.mockRejectedValueOnce({ 
      response: { data: { msg: 'User already exists' } } 
    });

    const { getByPlaceholderText, getByText, findByText } = render(<SignUpScreen />);
    fireEvent.changeText(getByPlaceholderText('auth.enterUsername'), 'existinguser');
    fireEvent.changeText(getByPlaceholderText('auth.enterPassword'), 'password');
    fireEvent.changeText(getByPlaceholderText('auth.enterConfirmPassword'), 'password');
    fireEvent.press(getByText('auth.signUpButton'));

    expect(await findByText('User already exists')).toBeTruthy();
  });

  it('navigates to sign-in screen when "Already have an account?" is pressed', () => {
    const { getByText } = render(<SignUpScreen />);
    fireEvent.press(getByText('auth.alreadyHaveAccount'));
    expect(router.replace).toHaveBeenCalledWith('/onboarding/sign-in');
  });
});
