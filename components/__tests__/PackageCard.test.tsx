import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import PackageCard from '../PackageCard'; // Adjust path
import { PackageItemProps } from '../PackageListItem'; // Reuse this type
// Router mock is global from jest.setup.js

const mockPackageCardItem: PackageItemProps = {
  id: 'cardPkg1',
  name: 'Documents for Review',
  status: 'accepted',
  pickupAddress: '77 University Ave, Waterloo',
  deliveryAddress: '88 Innovation Dr, Kitchener',
  price: 10.00,
  owner: { username: 'client1', name: 'Client A' },
  // description is optional in PackageItemProps
};

describe('<PackageCard />', () => {
  const mockOnPress = jest.fn();

  beforeEach(() => {
    mockOnPress.mockClear();
  });

  it('renders package card data correctly', () => {
    const { getByText, queryByText } = render(
      <PackageCard item={mockPackageCardItem} onPress={mockOnPress} />
    );

    expect(getByText(mockPackageCardItem.name)).toBeTruthy();
    // StatusBadge is a sub-component, assume it gets the status prop correctly
    expect(getByText(`From: ${mockPackageCardItem.pickupAddress}`)).toBeTruthy();
    expect(getByText(`To: ${mockPackageCardItem.deliveryAddress}`)).toBeTruthy();
    
    // Test price rendering
    expect(getByText(`$${mockPackageCardItem.price.toFixed(2)}`)).toBeTruthy();
    
    // Test that created date is not rendered if not provided (as per current PackageCard logic)
    // If 'createdAt' were part of PackageItemProps and displayed, this test would change.
    expect(queryByText(/Created:/i)).toBeNull(); 
  });

  it('calls onPress when the card is pressed', () => {
    const { getByText } = render(
      <PackageCard item={mockPackageCardItem} onPress={mockOnPress} />
    );

    fireEvent.press(getByText(mockPackageCardItem.name)); // Pressing on the title text area
    expect(mockOnPress).toHaveBeenCalledTimes(1);
  });

  it('renders correctly if price is zero or undefined', () => {
    const itemWithoutPrice: PackageItemProps = { ...mockPackageCardItem, price: 0 };
    const { queryByText, rerender } = render(
      <PackageCard item={itemWithoutPrice} onPress={mockOnPress} />
    );
    // Price row might still exist with $0.00 or be absent, depending on component logic
    // Current component logic: if (pkg.price !== undefined && pkg.price > 0)
    expect(queryByText(/\$0\.00/i)).toBeNull(); 
    expect(queryByText(/Offer:/i)).toBeNull();


    const itemWithUndefinedPrice: PackageItemProps = { ...mockPackageCardItem, price: undefined };
    rerender(
        <PackageCard item={itemWithUndefinedPrice} onPress={mockOnPress} />
    );
    expect(queryByText(/Offer:/i)).toBeNull();
  });
  
  // Add more tests if there are other conditional rendering aspects or specific formatting
});
