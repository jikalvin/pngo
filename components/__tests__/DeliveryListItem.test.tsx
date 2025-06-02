import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import DeliveryListItem, { DeliveryItemData } from '../DeliveryListItem'; // Adjust path
import { router } from 'expo-router'; // Mocked

const mockDelivery: DeliveryItemData = {
  _id: 'del123',
  package_id: {
    _id: 'pkg123',
    name: 'Urgent Documents',
    pickupAddress: '100 Main St, Cityville',
    deliveryAddress: '200 Dest Ave, Townburg',
    price: 15.00,
    owner: { username: 'sender1', name: 'Sender One' },
  },
  status: 'assigned',
  pickup_location: '100 Main St, Cityville', // Should match package_id.pickupAddress
  dropoff_location: '200 Dest Ave, Townburg', // Should match package_id.deliveryAddress
};

describe('<DeliveryListItem />', () => {
  const mockOnUpdateStatus = jest.fn(() => Promise.resolve());
  const mockSetTargetedDeliveryId = jest.fn();

  beforeEach(() => {
    mockOnUpdateStatus.mockClear();
    mockSetTargetedDeliveryId.mockClear();
    router.push.mockClear();
  });

  it('renders delivery data correctly', () => {
    const { getByText } = render(
      <DeliveryListItem 
        item={mockDelivery} 
        onUpdateStatus={mockOnUpdateStatus} 
        isActionLoading={false}
        setTargetedDeliveryId={mockSetTargetedDeliveryId}
      />
    );

    expect(getByText(mockDelivery.package_id.name)).toBeTruthy();
    expect(getByText(`Sender: ${mockDelivery.package_id.owner.name}`)).toBeTruthy();
    expect(getByText(mockDelivery.pickup_location)).toBeTruthy(); // Check if full address is rendered by parts
    expect(getByText(mockDelivery.dropoff_location)).toBeTruthy();
    expect(getByText(`$${mockDelivery.package_id.price.toFixed(2)}`)).toBeTruthy();
    // StatusBadge is a separate component, its rendering is tested elsewhere,
    // but we can check if it's passed the correct status
    // (difficult to assert directly without querying StatusBadge internals or testID)
  });

  it('navigates to package details on press', () => {
    const { getByText } = render(
      <DeliveryListItem 
        item={mockDelivery} 
        onUpdateStatus={mockOnUpdateStatus} 
        isActionLoading={false}
        setTargetedDeliveryId={mockSetTargetedDeliveryId}
      />
    );
    fireEvent.press(getByText(mockDelivery.package_id.name));
    expect(router.push).toHaveBeenCalledWith(`/package/${mockDelivery.package_id._id}`);
  });

  describe('Status Update Buttons', () => {
    it('shows "Picked Up" button when status is "assigned"', () => {
      const { getByText } = render(
        <DeliveryListItem 
          item={{ ...mockDelivery, status: 'assigned' }} 
          onUpdateStatus={mockOnUpdateStatus}
          isActionLoading={false}
          setTargetedDeliveryId={mockSetTargetedDeliveryId}
        />
      );
      expect(getByText('Picked Up (In Transit)')).toBeTruthy();
    });

    it('calls onUpdateStatus with "in-transit" when "Picked Up" is pressed', () => {
      const { getByText } = render(
        <DeliveryListItem 
          item={{ ...mockDelivery, status: 'assigned' }} 
          onUpdateStatus={mockOnUpdateStatus}
          isActionLoading={false}
          setTargetedDeliveryId={mockSetTargetedDeliveryId}
        />
      );
      fireEvent.press(getByText('Picked Up (In Transit)'));
      expect(mockSetTargetedDeliveryId).toHaveBeenCalledWith(mockDelivery._id);
      expect(mockOnUpdateStatus).toHaveBeenCalledWith(mockDelivery._id, 'in-transit');
    });

    it('shows "Delivered" button when status is "in-transit"', () => {
      const { getByText } = render(
        <DeliveryListItem 
          item={{ ...mockDelivery, status: 'in-transit' }} 
          onUpdateStatus={mockOnUpdateStatus}
          isActionLoading={false}
          setTargetedDeliveryId={mockSetTargetedDeliveryId}
        />
      );
      expect(getByText('Delivered')).toBeTruthy();
    });

    it('calls onUpdateStatus with "delivered" when "Delivered" is pressed', () => {
      const { getByText } = render(
        <DeliveryListItem 
          item={{ ...mockDelivery, status: 'in-transit' }} 
          onUpdateStatus={mockOnUpdateStatus}
          isActionLoading={false}
          setTargetedDeliveryId={mockSetTargetedDeliveryId}
        />
      );
      fireEvent.press(getByText('Delivered'));
      expect(mockSetTargetedDeliveryId).toHaveBeenCalledWith(mockDelivery._id);
      expect(mockOnUpdateStatus).toHaveBeenCalledWith(mockDelivery._id, 'delivered');
    });

    it('shows "Failed" button when status is "assigned" or "in-transit"', () => {
      const { getByText, rerender } = render(
        <DeliveryListItem 
          item={{ ...mockDelivery, status: 'assigned' }} 
          onUpdateStatus={mockOnUpdateStatus}
          isActionLoading={false}
          setTargetedDeliveryId={mockSetTargetedDeliveryId}
        />
      );
      expect(getByText('Failed')).toBeTruthy();

      rerender(
        <DeliveryListItem 
          item={{ ...mockDelivery, status: 'in-transit' }} 
          onUpdateStatus={mockOnUpdateStatus}
          isActionLoading={false}
          setTargetedDeliveryId={mockSetTargetedDeliveryId}
        />
      );
      expect(getByText('Failed')).toBeTruthy();
    });

    it('calls onUpdateStatus with "failed" when "Failed" is pressed', () => {
        const { getByText } = render(
          <DeliveryListItem 
            item={{ ...mockDelivery, status: 'assigned' }} 
            onUpdateStatus={mockOnUpdateStatus}
            isActionLoading={false}
            setTargetedDeliveryId={mockSetTargetedDeliveryId}
          />
        );
        fireEvent.press(getByText('Failed'));
        expect(mockSetTargetedDeliveryId).toHaveBeenCalledWith(mockDelivery._id);
        expect(mockOnUpdateStatus).toHaveBeenCalledWith(mockDelivery._id, 'failed');
      });

    it('does not show action buttons if status is "delivered" or "failed"', () => {
      const { queryByText, rerender } = render(
        <DeliveryListItem 
          item={{ ...mockDelivery, status: 'delivered' }} 
          onUpdateStatus={mockOnUpdateStatus}
          isActionLoading={false}
          setTargetedDeliveryId={mockSetTargetedDeliveryId}
        />
      );
      expect(queryByText('Picked Up (In Transit)')).toBeNull();
      expect(queryByText('Delivered')).toBeNull();
      expect(queryByText('Failed')).toBeNull();

      rerender(
        <DeliveryListItem 
          item={{ ...mockDelivery, status: 'failed' }} 
          onUpdateStatus={mockOnUpdateStatus}
          isActionLoading={false}
          setTargetedDeliveryId={mockSetTargetedDeliveryId}
        />
      );
      expect(queryByText('Picked Up (In Transit)')).toBeNull();
      expect(queryByText('Delivered')).toBeNull();
      expect(queryByText('Failed')).toBeNull();
    });

    it('disables buttons when isActionLoading is true for this item', () => {
        const { getByText } = render(
          <DeliveryListItem 
            item={{ ...mockDelivery, status: 'assigned' }} 
            onUpdateStatus={mockOnUpdateStatus}
            isActionLoading={true} // Global action loading, but component checks targetedDeliveryId
            setTargetedDeliveryId={mockSetTargetedDeliveryId}
          />
        );
        // To truly test disabled state, the isActionLoading would need to be specific to this item
        // The component's internal logic for disabling is onPress={() => handleUpdateStatus('in-transit')} disabled={isActionLoading}
        // For this test, assume isActionLoading from props disables it.
        // Note: @testing-library/react-native doesn't directly support `toBeDisabled` for all custom component setups.
        // We check if onPress is NOT called when "disabled".
        // This requires the component to actually pass the disabled prop to the Pressable.
        // The current DeliveryListItem disables Pressable via its onPress prop not firing if isActionLoading is true.
        // A better way is to check if the button is visually styled as disabled or if its onPress is not called.
        
        // This test is more about if the prop is passed, actual disablement depends on Pressable implementation.
        // Let's simulate a press and ensure onUpdateStatus is NOT called if isActionLoading is true.
        mockOnUpdateStatus.mockClear();
        fireEvent.press(getByText('Picked Up (In Transit)'));
        // If the button is truly disabled by the `disabled` prop on `Pressable`,
        // the `onPress` handler (`handleUpdateStatus`) should not be invoked.
        // The current implementation of DeliveryListItem uses `disabled={isActionLoading}` on Pressable.
        expect(mockOnUpdateStatus).not.toHaveBeenCalled();

      });
  });
});
