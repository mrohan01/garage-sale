import React from 'react';
import { render } from '@testing-library/react-native';
import { EmptyState } from '../../app/components/EmptyState';

describe('EmptyState', () => {
  it('renders message', () => {
    const { getByText } = render(<EmptyState message="No items" />);
    expect(getByText('No items')).toBeTruthy();
  });

  it('renders default icon', () => {
    const { getByText } = render(<EmptyState message="Empty" />);
    expect(getByText('📦')).toBeTruthy();
  });

  it('renders custom icon', () => {
    const { getByText } = render(<EmptyState message="Empty" icon="🎉" />);
    expect(getByText('🎉')).toBeTruthy();
  });
});
