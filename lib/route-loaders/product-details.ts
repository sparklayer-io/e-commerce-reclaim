import { json } from '@remix-run/react';
import { getEcomApi } from '~/lib/ecom';
import { removeQueryStringFromUrl } from '~/lib/utils';

export async function getProductDetailsRouteData(productSlug: string | undefined, url: string) {
    if (!productSlug) throw new Error('Missing product slug');

    const productResponse = await getEcomApi().getProductBySlug(productSlug);
    if (productResponse.status === 'failure') throw json(productResponse.error);

    return {
        product: productResponse.body,
        canonicalUrl: removeQueryStringFromUrl(url),
    };
}
