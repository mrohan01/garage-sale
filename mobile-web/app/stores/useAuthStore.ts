import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { setAuthToken } from '../services/api';
import type { User } from '../types';

const TOKEN_KEY = 'auth_access_token';
const REFRESH_KEY = 'auth_refresh_token';
const USER_ID_KEY = 'auth_user_id';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  userId: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  setTokens: (accessToken: string, refreshToken: string, userId: string) => void;
  loadStoredTokens: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  userId: null,
  isAuthenticated: false,
  isLoading: true,

  setTokens: (accessToken, refreshToken, userId) => {
    setAuthToken(accessToken);
    SecureStore.setItemAsync(TOKEN_KEY, accessToken);
    SecureStore.setItemAsync(REFRESH_KEY, refreshToken);
    SecureStore.setItemAsync(USER_ID_KEY, userId);
    set({ accessToken, refreshToken, userId, isAuthenticated: true });
  },

  login: async (email, password) => {
    // Import lazily to avoid circular dependency
    const { login: apiLogin } = require('../services/api');
    const response = await apiLogin({ email, password });
    get().setTokens(response.accessToken, response.refreshToken, response.userId);
  },

  register: async (email, password, displayName) => {
    const { register: apiRegister } = require('../services/api');
    const response = await apiRegister({ email, password, displayName });
    get().setTokens(response.accessToken, response.refreshToken, response.userId);
  },

  logout: async () => {
    setAuthToken(null);
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    await SecureStore.deleteItemAsync(REFRESH_KEY);
    await SecureStore.deleteItemAsync(USER_ID_KEY);
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
      userId: null,
      isAuthenticated: false,
      isLoading: false,
    });
  },

  loadStoredTokens: async () => {
    try {
      const accessToken = await SecureStore.getItemAsync(TOKEN_KEY);
      const refreshToken = await SecureStore.getItemAsync(REFRESH_KEY);
      const userId = await SecureStore.getItemAsync(USER_ID_KEY);

      if (accessToken && refreshToken && userId) {
        setAuthToken(accessToken);
        set({
          accessToken,
          refreshToken,
          userId,
          isAuthenticated: true,
          isLoading: false,
        });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));
