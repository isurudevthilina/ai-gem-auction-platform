import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContext';
import * as watchlistService from '../services/watchlistService';

export const useGetWatchlist = (folderId) =>
    useQuery({
        queryKey: ['watchlist', folderId || 'all'],
        queryFn: () => watchlistService.getWatchlist(folderId),
        staleTime: 1000 * 60,
        select: (res) => res.data,
    });

export const useAddToWatchlist = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: watchlistService.addToWatchlist,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['watchlist'] });
            qc.invalidateQueries({ queryKey: ['watchlist-folders'] });
            qc.invalidateQueries({ queryKey: ['watchlist-check'] });
        },
    });
};

export const useRemoveFromWatchlist = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: watchlistService.removeFromWatchlist,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['watchlist'] });
            qc.invalidateQueries({ queryKey: ['watchlist-folders'] });
            qc.invalidateQueries({ queryKey: ['watchlist-check'] });
        },
    });
};

export const useMoveToFolder = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, folderId }) => watchlistService.moveToFolder(id, folderId),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['watchlist'] });
            qc.invalidateQueries({ queryKey: ['watchlist-folders'] });
        },
    });
};

export const useUpdatePriority = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, priority }) => watchlistService.updatePriority(id, priority),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['watchlist'] });
        },
    });
};

export const useCheckWatchlist = (gemId) => {
    const { isAuthenticated } = useAuth();
    return useQuery({
        queryKey: ['watchlist-check', gemId],
        queryFn: () => watchlistService.checkWatchlist(gemId),
        enabled: !!gemId && isAuthenticated,
        staleTime: 1000 * 30,
        select: (res) => res.data,
    });
};
