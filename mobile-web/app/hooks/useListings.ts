import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getListings,
  getListing,
  createListing,
  updateListing,
  deleteListing,
} from '../services/api';
import type { CreateListingRequest, UpdateListingRequest } from '../types';

export const listingKeys = {
  all: ['listings'] as const,
  bySale: (saleId: string) => [...listingKeys.all, saleId, 'list'] as const,
  detail: (id: string) => [...listingKeys.all, 'detail', id] as const,
};

export function useListings(saleId: string | undefined) {
  return useQuery({
    queryKey: listingKeys.bySale(saleId!),
    queryFn: () => getListings(saleId!),
    enabled: !!saleId,
    staleTime: 30 * 1000,
  });
}

export function useListing(listingId: string | undefined) {
  return useQuery({
    queryKey: listingKeys.detail(listingId!),
    queryFn: () => getListing(listingId!),
    enabled: !!listingId,
    staleTime: 30 * 1000,
  });
}

export function useCreateListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ saleId, data }: { saleId: string; data: CreateListingRequest }) =>
      createListing(saleId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: listingKeys.bySale(variables.saleId),
      });
    },
  });
}

export function useUpdateListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      saleId,
      data,
    }: {
      id: string;
      saleId: string;
      data: UpdateListingRequest;
    }) => updateListing(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: listingKeys.bySale(variables.saleId),
      });
      queryClient.invalidateQueries({
        queryKey: listingKeys.detail(variables.id),
      });
    },
  });
}

export function useDeleteListing() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, saleId }: { id: string; saleId: string }) =>
      deleteListing(id),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: listingKeys.bySale(variables.saleId),
      });
    },
  });
}
