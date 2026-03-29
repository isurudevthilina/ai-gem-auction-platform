import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as watchlistService from '../services/watchlistService';

export const useGetFolders = () =>
    useQuery({
        queryKey: ['watchlist-folders'],
        queryFn: watchlistService.getFolders,
        staleTime: 1000 * 60 * 2,
        select: (res) => res.data,
    });

export const useCreateFolder = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (name) => watchlistService.createFolder(name),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['watchlist-folders'] }),
    });
};

export const useRenameFolder = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, name }) => watchlistService.renameFolder(id, name),
        onSuccess: () => qc.invalidateQueries({ queryKey: ['watchlist-folders'] }),
    });
};

export const useDeleteFolder = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id) => watchlistService.deleteFolder(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['watchlist-folders'] });
            qc.invalidateQueries({ queryKey: ['watchlist'] });
        },
    });
};
