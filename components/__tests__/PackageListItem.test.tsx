import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import PackageListItem, { PackageItemProps } from '../PackageListItem'; // Adjust path if needed
import { router } from 'expo-router'; // Mocked in jest.setup.js

// Mock data for a package
const mockPackage: PackageItemProps = {
  id: 'pkg123',
  name: 'Test Package Name',
  description: 'This is a test package description.',
  pickupAddress: '123 Pickup St, Test City',
  deliveryAddress: '456 Delivery Ave, Test Town',
  price: 25.50,
  status: 'pending',
  owner: {
    username: 'testsender',
    name: 'Test Sender Name',
  },
};

describe('<PackageListItem />', () => {
  it('renders package data correctly', () => {
    const { getByText, queryByText } = render(<PackageListItem item={mockPackage} />);

    expect(getByText(mockPackage.name)).toBeTruthy();
    expect(getByText(`From: ${mockPackage.pickupAddress}`)).toBeTruthy();
    expect(getByText(`To: ${mockPackage.deliveryAddress}`)).toBeTruthy();
    expect(getByText(`$${mockPackage.price.toFixed(2)}`)).toBeTruthy();
    expect(getByText(mockPackage.description)).toBeTruthy();
    expect(getByText(`Sender: ${mockPackage.owner.name}`)).toBeTruthy();
  });

  it('renders correctly when description is not provided', () => {
    const packageWithoutDesc: PackageItemProps = { ...mockPackage, description: undefined };
    const { queryByText } = render(<PackageListItem item={packageWithoutDesc} />);
    expect(queryByText(mockPackage.description)).toBeNull();
  });

  it('renders correctly when price is not provided or zero', () => {
    const packageWithoutPrice: PackageItemProps = { ...mockPackage, price: undefined };
    const { queryByText } = render(<PackageListItem item={packageWithoutPrice} />);
    // Assuming the dollar sign or price text won't be there if price is undefined/zero
    expect(queryByText(`$${mockPackage.price.toFixed(2)}`)).toBeNull(); 
  });
  
  it('renders correctly when owner name is not provided but username is', () => {
    const packageWithUsernameOnly: PackageItemProps = { 
        ...mockPackage, 
        owner: { username: 'senderuseronly' } 
    };
    const { getByText } = render(<PackageListItem item={packageWithUsernameOnly} />);
    expect(getByText(`Sender: ${packageWithUsernameOnly.owner.username}`)).toBeTruthy();
  });

  it('navigates to package details on press', () => {
    const { getByText } = render(<PackageListItem item={mockPackage} />);
    
    fireEvent.press(getByText(mockPackage.name)); // Press on an element, e.g., the package name
    
    expect(router.push).toHaveBeenCalledWith(`/package/${mockPackage.id}`);
  });
});
