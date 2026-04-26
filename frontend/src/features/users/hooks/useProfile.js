import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as usersService from '../services/usersService';

const PROFILE_KEY = ['profile', 'me'];

export const useGetProfile = () =>
    useQuery({
        queryKey: PROFILE_KEY,
        queryFn: usersService.getMe,
        staleTime: 1000 * 60 * 5,
        select: (res) => res.data,
    });

export const useUpdateProfile = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: usersService.updateProfile,
        onSuccess: () => qc.invalidateQueries({ queryKey: PROFILE_KEY }),
    });
};

export const useUpdateAvatar = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: usersService.updateAvatar,
        onSuccess: () => qc.invalidateQueries({ queryKey: PROFILE_KEY }),
    });
};

export const useChangeEmail = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: usersService.changeEmail,
        onSuccess: () => qc.invalidateQueries({ queryKey: PROFILE_KEY }),
    });
};

export const useChangePassword = () =>
    useMutation({ mutationFn: usersService.changePassword });

export const useDeleteAccount = () =>
    useMutation({ mutationFn: usersService.deleteAccount });
