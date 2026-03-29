import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from './useDebounce';
import { searchGems } from '../../features/gems/services/gemsService';
import { searchSellers } from '../../features/users/services/usersService';

export const useGlobalSearch = () => {
    const [query, setQuery] = useState('');
    const debouncedQuery = useDebounce(query, 300);
    const enabled = debouncedQuery.length >= 2;

    const gems = useQuery({
        queryKey: ['globalSearch', 'gems', debouncedQuery],
        queryFn: () => searchGems(debouncedQuery, 5),
        enabled,
        staleTime: 30_000,
        placeholderData: (prev) => prev,
    });

    const sellers = useQuery({
        queryKey: ['globalSearch', 'sellers', debouncedQuery],
        queryFn: () => searchSellers(debouncedQuery, 3),
        enabled,
        staleTime: 30_000,
        placeholderData: (prev) => prev,
    });

    return {
        query,
        setQuery,
        gems: gems.data?.data || [],
        sellers: sellers.data?.data || [],
        isLoading: gems.isLoading || sellers.isLoading,
        hasResults: (gems.data?.data?.length || 0) + (sellers.data?.data?.length || 0) > 0,
    };
};
