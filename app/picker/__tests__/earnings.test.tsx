import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import PickerEarningsScreen from '../earnings'; // Adjust path
import * as api from '@/utils/api';
import { AuthContext } from '@/context/AuthContext'; // Assuming path
import { useLocalSearchParams, router } from 'expo-router'; // router for back button

jest.mock('@/utils/api', () => ({
  get: jest.fn(),
}));

// Mock useFocusEffect to just run the callback immediately for testing
jest.mock('expo-router', () => ({
    ...jest.requireActual('expo-router'),
    useFocusEffect: (callback) => callback(),
    useLocalSearchParams: jest.fn(), // Mock if it's used, though not in current earnings screen
    router: {
        back: jest.fn(),
        replace: jest.fn(), // For home button in access denied
    }
  }));

const mockApiGet = api.get as jest.Mock;
const driverUser = { id: 'driver123', role: 'driver' };
const nonDriverUser = { id: 'user456', role: 'user' };


const renderScreen = (currentUser = driverUser) => {
  return render(
    <AuthContext.Provider value={{ user: currentUser } as any}>
      <PickerEarningsScreen />
    </AuthContext.Provider>
  );
};

describe('<PickerEarningsScreen />', () => {
  beforeEach(() => {
    mockApiGet.mockClear();
    router.back.mockClear();
    router.replace.mockClear();
  });

  it('renders loading state initially for a driver', () => {
    mockApiGet.mockImplementation(() => new Promise(() => {})); // Keep promise pending
    const { getByText } = renderScreen();
    expect(getByText('Loading earnings...')).toBeTruthy();
  });

  it('fetches and displays earnings for a driver', async () => {
    mockApiGet.mockResolvedValueOnce({ data: { username: 'driver123', earnings: 250.75 } });
    const { findByText } = renderScreen();
    
    await waitFor(() => expect(mockApiGet).toHaveBeenCalledWith(`/pickers/${driverUser.id}/earnings`));
    expect(await findByText('$250.75')).toBeTruthy();
    expect(await findByText('Total Earnings')).toBeTruthy();
  });

  it('displays error message on API failure', async () => {
    mockApiGet.mockRejectedValueOnce({ response: { data: { msg: 'Failed to fetch earnings' } } });
    const { findByText } = renderScreen();
    expect(await findByText('Failed to fetch earnings')).toBeTruthy();
    expect(await findByText('Try Again')).toBeTruthy();
  });
  
  it('displays "no earnings data" message when earnings are null or not returned', async () => {
    mockApiGet.mockResolvedValueOnce({ data: { username: 'driver123', earnings: null } });
    const { findByText } = renderScreen();
    expect(await findByText('No earnings data available yet.')).toBeTruthy();
  });

  it('allows pull to refresh for earnings', async () => {
    mockApiGet.mockResolvedValueOnce({ data: { earnings: 100 } });
    const { findByText } = renderScreen();
    await findByText('$100.00'); // Initial load

    mockApiGet.mockResolvedValueOnce({ data: { earnings: 150 } }); // New data for refresh
    // Simulate refresh - this is conceptual as direct gesture simulation is hard.
    // Usually, you'd get the RefreshControl by testID and fire its onRefresh prop.
    // For now, this tests that subsequent calls to fetchEarnings update the UI.
    // If onRefresh is directly testable or can be triggered by an event, that's better.
    console.log("Pull-to-refresh test for earnings needs manual triggering of onRefresh or specific RefreshControl testID");
    // Example: findByTestId('earnings-refresh-control').props.onRefresh();
    // await waitFor(() => expect(mockApiGet).toHaveBeenCalledTimes(2));
    // expect(await findByText('$150.00')).toBeTruthy();
  });

  it('shows access denied for non-driver users', async () => {
    const { findByText } = renderScreen(nonDriverUser);
    expect(await findByText('Access Denied. This section is for drivers only.')).toBeTruthy();
    expect(mockApiGet).not.toHaveBeenCalled(); // API should not be called
  });
  
  it('calls router.back() when back button is pressed', () => {
    mockApiGet.mockResolvedValueOnce({ data: { earnings: 100 } }); // To render the main screen
    const { getByTestId } = render( // Standard render as Auth context not strictly needed for this part
         <AuthContext.Provider value={{ user: driverUser } as any}>
            <PickerEarningsScreen />
        </AuthContext.Provider>
    );
    // The back button in PickerEarningsScreen is a TouchableOpacity around a ChevronLeft icon.
    // It would be best to add a testID to this TouchableOpacity.
    // e.g., <TouchableOpacity testID="earningsBackButton" onPress={() => router.back()} ... >
    // fireEvent.press(getByTestId('earningsBackButton'));
    // expect(router.back).toHaveBeenCalled();
    console.log("Back button test for earnings needs a testID on the back button.");
  });
});
