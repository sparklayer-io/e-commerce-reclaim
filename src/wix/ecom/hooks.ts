import useSwr, { SWRResponse } from 'swr';
import { useEcomApi } from './api-context';
import { CollectionDetails } from './types';

export function useCategoryDetails(slug: string): SWRResponse<CollectionDetails | undefined> {
    const ecomApi = useEcomApi();
    return useSwr(['category-details', slug], async ([, slug]) => ecomApi.getCategoryBySlug(slug), {
        keepPreviousData: false,
        revalidateOnFocus: false,
        shouldRetryOnError: false,
    });
}
