import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContext';
import * as reviewsService from '../services/reviewsService';

export const useGetSellerReviews = (sellerId, filters) => {
  return useQuery({
    queryKey: ['seller-reviews', sellerId, filters],
    queryFn: () => reviewsService.getSellerReviews(sellerId, filters),
    staleTime: 1000 * 60 * 2,
    enabled: !!sellerId,
    select: (res) => res.data,
    placeholderData: (prev) => prev,
  });
};

export const useGetSellerRating = (sellerId) => {
  return useQuery({
    queryKey: ['seller-rating', sellerId],
    queryFn: () => reviewsService.getSellerRating(sellerId),
    staleTime: 1000 * 60 * 5,
    enabled: !!sellerId,
    select: (res) => res.data,
  });
};

export const useGetMyReviews = () => {
  return useQuery({
    queryKey: ['my-reviews'],
    queryFn: () => reviewsService.getMyReviews(),
    staleTime: 1000 * 60 * 2,
    select: (res) => res.data,
  });
};

export const useCheckCanReview = (transactionId) => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['can-review', transactionId],
    queryFn: () => reviewsService.checkCanReview(transactionId),
    enabled: !!transactionId && isAuthenticated,
    select: (res) => res.data,
  });
};

export const useCreateReview = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data) => reviewsService.createReview(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['seller-reviews'] });
      qc.invalidateQueries({ queryKey: ['seller-rating'] });
      qc.invalidateQueries({ queryKey: ['my-reviews'] });
      qc.invalidateQueries({ queryKey: ['purchases'] });
      qc.invalidateQueries({ queryKey: ['can-review'] });
    },
  });
};

export const useUpdateReview = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...data }) => reviewsService.updateReview(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['seller-reviews'] });
      qc.invalidateQueries({ queryKey: ['seller-rating'] });
      qc.invalidateQueries({ queryKey: ['my-reviews'] });
    },
  });
};

export const useDeleteReview = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => reviewsService.deleteReview(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['seller-reviews'] });
      qc.invalidateQueries({ queryKey: ['seller-rating'] });
      qc.invalidateQueries({ queryKey: ['my-reviews'] });
    },
  });
};
