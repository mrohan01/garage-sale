import { useLocationStore } from '../../app/stores/useLocationStore';

const mockRequestPermissions = jest.fn();
const mockGetPosition = jest.fn();

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: (...args: unknown[]) => mockRequestPermissions(...args),
  getCurrentPositionAsync: (...args: unknown[]) => mockGetPosition(...args),
  Accuracy: { Balanced: 4 },
}));

describe('useLocationStore', () => {
  beforeEach(() => {
    mockRequestPermissions.mockResolvedValue({ status: 'granted' });
    mockGetPosition.mockResolvedValue({
      coords: { latitude: 40.7128, longitude: -74.006 },
    });
    useLocationStore.setState({
      latitude: null,
      longitude: null,
      errorMsg: null,
      isLoading: false,
    });
  });

  it('starts with null coordinates', () => {
    const state = useLocationStore.getState();
    expect(state.latitude).toBeNull();
    expect(state.longitude).toBeNull();
  });

  it('requestLocation updates coordinates', async () => {
    const { requestLocation } = useLocationStore.getState();
    await requestLocation();

    const state = useLocationStore.getState();
    expect(state.latitude).toBe(40.7128);
    expect(state.longitude).toBe(-74.006);
    expect(state.isLoading).toBe(false);
  });

  it('requestLocation sets error when permission denied', async () => {
    mockRequestPermissions.mockResolvedValueOnce({ status: 'denied' });

    const { requestLocation } = useLocationStore.getState();
    await requestLocation();

    const state = useLocationStore.getState();
    expect(state.latitude).toBeNull();
    expect(state.longitude).toBeNull();
    expect(state.errorMsg).toBe('Location permission denied');
  });

  it('requestLocation sets error on failure', async () => {
    mockGetPosition.mockRejectedValueOnce(new Error('fail'));

    const { requestLocation } = useLocationStore.getState();
    await requestLocation();

    const state = useLocationStore.getState();
    expect(state.errorMsg).toBe('Failed to get location');
    expect(state.isLoading).toBe(false);
  });

  it('requestLocation does not duplicate requests when already loading', async () => {
    useLocationStore.setState({ isLoading: true });
    mockRequestPermissions.mockClear();
    mockGetPosition.mockClear();

    const { requestLocation } = useLocationStore.getState();
    await requestLocation();

    expect(mockRequestPermissions).not.toHaveBeenCalled();
    expect(mockGetPosition).not.toHaveBeenCalled();
  });

  it('requestLocation does not duplicate requests when location already obtained', async () => {
    useLocationStore.setState({ latitude: 40.7128, longitude: -74.006 });
    mockRequestPermissions.mockClear();
    mockGetPosition.mockClear();

    const { requestLocation } = useLocationStore.getState();
    await requestLocation();

    expect(mockRequestPermissions).not.toHaveBeenCalled();
    expect(mockGetPosition).not.toHaveBeenCalled();
  });
});
