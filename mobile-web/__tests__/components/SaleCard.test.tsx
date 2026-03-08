import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { SaleCard } from '../../app/components/SaleCard';
import type { Sale } from '../../app/types';

const mockSale: Sale = {
  id: 's1',
  sellerId: 'u1',
  title: 'Big Moving Sale',
  description: 'Everything must go',
  address: '123 Main St',
  latitude: 40.7128,
  longitude: -74.006,
  startsAt: '2025-06-15T09:00:00Z',
  endsAt: '2025-06-15T17:00:00Z',
  status: 'ACTIVE',
  createdAt: '2025-06-01T00:00:00Z',
  updatedAt: '2025-06-01T00:00:00Z',
};

describe('SaleCard', () => {
  it('renders title', () => {
    const { getByText } = render(
      <SaleCard sale={mockSale} onPress={() => {}} />,
    );
    expect(getByText('Big Moving Sale')).toBeTruthy();
  });

  it('renders address', () => {
    const { getByText } = render(
      <SaleCard sale={mockSale} onPress={() => {}} />,
    );
    expect(getByText('123 Main St')).toBeTruthy();
  });

  it('renders description', () => {
    const { getByText } = render(
      <SaleCard sale={mockSale} onPress={() => {}} />,
    );
    expect(getByText('Everything must go')).toBeTruthy();
  });

  it('renders status badge', () => {
    const { getByText } = render(
      <SaleCard sale={mockSale} onPress={() => {}} />,
    );
    expect(getByText('ACTIVE')).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <SaleCard sale={mockSale} onPress={onPress} />,
    );
    fireEvent.press(getByText('Big Moving Sale'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('does not render description when absent', () => {
    const sale = { ...mockSale, description: undefined };
    const { queryByText } = render(
      <SaleCard sale={sale} onPress={() => {}} />,
    );
    expect(queryByText('Everything must go')).toBeNull();
  });
});
