import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContext';
import * as transactionsService from '../services/transactionsService';

export const useGetMyPurchases = (filters) => {
  const { isAuthenticated } = useAuth();
  return useQuery({
    queryKey: ['purchases', filters],
    queryFn: () => transactionsService.getMyPurchases(filters),
    staleTime: 1000 * 60,
    enabled: isAuthenticated,
    select: (res) => res.data,
    placeholderData: (prev) => prev,
  });
};

export const useInitiateBuyNow = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (gemId) => transactionsService.initiateBuyNow(gemId),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['purchases'] }),
  });
};

export const useConfirmPayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, paymentReference }) =>
      transactionsService.confirmPayment(id, paymentReference),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['purchases'] }),
  });
};

export const useMarkComplete = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => transactionsService.markComplete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['purchases'] }),
  });
};

export const useGetTransaction = (id) => {
  return useQuery({
    queryKey: ['transaction', id],
    queryFn: () => transactionsService.getById(id),
    enabled: !!id,
    staleTime: 1000 * 30,
    select: (res) => res.data,
  });
};
