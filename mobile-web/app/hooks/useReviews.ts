import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getSellerReviews, createReview } from '../services/api';
import type { CreateReviewRequest } from '../types';

export const reviewKeys = {
  all: ['reviews'] as const,
  bySeller: (userId: string) => [...reviewKeys.all, 'seller', userId] as const,
};

export function useSellerReviews(userId: string | undefined) {
  return useQuery({
    queryKey: reviewKeys.bySeller(userId!),
    queryFn: () => getSellerReviews(userId!),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateReviewRequest) => createReview(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewKeys.all });
    },
  });
}
