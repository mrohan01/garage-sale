import { useLocationStore } from '../../app/stores/useLocationStore';

describe('useLocationStore', () => {
  beforeEach(() => {
    useLocationStore.setState({
      latitude: null,
      longitude: null,
      address: null,
    });
  });

  it('starts with null coordinates', () => {
    const state = useLocationStore.getState();
    expect(state.latitude).toBeNull();
    expect(state.longitude).toBeNull();
    expect(state.address).toBeNull();
  });

  it('setLocation updates coordinates', () => {
    const { setLocation } = useLocationStore.getState();
    setLocation(40.7128, -74.006);

    const state = useLocationStore.getState();
    expect(state.latitude).toBe(40.7128);
    expect(state.longitude).toBe(-74.006);
    expect(state.address).toBeNull();
  });

  it('setLocation updates coordinates and address', () => {
    const { setLocation } = useLocationStore.getState();
    setLocation(40.7128, -74.006, '123 Main St');

    const state = useLocationStore.getState();
    expect(state.latitude).toBe(40.7128);
    expect(state.longitude).toBe(-74.006);
    expect(state.address).toBe('123 Main St');
  });

  it('setLocation without address resets address to null', () => {
    const { setLocation } = useLocationStore.getState();
    setLocation(40.7128, -74.006, '123 Main St');
    setLocation(41.0, -75.0);

    const state = useLocationStore.getState();
    expect(state.latitude).toBe(41.0);
    expect(state.longitude).toBe(-75.0);
    expect(state.address).toBeNull();
  });
});
