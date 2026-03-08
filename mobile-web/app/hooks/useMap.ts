import { useQuery } from '@tanstack/react-query';
import { getMapSales, getMapListings } from '../services/api';

export const mapKeys = {
  all: ['map'] as const,
  sales: (lat: number, lng: number, radiusKm: number) =>
    [...mapKeys.all, 'sales', lat, lng, radiusKm] as const,
  listings: (lat: number, lng: number, radiusKm: number, page?: number, size?: number) =>
    [...mapKeys.all, 'listings', lat, lng, radiusKm, page, size] as const,
};

export function useMapSales(
  lat: number | undefined,
  lng: number | undefined,
  radiusKm: number,
) {
  return useQuery({
    queryKey: mapKeys.sales(lat!, lng!, radiusKm),
    queryFn: () => getMapSales(lat!, lng!, radiusKm),
    enabled: lat != null && lng != null,
    staleTime: 30 * 1000,
  });
}

export function useMapListings(
  lat: number | undefined,
  lng: number | undefined,
  radiusKm: number,
  page?: number,
  size?: number,
) {
  return useQuery({
    queryKey: mapKeys.listings(lat!, lng!, radiusKm, page, size),
    queryFn: () => getMapListings(lat!, lng!, radiusKm, page, size),
    enabled: lat != null && lng != null,
    staleTime: 30 * 1000,
  });
}
