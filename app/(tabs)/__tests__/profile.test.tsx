import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import ProfileScreen from '../profile'; // Adjust path
import * as api from '@/utils/api';
import { AuthContext } from '@/context/AuthContext'; // Assuming path
import { Alert } from 'react-native';

jest.mock('@/utils/api', () => ({
  put: jest.fn(),
}));

jest.spyOn(Alert, 'alert');

// Mock expo-router as it's used for navigation items in profile
jest.mock('expo-router', () => ({
    ...jest.requireActual('expo-router'),
    router: {
        push: jest.fn(),
    }
}));


const mockApiPut = api.put as jest.Mock;

const driverUser = { 
  id: 'driver123', 
  role: 'driver', 
  username: 'TestDriver', 
  availability: true, 
  // other fields AuthContext might provide
};

const nonDriverUser = { 
  id: 'user456', 
  role: 'user', 
  username: 'TestUser',
  // other fields
};

// A mock for the updateUserInContext function if your AuthContext exposes one
const mockUpdateUserInContext = jest.fn();

const renderScreen = (currentUser = driverUser) => {
  return render(
    <AuthContext.Provider value={{ user: currentUser, login: mockUpdateUserInContext } as any}>
      <ProfileScreen />
    </AuthContext.Provider>
  );
};

describe('<ProfileScreen /> - Availability Toggle', () => {
  beforeEach(() => {
    mockApiPut.mockClear();
    (Alert.alert as jest.Mock).mockClear();
    mockUpdateUserInContext.mockClear();
  });

  it('renders user information (name/username)', () => {
    const { getByText } = renderScreen();
    expect(getByText(driverUser.username)).toBeTruthy(); 
  });

  it('shows Availability toggle for driver user', () => {
    const { getByText,UNSAFE_getByProps } = renderScreen(); // UNSAFE_getByProps for Switch
    expect(getByText('Availability')).toBeTruthy();
    // Find Switch by its current value or accessibility role if possible
    // This is a bit brittle; ideally, the Switch or its container MenuItem would have a testID.
    const availabilitySwitch = UNSAFE_getByProps({ value: driverUser.availability });
    expect(availabilitySwitch).toBeTruthy();
  });

  it('does not show Availability toggle for non-driver user', () => {
    const { queryByText, UNSAFE_queryByProps } = renderScreen(nonDriverUser);
    expect(queryByText('Availability')).toBeNull();
    // Check that no Switch is rendered (or specifically the one for availability)
    // This relies on the MenuItem for Availability not being rendered, or if rendered, not having a Switch
    const availabilitySwitch = UNSAFE_queryByProps({ accessibilityRole: 'switch' }); // General switch
    // If there are other switches, this test needs to be more specific.
    // Assuming the Availability MenuItem (and thus its switch) is conditionally rendered based on role.
    expect(availabilitySwitch).toBeNull(); // Or check for specific switch if possible
  });

  it('toggles availability and calls API when Switch is changed by a driver', async () => {
    mockApiPut.mockResolvedValueOnce({}); // Simulate successful API call
    const { UNSAFE_getByProps } = renderScreen(driverUser); // Initial availability is true
    
    const availabilitySwitch = UNSAFE_getByProps({ value: true });
    
    // fireEvent.valueChange(availabilitySwitch, false); // Correct way to change Switch value

    // Simulate the onValueChange by directly calling the prop if fireEvent.valueChange has issues
    // This happens because the Switch is within a MenuItem which might intercept raw events
    // Or the onToggle prop of MenuItem is what we should effectively "trigger"
    // In ProfileScreen, MenuItem has onToggle={handleAvailabilityToggle}
    // For this test, let's assume the Switch itself can be targeted for valueChange
    await act(async () => {
        // The Switch component in react-native-testing-library might require `fireEvent` on the element directly
        // or using the `onValueChange` prop. Let's try to find the prop.
        // This is highly dependent on how MenuItem passes props to the Switch.
        // The MenuItem component in profile.tsx passes onToggle to the Switch's onValueChange.
        availabilitySwitch.props.onValueChange(false);
      });

    await waitFor(() => {
      expect(mockApiPut).toHaveBeenCalledWith('/pickers/availability', { availability: false });
    });
    expect(Alert.alert).toHaveBeenCalledWith("Availability Updated", "You are now unavailable for deliveries.");
    // Optionally check if mockUpdateUserInContext was called if implemented for optimistic updates
  });

  it('reverts Switch and shows error on API failure during toggle', async () => {
    mockApiPut.mockRejectedValueOnce(new Error('API Error'));
    const { UNSAFE_getByProps, findByText } = renderScreen(driverUser); // Initial availability is true
    
    const availabilitySwitch = UNSAFE_getByProps({ value: true });
    
    await act(async () => {
        availabilitySwitch.props.onValueChange(false); // Attempt to set to false
    });

    await waitFor(() => {
      expect(mockApiPut).toHaveBeenCalledWith('/pickers/availability', { availability: false });
    });
    expect(Alert.alert).toHaveBeenCalledWith("Update Failed", "Could not update your availability. Please try again.");
    
    // Check if switch reverted to its original state (true)
    // This requires the component's state `isAvailable` to be updated by the test renderer
    // after the error and rerender.
    // We can check the prop again after waiting for the error handling logic.
    await findByText("You are currently available"); // Description text should revert
    const switchAfterError = UNSAFE_getByProps({ value: true }); // Check if it's back to true
    expect(switchAfterError).toBeTruthy();
  });

  // Test for "My Earnings" and "My Active Deliveries" menu items for driver
  it('shows "My Earnings" and "My Active Deliveries" for driver', () => {
    const { getByText } = renderScreen(driverUser);
    expect(getByText("My Earnings")).toBeTruthy();
    expect(getByText("My Active Deliveries")).toBeTruthy();
  });

  it('does not show "My Earnings" and "My Active Deliveries" for non-driver', () => {
    const { queryByText } = renderScreen(nonDriverUser);
    expect(queryByText("My Earnings")).toBeNull();
    expect(queryByText("My Active Deliveries")).toBeNull();
  });
});
