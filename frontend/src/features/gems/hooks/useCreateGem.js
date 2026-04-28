import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { createGemViaAPI, uploadGemImage, uploadGemModel } from '../services/gemsService';

/**
 * useCreateGem
 * TanStack React Query mutation that:
 *   1. Uploads images + 3D models to storage (with progress tracking)
 *   2. POSTs the gem data (with URLs) to the backend
 *
 * 3D model URLs are stored in the images[] array with a "model:" prefix.
 */
export const useCreateGem = ({ onSuccess, onError } = {}) => {
    const [uploadProgress, setUploadProgress] = useState({});

    const mutation = useMutation({
        mutationFn: async ({ formData }) => {
            console.log('[useCreateGem] mutationFn started, imageFiles:', formData.imageFiles?.length || 0);
            const urls = [];

            // Upload images
            if (formData.imageFiles?.length) {
                for (let i = 0; i < formData.imageFiles.length; i++) {
                    const file = formData.imageFiles[i];
                    const ext = file.name.split('.').pop()?.toLowerCase() || '';
                    const is3D = ['glb', 'gltf'].includes(ext);

                    console.log(`[useCreateGem] uploading file ${i}:`, file.name, is3D ? '(3D)' : '(image)');
                    setUploadProgress(prev => ({ ...prev, [i]: 30 }));
                    const url = is3D
                        ? await uploadGemModel(file)
                        : await uploadGemImage(file);
                    urls.push(url);
                    console.log(`[useCreateGem] file ${i} uploaded:`, url);
                    setUploadProgress(prev => ({ ...prev, [i]: 100 }));
                }
            }

            const payload = {
                title:              formData.title,
                category_id:        formData.category_id,
                carat_weight:       parseFloat(formData.carat_weight),
                color:              formData.color || undefined,
                clarity:            formData.clarity || undefined,
                cut:                formData.cut || undefined,
                treatment:          formData.treatment || undefined,
                certification_body: formData.certification_body || undefined,
                certification:      formData.certification || undefined,
                description:        formData.description || undefined,
                images:             urls,
                listing_type:       formData.listing_type,
                buy_now_price:      formData.listing_type === 'direct_sell'
                    ? parseFloat(formData.buy_now_price) : null,
                status:             formData.status || 'listed',
            };

            console.log('[useCreateGem] payload:', JSON.stringify(payload).substring(0, 200));
            return createGemViaAPI(payload);
        },
        onSuccess: (...args) => {
            setUploadProgress({});
            onSuccess?.(...args);
        },
        onError: (...args) => {
            setUploadProgress({});
            onError?.(...args);
        },
    });

    return { ...mutation, uploadProgress };
};
