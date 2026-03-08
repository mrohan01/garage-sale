import { useAuthStore } from '../../app/stores/useAuthStore';

jest.mock('../../app/services/api', () => ({
  setAuthToken: jest.fn(),
}));

import { setAuthToken } from '../../app/services/api';

describe('useAuthStore', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    });
    jest.clearAllMocks();
  });

  it('starts with unauthenticated state', () => {
    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.accessToken).toBeNull();
    expect(state.user).toBeNull();
  });

  it('setAuth updates state and marks authenticated', () => {
    const { setAuth } = useAuthStore.getState();
    const mockUser = {
      id: 'user789',
      email: 'test@example.com',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    };

    setAuth(mockUser, 'access123');

    const state = useAuthStore.getState();
    expect(state.accessToken).toBe('access123');
    expect(state.user).toEqual(mockUser);
    expect(state.isAuthenticated).toBe(true);
    expect(setAuthToken).toHaveBeenCalledWith('access123');
  });

  it('logout clears state', () => {
    const { setAuth, logout } = useAuthStore.getState();
    const mockUser = {
      id: 'user789',
      email: 'test@example.com',
      createdAt: '2025-01-01T00:00:00Z',
      updatedAt: '2025-01-01T00:00:00Z',
    };
    setAuth(mockUser, 'access123');

    logout();

    const state = useAuthStore.getState();
    expect(state.isAuthenticated).toBe(false);
    expect(state.accessToken).toBeNull();
    expect(state.user).toBeNull();
    expect(setAuthToken).toHaveBeenCalledWith(null);
  });
});
