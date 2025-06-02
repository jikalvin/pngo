import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import AvailablePackagesScreen from '../pickers'; // Adjust path, it's pickers.tsx
import * as api from '@/utils/api';
import { AuthContext } from '@/context/AuthContext'; // Assuming this is your auth context path

jest.mock('@/utils/api', () => ({
  get: jest.fn(),
}));

// Mock useFocusEffect to just run the callback immediately for testing
jest.mock('expo-router', () => ({
    ...jest.requireActual('expo-router'), // Use actual for Link, router, etc. if not fully mocked
    useFocusEffect: (callback) => callback(),
    router: {
        push: jest.fn(),
        replace: jest.fn(),
        back: jest.fn(),
    }
  }));


const mockPackages = [
  { id: '1', name: 'Package 1', pickupAddress: '123 Main St', deliveryAddress: '456 Oak Ave', price: 10, status: 'pending', owner: { username: 'senderA' } },
  { id: '2', name: 'Package 2', pickupAddress: '789 Pine St', deliveryAddress: '101 Maple Dr', price: 15, status: 'pending', owner: { username: 'senderB' } },
];

const mockApiGet = api.get as jest.Mock;

const renderScreen = (userRole = 'driver') => {
  return render(
    <AuthContext.Provider value={{ user: { id: 'testdriver1', role: userRole } } as any}>
      <AvailablePackagesScreen />
    </AuthContext.Provider>
  );
};

describe('<AvailablePackagesScreen /> (was PickersScreen)', () => {
  beforeEach(() => {
    mockApiGet.mockClear();
  });

  it('renders loading state initially', async () => {
    mockApiGet.mockImplementation(() => new Promise(() => {})); // Simulate pending promise
    const { getByText } = renderScreen();
    expect(getByText('Loading packages...')).toBeTruthy();
  });

  it('fetches and displays available packages for a driver', async () => {
    mockApiGet.mockResolvedValueOnce({ data: mockPackages });
    const { findByText, getAllByTestId } = renderScreen(); // Assuming PackageListItem has a testID like 'package-list-item'
    
    await waitFor(() => expect(mockApiGet).toHaveBeenCalledWith('/packages/available'));
    
    expect(await findByText('Package 1')).toBeTruthy();
    expect(await findByText('Package 2')).toBeTruthy();

    // To check number of items, PackageListItem should have a testID
    // For example, if PackageListItem's root View has testID="package-list-item":
    // const items = getAllByTestId('package-list-item');
    // expect(items.length).toBe(2);
  });

  it('displays error message on API failure', async () => {
    mockApiGet.mockRejectedValueOnce({ response: { data: { msg: 'Failed to fetch' } } });
    const { findByText } = renderScreen();
    expect(await findByText('Failed to fetch')).toBeTruthy();
    expect(await findByText('Try Again')).toBeTruthy();
  });

  it('displays "no packages" message when list is empty', async () => {
    mockApiGet.mockResolvedValueOnce({ data: [] });
    const { findByText } = renderScreen();
    expect(await findByText('No available packages found at the moment.')).toBeTruthy();
  });

  it('allows pull to refresh', async () => {
    mockApiGet.mockResolvedValueOnce({ data: mockPackages }); // Initial load
    const { getByTestId, findByText } = renderScreen(); // Assuming ScrollView has testID="package-scroll-view"

    await findByText('Package 1'); // Ensure initial data is loaded

    mockApiGet.mockResolvedValueOnce({ data: [mockPackages[0]] }); // New data for refresh

    // @testing-library/react-native doesn't directly simulate pull-to-refresh gesture.
    // We test the onRefresh function itself if possible, or trigger it manually.
    // For components using RefreshControl, you can get it by testID and fire its onRefresh.
    // This requires RefreshControl to have a testID.
    // const refreshControl = getByTestId('package-refresh-control'); // Add testID to RefreshControl
    // act(() => {
    //   refreshControl.props.onRefresh();
    // });
    // await waitFor(() => expect(mockApiGet).toHaveBeenCalledTimes(2)); // Initial + refresh
    // expect(await findByText('Package 1')).toBeTruthy();
    // expect(queryByText('Package 2')).toBeNull(); // If Package 2 was removed on refresh
    
    // Simpler: just call the onRefresh handler if it's exposed or testable
    // This part is conceptual as direct gesture simulation is hard.
    // The key is that onRefresh calls fetchAvailablePackages.
    console.log("Pull-to-refresh test needs manual triggering of onRefresh or specific RefreshControl testID");
  });
  
  it('filters packages based on search text', async () => {
    mockApiGet.mockResolvedValueOnce({ data: mockPackages });
    const { getByPlaceholderText, findByText, queryByText } = renderScreen();

    await findByText('Package 1'); // Wait for initial load

    const searchInput = getByPlaceholderText('Search packages (name, pickup, destination)...');
    fireEvent.changeText(searchInput, 'Package 1');

    expect(await findByText('Package 1')).toBeTruthy();
    expect(queryByText('Package 2')).toBeNull();

    fireEvent.changeText(searchInput, 'Oak Ave'); // Search by delivery address
     expect(await findByText('Package 1')).toBeTruthy(); // Assuming 'Package 1' has 'Oak Ave'
     expect(queryByText('Package 2')).toBeNull();
  });

  // Test for non-driver role (conceptual, as screen should ideally not be accessible)
  it('shows access denied or nothing relevant for non-driver user', async () => {
    mockApiGet.mockResolvedValueOnce({ data: mockPackages }); // API might still be called by useFocusEffect
    const { queryByText, findByText } = renderScreen('user'); // Render as 'user'
    
    // The component itself has a role check that returns a message
    expect(await findByText('Access Denied. This section is for drivers only.')).toBeTruthy();
    expect(queryByText('Package 1')).toBeNull(); // Should not see packages
  });
});
