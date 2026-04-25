import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContext';
import * as reviewsService from '../services/reviewsService';

const UUID_V4_LIKE_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const isValidUuidLike = (value) => UUID_V4_LIKE_REGEX.test(String(value || ''));

export const useGetSellerReviews = (sellerId, filters) => {
  return useQuery({
    queryKey: ['seller-reviews', sellerId, filters],
    queryFn: () => reviewsService.getSellerReviews(sellerId, filters),
    staleTime: 1000 * 60 * 2,
    enabled: isValidUuidLike(sellerId),
    select: (res) => res.data,
    placeholderData: (prev) => prev,
  });
};

export const useGetSellerRating = (sellerId) => {
  return useQuery({
    queryKey: ['seller-rating', sellerId],
    queryFn: () => reviewsService.getSellerRating(sellerId),
    staleTime: 1000 * 60 * 5,
    enabled: isValidUuidLike(sellerId),
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
    enabled: isValidUuidLike(transactionId) && isAuthenticated,
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
      qc.invalidateQueries({ queryKey: ['purchases'] });
      qc.invalidateQueries({ queryKey: ['can-review'] });
    },
  });
};

export const useReportReview = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }) => reviewsService.reportReview(id, reason),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['review-reports'] });
      qc.invalidateQueries({ queryKey: ['my-review-reports'] });
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useGetMyReviewReports = (filters) => {
  return useQuery({
    queryKey: ['my-review-reports', filters],
    queryFn: () => reviewsService.getMyReviewReports(filters),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
    select: (res) => res.data,
  });
};

export const useGetReviewReports = (filters) => {
  return useQuery({
    queryKey: ['review-reports', filters],
    queryFn: () => reviewsService.getReviewReports(filters),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
    select: (res) => res.data,
  });
};

export const useResolveReviewReport = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ reportId, ...data }) => reviewsService.resolveReviewReport(reportId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['review-reports'] });
      qc.invalidateQueries({ queryKey: ['seller-reviews'] });
      qc.invalidateQueries({ queryKey: ['seller-rating'] });
      qc.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};
