import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { supabase } from '../../../config/supabase';
import { useUiStore } from '../../../stores/uiStore';
import { getNotificationLink } from '../utils/notificationUtils';
import * as api from '../services/notificationsService';

export const useGetUnreadCount = () => {
  return useQuery({
    queryKey: ['notif-unread-count'],
    queryFn: api.getUnreadCount,
    staleTime: 30_000,
    refetchInterval: 30_000,
    select: (data) => data?.data?.count ?? 0,
  });
};

export const useGetRecent = () => {
  return useQuery({
    queryKey: ['notif-recent'],
    queryFn: api.getRecent,
    staleTime: 15_000,
  });
};

export const useGetNotifications = (filters) => {
  return useQuery({
    queryKey: ['notifications', filters],
    queryFn: () => api.getNotifications(filters),
    staleTime: 30_000,
    placeholderData: (prev) => prev,
  });
};

export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids) => api.markAsRead(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notif-unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['notif-recent'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notif-unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['notif-recent'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id) => api.deleteOne(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notif-unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['notif-recent'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useDeleteAllRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: api.deleteAllRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notif-unread-count'] });
      queryClient.invalidateQueries({ queryKey: ['notif-recent'] });
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useRealtimeNotifications = (userId) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('notifications-' + userId)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: 'user_id=eq.' + userId,
        },
        (payload) => {
          const notif = payload.new;
          queryClient.invalidateQueries({ queryKey: ['notif-unread-count'] });
          queryClient.invalidateQueries({ queryKey: ['notif-recent'] });
          queryClient.invalidateQueries({ queryKey: ['notifications'] });

          const addToast = useUiStore.getState().addToast;
          addToast({
            type: 'notification',
            title: notif.title,
            message: notif.message?.slice(0, 60),
            duration: 5000,
            onClick: () => {
              const link = getNotificationLink(notif);
              if (link) window.location.href = link;
            },
          });
        }
      )
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, [userId, queryClient]);
};
