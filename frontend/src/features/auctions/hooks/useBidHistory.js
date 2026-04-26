import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../../context/AuthContext';
import { getMyBidHistory, getMyBidStats, getMyAuctionBids } from '../services/auctionsService';

export const useGetBidHistory = (filters) => {
    const { isAuthenticated } = useAuth();
    return useQuery({
        queryKey: ['bid-history', filters],
        queryFn: () => getMyBidHistory(filters),
        staleTime: 1000 * 30,
        enabled: isAuthenticated,
        select: (res) => res.data,
        placeholderData: (previousData) => previousData,
    });
};

export const useGetBidStats = () => {
    const { isAuthenticated } = useAuth();
    return useQuery({
        queryKey: ['bid-stats'],
        queryFn: getMyBidStats,
        staleTime: 1000 * 60,
        enabled: isAuthenticated,
        select: (res) => res.data,
    });
};

export const useGetAuctionBids = (auctionId) => {
    return useQuery({
        queryKey: ['auction-my-bids', auctionId],
        queryFn: () => getMyAuctionBids(auctionId),
        enabled: !!auctionId,
        staleTime: 1000 * 30,
        select: (res) => res.data,
    });
};
