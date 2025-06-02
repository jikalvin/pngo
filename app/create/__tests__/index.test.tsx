import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import CreatePackageScreen from '../index'; // Path to app/create/index.tsx
import { router } from 'expo-router'; // Mocked
import * as api from '@/utils/api'; // To mock its functions
import { Alert } from 'react-native';
import { AuthContext } from '@/context/AuthContext'; // Assuming path

jest.mock('@/utils/api', () => ({
  post: jest.fn(),
}));

jest.spyOn(Alert, 'alert');

// Mock useAuth to provide a default user (sender)
const mockUser = { id: 'sender123', role: 'user', /* other user props */ };

const renderScreenWithAuth = () => {
  return render(
    <AuthContext.Provider value={{ user: mockUser } as any}>
      <CreatePackageScreen />
    </AuthContext.Provider>
  );
};


describe('<CreatePackageScreen />', () => {
  const mockApiPost = api.post as jest.Mock;

  beforeEach(() => {
    mockApiPost.mockClear();
    (Alert.alert as jest.Mock).mockClear();
    router.replace.mockClear();
    router.back.mockClear();
  });

  it('renders all required input fields', () => {
    const { getByPlaceholderText, getByText } = renderScreenWithAuth();
    expect(getByPlaceholderText('e.g., Documents, Small Box')).toBeTruthy(); // Name
    expect(getByPlaceholderText('Package contents, special instructions...')).toBeTruthy(); // Description
    expect(getByPlaceholderText('Enter full pickup address')).toBeTruthy(); // Pickup Address
    expect(getByPlaceholderText('Enter full delivery address')).toBeTruthy(); // Delivery Address
    expect(getByPlaceholderText('e.g., 0.5')).toBeTruthy(); // Weight
    expect(getByPlaceholderText('e.g., 5.00')).toBeTruthy(); // Price
    expect(getByText('Create Package')).toBeTruthy();
  });

  it('allows typing in all fields', () => {
    const { getByPlaceholderText } = renderScreenWithAuth();
    
    fireEvent.changeText(getByPlaceholderText('e.g., Documents, Small Box'), 'My Important Package');
    fireEvent.changeText(getByPlaceholderText('Package contents, special instructions...'), 'Handle with care.');
    fireEvent.changeText(getByPlaceholderText('Enter full pickup address'), '123 Start Rd');
    fireEvent.changeText(getByPlaceholderText('Enter full delivery address'), '456 End St');
    fireEvent.changeText(getByPlaceholderText('e.g., 0.5'), '1.5');
    fireEvent.changeText(getByPlaceholderText('e.g., 5.00'), '12.99');

    expect(getByPlaceholderText('e.g., Documents, Small Box').props.value).toBe('My Important Package');
    expect(getByPlaceholderText('Package contents, special instructions...').props.value).toBe('Handle with care.');
    // ... and so on for other fields
  });

  it('shows alert if required fields (name, pickup, delivery) are missing on submit', () => {
    const { getByText } = renderScreenWithAuth();
    fireEvent.press(getByText('Create Package'));
    expect(Alert.alert).toHaveBeenCalledWith('Missing Information', 'Please fill in Package Name, Pickup Address, and Delivery Address.');
  });

  it('calls api.post with correct package data on successful submission', async () => {
    const { getByPlaceholderText, getByText } = renderScreenWithAuth();

    fireEvent.changeText(getByPlaceholderText('e.g., Documents, Small Box'), 'Test Package');
    fireEvent.changeText(getByPlaceholderText('Package contents, special instructions...'), 'Fragile');
    fireEvent.changeText(getByPlaceholderText('Enter full pickup address'), 'Pickup St');
    fireEvent.changeText(getByPlaceholderText('Enter full delivery address'), 'Delivery Ave');
    fireEvent.changeText(getByPlaceholderText('e.g., 0.5'), '2');
    fireEvent.changeText(getByPlaceholderText('e.g., 5.00'), '25');

    mockApiPost.mockResolvedValueOnce({ data: { name: 'Test Package', /* ...other data from backend... */ } });
    
    fireEvent.press(getByText('Create Package'));

    await waitFor(() => {
      expect(mockApiPost).toHaveBeenCalledWith('/packages', {
        name: 'Test Package',
        description: 'Fragile',
        pickupAddress: 'Pickup St',
        deliveryAddress: 'Delivery Ave',
        weight: 2.0,
        price: 25.0,
      });
    });
  });

  it('shows success alert and navigates on successful package creation', async () => {
    mockApiPost.mockResolvedValueOnce({ data: { name: 'Test Package' } });
    const { getByPlaceholderText, getByText } = renderScreenWithAuth();

    fireEvent.changeText(getByPlaceholderText('e.g., Documents, Small Box'), 'Test Package');
    fireEvent.changeText(getByPlaceholderText('Enter full pickup address'), 'Pickup St');
    fireEvent.changeText(getByPlaceholderText('Enter full delivery address'), 'Delivery Ave');
    fireEvent.press(getByText('Create Package'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith(
        'Package Created', 
        'Package "Test Package" has been successfully created.',
        expect.any(Array)
      );
    });
    
    // Simulate pressing "OK" on the Alert
    const alertArgs = (Alert.alert as jest.Mock).mock.calls[0];
    const okButton = alertArgs[2].find(button => button.text === 'OK');
    if (okButton && okButton.onPress) {
        await act(async () => okButton.onPress());
    }
    
    expect(router.replace).toHaveBeenCalledWith('/(tabs)/packages'); // Or your target route
  });

  it('clears form fields on successful submission', async () => {
    mockApiPost.mockResolvedValueOnce({ data: { name: 'Another Package' } });
    const { getByPlaceholderText, getByText } = renderScreenWithAuth();

    const nameInput = getByPlaceholderText('e.g., Documents, Small Box');
    // ... get other inputs

    fireEvent.changeText(nameInput, 'Temporary Name');
    fireEvent.changeText(getByPlaceholderText('Enter full pickup address'), 'Temp Pickup');
    fireEvent.changeText(getByPlaceholderText('Enter full delivery address'), 'Temp Delivery');
    // ... fill other inputs

    fireEvent.press(getByText('Create Package'));

    await waitFor(() => { // Wait for async operations like API call and state updates
        // Simulate pressing "OK" on the Alert as above
        const alertArgs = (Alert.alert as jest.Mock).mock.calls[0];
        const okButton = alertArgs[2].find(button => button.text === 'OK');
        if (okButton && okButton.onPress) {
            okButton.onPress(); // This should trigger form clearing
        }
    });
    
    // Check if inputs are cleared
    // Need to wait for the state updates from onPress to propagate
    await waitFor(() => {
        expect(nameInput.props.value).toBe('');
        // ... check other inputs are empty
        expect(getByPlaceholderText('Enter full pickup address').props.value).toBe('');

    });
  });


  it('shows error alert on failed package creation', async () => {
    mockApiPost.mockRejectedValueOnce({ response: { data: { msg: 'Creation failed due to server error' } } });
    const { getByPlaceholderText, getByText, findByText } = renderScreenWithAuth();

    fireEvent.changeText(getByPlaceholderText('e.g., Documents, Small Box'), 'Fail Package');
    fireEvent.changeText(getByPlaceholderText('Enter full pickup address'), 'Fail Pickup');
    fireEvent.changeText(getByPlaceholderText('Enter full delivery address'), 'Fail Delivery');
    fireEvent.press(getByText('Create Package'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith('Creation Failed', 'Creation failed due to server error');
    });
    // Check if error text is displayed in the component if that's implemented
    // For example: expect(await findByText('Creation failed due to server error')).toBeTruthy();
  });
  
  it('calls router.back() when cancel button is pressed', () => {
    const { getByText } = renderScreenWithAuth();
    fireEvent.press(getByText('Cancel'));
    expect(router.back).toHaveBeenCalled();
  });
});
