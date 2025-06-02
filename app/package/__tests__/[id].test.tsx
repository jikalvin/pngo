import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import PackageDetailsScreen from '../[id]'; // Adjust if your path is different
import { useLocalSearchParams, router } from 'expo-router'; // Mocked in jest.setup.js
import * as api from '@/utils/api';
import { Alert } from 'react-native';
import { AuthContext } from '@/context/AuthContext'; // Assuming path

jest.mock('@/utils/api', () => ({
  get: jest.fn(),
  put: jest.fn(),
}));

jest.spyOn(Alert, 'alert');

const mockPackageDetail = {
  id: 'test-id', // Matches default mock from useLocalSearchParams
  _id: 'test-id', // For consistency if API returns _id
  name: 'Detailed Test Package',
  description: 'A very detailed description.',
  pickupAddress: '123 Test St, Detail City',
  deliveryAddress: '456 Test Ave, Detail Town',
  price: 50.00,
  status: 'pending', // Initial status for testing accept/reject
  owner: { id: 'sender123', username: 'packageowner', name: 'Package Owner' },
  createdAt: new Date().toISOString(),
};

const mockApiGet = api.get as jest.Mock;
const mockApiPut = api.put as jest.Mock;

const renderScreenWithAuth = (currentUser = { id: 'someuser', role: 'user' }) => {
  // Mock useLocalSearchParams for this test suite if needed, or rely on global mock
  (useLocalSearchParams as jest.Mock).mockReturnValue({ id: 'test-id' });

  return render(
    <AuthContext.Provider value={{ user: currentUser } as any}>
      <PackageDetailsScreen />
    </AuthContext.Provider>
  );
};

describe('<PackageDetailsScreen />', () => {
  beforeEach(() => {
    mockApiGet.mockClear();
    mockApiPut.mockClear();
    (Alert.alert as jest.Mock).mockClear();
    router.back.mockClear();
    router.push.mockClear();
  });

  it('renders loading state initially', () => {
    mockApiGet.mockImplementation(() => new Promise(() => {})); // Keep promise pending
    const { getByText } = renderScreenWithAuth();
    expect(getByText('Loading Package...')).toBeTruthy();
  });

  it('fetches and displays package details correctly for a sender', async () => {
    mockApiGet.mockResolvedValueOnce({ data: { ...mockPackageDetail, owner: {id: 'sender123'} } }); // Ensure owner ID matches
    const { findByText, getByText } = renderScreenWithAuth({ id: 'sender123', role: 'user' });

    await waitFor(() => expect(mockApiGet).toHaveBeenCalledWith('/packages/test-id'));
    
    expect(await findByText('Detailed Test Package')).toBeTruthy();
    expect(getByText('A very detailed description.')).toBeTruthy();
    expect(getByText('123 Test St, Detail City')).toBeTruthy(); // Value of pickupAddress
    expect(getByText('456 Test Ave, Detail Town')).toBeTruthy(); // Value of deliveryAddress
    expect(getByText('$50.00')).toBeTruthy();
    expect(getByText('This is your package. Status: pending.')).toBeTruthy();
  });

  it('displays error message on API failure', async () => {
    mockApiGet.mockRejectedValueOnce({ response: { data: { msg: 'Package fetch failed' } } });
    const { findByText } = renderScreenWithAuth();
    expect(await findByText('Package fetch failed')).toBeTruthy();
    expect(await findByText('Try Again')).toBeTruthy();
  });
  
  describe('Picker/Driver Actions', () => {
    const driverUser = { id: 'driver123', role: 'driver' };

    it('shows Accept/Reject buttons for a driver if package is pending', async () => {
      mockApiGet.mockResolvedValueOnce({ data: { ...mockPackageDetail, status: 'pending' } });
      const { findByText } = renderScreenWithAuth(driverUser);
      expect(await findByText('Accept Package')).toBeTruthy();
      expect(await findByText('Reject Package')).toBeTruthy();
    });

    it('calls accept API when Accept button is pressed and updates UI', async () => {
      mockApiGet.mockResolvedValueOnce({ data: { ...mockPackageDetail, status: 'pending' } });
      // Mock PUT response for accept - it returns { msg, delivery, package (updated) }
      const updatedPackageAfterAccept = { ...mockPackageDetail, status: 'accepted' };
      mockApiPut.mockResolvedValueOnce({ data: { package: updatedPackageAfterAccept, delivery: { driver_id: driverUser.id } } });
      
      const { findByText, getByText } = renderScreenWithAuth(driverUser);
      const acceptButton = await findByText('Accept Package');
      fireEvent.press(acceptButton);

      await waitFor(() => expect(mockApiPut).toHaveBeenCalledWith('/packages/test-id/accept', {}));
      expect(Alert.alert).toHaveBeenCalledWith("Package Accepted", "You have accepted this package for delivery.");
      // Check if status badge updated (or text reflecting accepted state)
      // This requires StatusBadge to re-render with new prop, or text to change
      expect(getByText('You have accepted this package. Manage in your active deliveries.')).toBeTruthy();
    });

    it('calls reject API when Reject button is pressed and navigates back', async () => {
      mockApiGet.mockResolvedValueOnce({ data: { ...mockPackageDetail, status: 'pending' } });
      mockApiPut.mockResolvedValueOnce({}); // Reject API might not return content

      const { findByText } = renderScreenWithAuth(driverUser);
      const rejectButton = await findByText('Reject Package');
      fireEvent.press(rejectButton);

      await waitFor(() => expect(mockApiPut).toHaveBeenCalledWith('/packages/test-id/reject'));
      expect(Alert.alert).toHaveBeenCalledWith(
        "Package Rejected", 
        "You have chosen not to deliver this package.",
        expect.arrayContaining([expect.objectContaining({onPress: expect.any(Function)})])
      );
      
      // Simulate pressing "OK" on the Alert, which then navigates
        const alertArgs = (Alert.alert as jest.Mock).mock.calls[0];
        const okButton = alertArgs[2].find(button => button.text === 'OK');
        if (okButton && okButton.onPress) {
           act(()=> okButton.onPress());
        }
      expect(router.back).toHaveBeenCalled();
    });

    it('does not show Accept/Reject buttons if package is not pending', async () => {
      mockApiGet.mockResolvedValueOnce({ data: { ...mockPackageDetail, status: 'accepted' } });
      const { queryByText } = renderScreenWithAuth(driverUser);
      await waitFor(() => expect(mockApiGet).toHaveBeenCalled()); // Ensure data is loaded
      expect(queryByText('Accept Package')).toBeNull();
      expect(queryByText('Reject Package')).toBeNull();
    });
  });
});
