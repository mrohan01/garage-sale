import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSavedListings,
  saveListing,
  unsaveListing,
} from '../services/api';

export const savedKeys = {
  all: ['saved'] as const,
  list: () => [...savedKeys.all, 'list'] as const,
};

export function useSavedListings() {
  return useQuery({
    queryKey: savedKeys.list(),
    queryFn: getSavedListings,
    staleTime: 30 * 1000,
  });
}

export function useSaveListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (listingId: string) => saveListing(listingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: savedKeys.all });
    },
  });
}

export function useUnsaveListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (listingId: string) => unsaveListing(listingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: savedKeys.all });
    },
  });
}
