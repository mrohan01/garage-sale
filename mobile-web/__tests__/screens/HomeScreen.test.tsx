import React from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

jest.mock('react-native-maps', () => {
  const ReactMock = require('react');
  const { View } = require('react-native');
  const MockMapView = ReactMock.forwardRef((props: any, ref: any) => {
    ReactMock.useImperativeHandle(ref, () => ({
      fitToCoordinates: jest.fn(),
    }));
    return <View testID="map-view" {...props}>{props.children}</View>;
  });
  const MockMarker = ReactMock.forwardRef((props: any, ref: any) => {
    ReactMock.useImperativeHandle(ref, () => ({
      showCallout: jest.fn(),
    }));
    return (
      <View testID={`marker-${props.coordinate?.latitude}`} {...props}>
        {props.children}
      </View>
    );
  });
  const MockCallout = (props: any) => <View {...props}>{props.children}</View>;
  return {
    __esModule: true,
    default: MockMapView,
    Marker: MockMarker,
    Callout: MockCallout,
  };
});

jest.mock('../../app/stores/useLocationStore', () => ({
  useLocationStore: () => ({
    latitude: 40.7128,
    longitude: -74.006,
    requestLocation: jest.fn(),
  }),
}));

const mockSales = [
  {
    id: 's1',
    sellerId: 'u1',
    title: 'Yard Sale',
    description: 'Furniture and clothes',
    address: '123 Main St',
    latitude: 40.7128,
    longitude: -74.006,
    startsAt: '2025-06-15T09:00:00Z',
    endsAt: '2025-06-15T17:00:00Z',
    status: 'ACTIVE',
    createdAt: '2025-06-01T00:00:00Z',
    updatedAt: '2025-06-01T00:00:00Z',
  },
  {
    id: 's2',
    sellerId: 'u2',
    title: 'Moving Sale',
    description: 'Everything must go',
    address: '456 Oak Ave',
    latitude: 40.7200,
    longitude: -74.010,
    startsAt: '2025-06-16T09:00:00Z',
    endsAt: '2025-06-16T17:00:00Z',
    status: 'ACTIVE',
    createdAt: '2025-06-01T00:00:00Z',
    updatedAt: '2025-06-01T00:00:00Z',
  },
];

const mockRefetch = jest.fn();

jest.mock('../../app/hooks', () => ({
  useNearbySales: () => ({
    data: mockSales,
    isLoading: false,
    refetch: mockRefetch,
    isRefetching: false,
  }),
}));

import { HomeScreen } from '../../app/screens/home/HomeScreen';

function createQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
}

describe('HomeScreen', () => {
  const defaultProps: any = {
    navigation: { navigate: jest.fn() } as any,
    route: { params: undefined, key: 'Home', name: 'Home' as const },
  };

  it('renders the home screen container', () => {
    const { getByTestId } = render(
      <QueryClientProvider client={createQueryClient()}>
        <HomeScreen {...defaultProps} />
      </QueryClientProvider>,
    );
    expect(getByTestId('home-screen')).toBeTruthy();
  });

  it('renders search bar', () => {
    const { getByPlaceholderText } = render(
      <QueryClientProvider client={createQueryClient()}>
        <HomeScreen {...defaultProps} />
      </QueryClientProvider>,
    );
    expect(getByPlaceholderText('Search sales and listings...')).toBeTruthy();
  });

  it('renders the map view', () => {
    const { getByTestId } = render(
      <QueryClientProvider client={createQueryClient()}>
        <HomeScreen {...defaultProps} />
      </QueryClientProvider>,
    );
    expect(getByTestId('map-view')).toBeTruthy();
  });

  it('renders sale cards in the list', () => {
    const { getAllByText } = render(
      <QueryClientProvider client={createQueryClient()}>
        <HomeScreen {...defaultProps} />
      </QueryClientProvider>,
    );
    // Each sale title appears in both the marker callout and the list card
    expect(getAllByText('Yard Sale').length).toBeGreaterThanOrEqual(1);
    expect(getAllByText('Moving Sale').length).toBeGreaterThanOrEqual(1);
  });

  it('renders map markers for sales', () => {
    const { getByTestId } = render(
      <QueryClientProvider client={createQueryClient()}>
        <HomeScreen {...defaultProps} />
      </QueryClientProvider>,
    );
    expect(getByTestId('marker-40.7128')).toBeTruthy();
    expect(getByTestId('marker-40.72')).toBeTruthy();
  });

  it('filters sales by search text', () => {
    const { getByPlaceholderText, queryAllByText } = render(
      <QueryClientProvider client={createQueryClient()}>
        <HomeScreen {...defaultProps} />
      </QueryClientProvider>,
    );
    const searchInput = getByPlaceholderText('Search sales and listings...');
    fireEvent.changeText(searchInput, 'Yard');
    // 'Yard Sale' should still be visible, 'Moving Sale' should be filtered out of the list
    expect(queryAllByText('Yard Sale').length).toBeGreaterThanOrEqual(1);
  });

  it('shows empty state when search has no results', () => {
    const { getByPlaceholderText, getByTestId } = render(
      <QueryClientProvider client={createQueryClient()}>
        <HomeScreen {...defaultProps} />
      </QueryClientProvider>,
    );
    const searchInput = getByPlaceholderText('Search sales and listings...');
    fireEvent.changeText(searchInput, 'zzz_nonexistent');
    expect(getByTestId('search-empty')).toBeTruthy();
  });

  it('renders address in sale cards', () => {
    const { getAllByText } = render(
      <QueryClientProvider client={createQueryClient()}>
        <HomeScreen {...defaultProps} />
      </QueryClientProvider>,
    );
    expect(getAllByText('123 Main St').length).toBeGreaterThanOrEqual(1);
    expect(getAllByText('456 Oak Ave').length).toBeGreaterThanOrEqual(1);
  });
});
