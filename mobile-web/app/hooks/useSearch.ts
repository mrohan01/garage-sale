import { useQuery } from '@tanstack/react-query';
import { searchListings } from '../services/api';
import type { SearchParams } from '../types';

export const searchKeys = {
  all: ['search'] as const,
  results: (params: SearchParams) => [...searchKeys.all, params] as const,
};

export function useSearch(params: SearchParams) {
  const hasQuery = !!params.q;
  const hasLocation = params.lat != null && params.lng != null;

  return useQuery({
    queryKey: searchKeys.results(params),
    queryFn: () => searchListings(params),
    enabled: hasQuery || hasLocation,
    staleTime: 30 * 1000,
  });
}
