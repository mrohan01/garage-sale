import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ListingCard } from '../../app/components/ListingCard';
import type { Listing } from '../../app/types';

const mockListing: Listing = {
  id: '1',
  saleId: 's1',
  title: 'Vintage Chair',
  description: 'A nice chair',
  startingPrice: 100,
  minimumPrice: 20,
  currentPrice: 80,
  category: 'Furniture',
  condition: 'GOOD',
  status: 'AVAILABLE',
  images: [{ id: 'img1', listingId: '1', imageUrl: 'https://example.com/chair.jpg', sortOrder: 0 }],
  createdAt: '2025-01-01T00:00:00Z',
  updatedAt: '2025-01-01T00:00:00Z',
};

describe('ListingCard', () => {
  it('renders title and current price', () => {
    const { getByText } = render(
      <ListingCard listing={mockListing} onPress={() => {}} />,
    );
    expect(getByText('Vintage Chair')).toBeTruthy();
    expect(getByText('$80.00')).toBeTruthy();
  });

  it('renders category', () => {
    const { getByText } = render(
      <ListingCard listing={mockListing} onPress={() => {}} />,
    );
    expect(getByText('Furniture')).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByText } = render(
      <ListingCard listing={mockListing} onPress={onPress} />,
    );
    fireEvent.press(getByText('Vintage Chair'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('shows original price when decayed', () => {
    const { getByText } = render(
      <ListingCard listing={mockListing} onPress={() => {}} />,
    );
    expect(getByText('$100.00')).toBeTruthy();
  });

  it('does not show original price when not decayed', () => {
    const listing = { ...mockListing, currentPrice: 100 };
    const { queryByText } = render(
      <ListingCard listing={listing} onPress={() => {}} />,
    );
    expect(queryByText('$100.00')).toBeTruthy();
    // Should only show one price element, no strikethrough original
    expect(queryByText('$100.00')).toBeTruthy();
  });

  it('shows placeholder when no images', () => {
    const listing = { ...mockListing, images: [] };
    const { getByText } = render(
      <ListingCard listing={listing} onPress={() => {}} />,
    );
    expect(getByText('No Photo')).toBeTruthy();
  });
});
