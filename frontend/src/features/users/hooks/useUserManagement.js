import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as adminService from '../services/adminService';

export const useGetAllUsers = (filters) =>
  useQuery({
    queryKey: ['admin-users', filters],
    queryFn: () => adminService.getAllUsers(filters),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });

export const useGetUserStats = () =>
  useQuery({
    queryKey: ['admin-user-stats'],
    queryFn: () => adminService.getUserStats(),
    staleTime: 60_000,
    placeholderData: (prev) => prev,
  });

export const useGetUserById = (userId) =>
  useQuery({
    queryKey: ['admin-user', userId],
    queryFn: () => adminService.getUserById(userId),
    enabled: !!userId,
  });

export const useAdminUpdateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }) => adminService.updateUser(id, data),
    onSuccess: (_d, variables) => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      qc.invalidateQueries({ queryKey: ['admin-user-stats'] });
      qc.invalidateQueries({ queryKey: ['admin-user', variables.id] });
    },
  });
};

export const useAdminDeactivateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id) => adminService.deactivateUser(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      qc.invalidateQueries({ queryKey: ['admin-user-stats'] });
    },
  });
};
