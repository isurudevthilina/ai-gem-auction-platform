import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    getAdminCertificates,
    getCertStats,
    getCertById,
    verifyCertificate,
    sendAuthorityVerification,
    rejectCertificate,
    deleteCertificate,
} from '../services/certificatesService';

export const useGetAdminCertificates = (filters) =>
    useQuery({
        queryKey: ['admin-certificates', filters],
        queryFn: () => getAdminCertificates(filters),
        staleTime: 30_000,
        refetchInterval: 60_000,
        placeholderData: (prev) => prev,
    });

export const useGetCertStats = () =>
    useQuery({
        queryKey: ['cert-stats'],
        queryFn: getCertStats,
        staleTime: 30_000,
        placeholderData: (prev) => prev,
    });

export const useGetCertById = (id) =>
    useQuery({
        queryKey: ['certificate', id],
        queryFn: () => getCertById(id),
        enabled: !!id,
    });

export const useVerifyCertificate = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, notes }) => verifyCertificate(id, notes),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['admin-certificates'] });
            qc.invalidateQueries({ queryKey: ['cert-stats'] });
        },
    });
};

export const useSendAuthorityVerification = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, payload }) => sendAuthorityVerification(id, payload),
        onSuccess: (_data, variables) => {
            qc.invalidateQueries({ queryKey: ['admin-certificates'] });
            qc.invalidateQueries({ queryKey: ['cert-stats'] });
            qc.invalidateQueries({ queryKey: ['certificate', variables.id] });
        },
    });
};

export const useRejectCertificate = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: ({ id, notes }) => rejectCertificate(id, notes),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['admin-certificates'] });
            qc.invalidateQueries({ queryKey: ['cert-stats'] });
        },
    });
};

export const useDeleteCertificate = () => {
    const qc = useQueryClient();
    return useMutation({
        mutationFn: (id) => deleteCertificate(id),
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['my-certificates'] });
        },
    });
};
