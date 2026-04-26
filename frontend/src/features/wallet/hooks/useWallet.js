import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as walletService from '../services/walletService';

export const useMyWallet = ({ enabled = true } = {}) =>
    useQuery({
        queryKey: ['wallet'],
        queryFn: walletService.getMyWallet,
        enabled,
        staleTime: 1000 * 30,
        select: (res) => res.data,
    });

export const useTopUpWallet = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: walletService.topUpWallet,
        onSuccess: () => qc.invalidateQueries({ queryKey: ['wallet'] }),
    });
};

export const useBuyGems = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: walletService.buyGems,
        onSuccess: () => qc.invalidateQueries({ queryKey: ['wallet'] }),
    });
};

export const useWithdrawToBank = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: walletService.withdrawToBank,
        onSuccess: () => qc.invalidateQueries({ queryKey: ['wallet'] }),
    });
};
