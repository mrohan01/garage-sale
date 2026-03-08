import { create } from 'zustand';
import * as Location from 'expo-location';

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  errorMsg: string | null;
  isLoading: boolean;
  requestLocation: () => Promise<void>;
}

export const useLocationStore = create<LocationState>((set) => ({
  latitude: null,
  longitude: null,
  errorMsg: null,
  isLoading: false,

  requestLocation: async () => {
    set({ isLoading: true, errorMsg: null });
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        set({ errorMsg: 'Location permission denied', isLoading: false });
        return;
      }
      const location = await Location.getCurrentPositionAsync({});
      set({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        isLoading: false,
      });
    } catch (error) {
      set({
        errorMsg: 'Failed to get location',
        isLoading: false,
      });
    }
  },
}));
