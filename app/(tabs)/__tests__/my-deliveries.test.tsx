import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import MyDeliveriesScreen from '../my-deliveries'; // Adjust path
import * as api from '@/utils/api';
import { AuthContext } from '@/context/AuthContext'; // Assuming path
import { Alert } from 'react-native';

jest.mock('@/utils/api', () => ({
  get: jest.fn(),
  put: jest.fn(),
}));

// Mock useFocusEffect to just run the callback immediately for testing
jest.mock('expo-router', () => ({
    ...jest.requireActual('expo-router'),
    useFocusEffect: (callback) => callback(),
    router: { // Mock router object if used by the screen
        push: jest.fn(),
        replace: jest.fn(),
    }
}));

jest.spyOn(Alert, 'alert');

const mockDeliveries = [
  { 
    _id: 'del1', 
    package_id: { _id: 'pkg1', name: 'Delivery Alpha', pickupAddress: 'Addr A1', deliveryAddress: 'Addr A2', price: 20, owner: {username: 's1'} }, 
    status: 'assigned', 
    pickup_location: 'Addr A1', 
    dropoff_location: 'Addr A2' 
  },
  { 
    _id: 'del2', 
    package_id: { _id: 'pkg2', name: 'Delivery Beta', pickupAddress: 'Addr B1', deliveryAddress: 'Addr B2', price: 25, owner: {username: 's2'} }, 
    status: 'in-transit', 
    pickup_location: 'Addr B1', 
    dropoff_location: 'Addr B2' 
  },
];

const mockApiGet = api.get as jest.Mock;
const mockApiPut = api.put as jest.Mock;

const renderScreen = (userRole = 'driver') => {
  return render(
    <AuthContext.Provider value={{ user: { id: 'driverUser1', role: userRole } } as any}>
      <MyDeliveriesScreen />
    </AuthContext.Provider>
  );
};

describe('<MyDeliveriesScreen />', () => {
  beforeEach(() => {
    mockApiGet.mockClear();
    mockApiPut.mockClear();
    (Alert.alert as jest.Mock).mockClear();
  });

  it('renders loading state initially for driver', () => {
    mockApiGet.mockImplementation(() => new Promise(() => {})); // Keep promise pending
    const { getByText } = renderScreen();
    expect(getByText('Loading active deliveries...')).toBeTruthy();
  });

  it('fetches and displays active deliveries for a driver', async () => {
    mockApiGet.mockResolvedValueOnce({ data: mockDeliveries });
    const { findByText } = renderScreen();
    
    await waitFor(() => expect(mockApiGet).toHaveBeenCalledWith('/deliveries/active'));
    expect(await findByText('Delivery Alpha')).toBeTruthy();
    expect(await findByText('Delivery Beta')).toBeTruthy();
  });

  it('displays error message on API failure', async () => {
    mockApiGet.mockRejectedValueOnce({ response: { data: { msg: 'Fetch deliveries failed' } } });
    const { findByText } = renderScreen();
    expect(await findByText('Fetch deliveries failed')).toBeTruthy();
    expect(await findByText('Try Again')).toBeTruthy();
  });

  it('displays "no active deliveries" message when list is empty', async () => {
    mockApiGet.mockResolvedValueOnce({ data: [] });
    const { findByText } = renderScreen();
    expect(await findByText('No active deliveries at the moment.')).toBeTruthy();
  });

  it('calls status update API when "Picked Up (In Transit)" is pressed', async () => {
    mockApiGet.mockResolvedValueOnce({ data: [mockDeliveries[0]] }); // Only the 'assigned' one
    mockApiPut.mockResolvedValueOnce({}); // Mock successful PUT
    
    const { findByText, getByText } = renderScreen();
    await findByText('Delivery Alpha'); // Ensure item is rendered

    fireEvent.press(getByText('Picked Up (In Transit)'));

    await waitFor(() => {
      expect(mockApiPut).toHaveBeenCalledWith('/deliveries/del1/status', { status: 'in-transit' });
    });
    // Expect list to refresh (fetchActiveDeliveries called again)
    await waitFor(() => expect(mockApiGet).toHaveBeenCalledTimes(2)); 
  });
  
  it('calls status update API when "Delivered" is pressed', async () => {
    mockApiGet.mockResolvedValueOnce({ data: [mockDeliveries[1]] }); // Only the 'in-transit' one
    mockApiPut.mockResolvedValueOnce({});
    
    const { findByText, getByText } = renderScreen();
    await findByText('Delivery Beta');

    fireEvent.press(getByText('Delivered'));

    await waitFor(() => {
      expect(mockApiPut).toHaveBeenCalledWith('/deliveries/del2/status', { status: 'delivered' });
    });
    await waitFor(() => expect(mockApiGet).toHaveBeenCalledTimes(2));
  });
  
  it('shows an alert if status update fails', async () => {
    mockApiGet.mockResolvedValueOnce({ data: [mockDeliveries[0]] });
    mockApiPut.mockRejectedValueOnce({ response: { data: { msg: 'Update error' } } });
    
    const { findByText, getByText } = renderScreen();
    await findByText('Delivery Alpha');

    fireEvent.press(getByText('Picked Up (In Transit)'));

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalledWith("Update Failed", "Update error");
    });
  });

  it('shows access denied for non-driver users', async () => {
    const { findByText } = renderScreen('user');
    expect(await findByText('Access Denied. This section is for drivers only.')).toBeTruthy();
  });
});
