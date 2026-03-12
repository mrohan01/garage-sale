import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createOffer, acceptOffer, rejectOffer, counterOffer } from '../services/api';
import { messageKeys } from './useMessages';
import { transactionKeys } from './useTransactions';
import { listingKeys } from './useListings';
import type { CreateOfferRequest, CounterOfferRequest } from '../types';

export function useCreateOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateOfferRequest) => createOffer(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.all });
    },
  });
}

export function useAcceptOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (offerId: string) => acceptOffer(offerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.all });
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });
      queryClient.invalidateQueries({ queryKey: listingKeys.all });
    },
  });
}

export function useRejectOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (offerId: string) => rejectOffer(offerId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.all });
    },
  });
}

export function useCounterOffer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ offerId, data }: { offerId: string; data: CounterOfferRequest }) =>
      counterOffer(offerId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: messageKeys.all });
    },
  });
}
