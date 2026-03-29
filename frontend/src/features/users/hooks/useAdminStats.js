import { useQuery } from '@tanstack/react-query';
import * as adminService from '../services/adminService';

export const useGetDashboardData = () =>
  useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const res = await adminService.getDashboardData();
      return res.data;
    },
    staleTime: 30_000,
    refetchInterval: 60_000,
    placeholderData: (prev) => prev,
  });

export const useGetPlatformStats = () =>
  useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await adminService.getPlatformStats();
      return res.data;
    },
    staleTime: 30_000,
    refetchInterval: 30_000,
    placeholderData: (prev) => prev,
  });

export const useGetRecentActivity = () =>
  useQuery({
    queryKey: ['admin-activity'],
    queryFn: async () => {
      const res = await adminService.getRecentActivity();
      return res.data;
    },
    staleTime: 15_000,
    refetchInterval: 15_000,
    placeholderData: (prev) => prev,
  });
