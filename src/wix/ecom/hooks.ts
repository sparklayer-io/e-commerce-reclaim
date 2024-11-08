import useSwr, { SWRResponse } from 'swr';
import { useEcomApi } from './api-context';
import { CollectionDetails, GetProductsOptions, Product } from './types';

export function useCategoryDetails(slug: string): SWRResponse<CollectionDetails | undefined> {
    const ecomApi = useEcomApi();
    return useSwr(['category-details', slug], async ([, slug]) => ecomApi.getCategoryBySlug(slug), {
        keepPreviousData: false,
        revalidateOnFocus: false,
        shouldRetryOnError: false,
    });
}

export function useProducts(
    options: GetProductsOptions,
): SWRResponse<{ items: Product[]; totalCount: number }> {
    const ecomApi = useEcomApi();
    return useSwr(['products', options], async ([, options]) => ecomApi.getProducts(options), {
        keepPreviousData: false,
        revalidateOnFocus: false,
        shouldRetryOnError: false,
    });
}
