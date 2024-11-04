import { currentCart, orders } from '@wix/ecom';
import { redirects } from '@wix/redirects';
import { createClient, IOAuthStrategy, OAuthStrategy, Tokens, WixClient } from '@wix/sdk';
import { collections, products } from '@wix/stores';
import { DEMO_STORE_WIX_CLIENT_ID, WIX_STORES_APP_ID } from './constants';
import { getFilteredProductsQuery } from './product-filters';
import { getSortedProductsQuery } from './product-sorting';
import { EcomApi } from './types';
import { isNotFoundWixClientError, normalizeWixClientError } from './wix-client-error';

type WixApiClient = WixClient<
    undefined,
    IOAuthStrategy,
    {
        products: typeof products;
        currentCart: typeof currentCart;
        redirects: typeof redirects;
        collections: typeof collections;
        orders: typeof orders;
    }
>;

export function getWixClientId() {
    /**
     * this file is used on both sides: client and server,
     * so we are trying to read WIX_CLIENT_ID from process.env on server side
     * or from window.ENV (created by the root loader) on client side.
     */
    const env =
        typeof window !== 'undefined' && window.ENV
            ? window.ENV
            : typeof process !== 'undefined'
              ? process.env
              : {};

    return env.WIX_CLIENT_ID ?? DEMO_STORE_WIX_CLIENT_ID;
}

export function createWixClient(tokens?: Tokens): WixApiClient {
    return createClient({
        modules: {
            products,
            currentCart,
            redirects,
            collections,
            orders,
        },
        auth: OAuthStrategy({
            clientId: getWixClientId(),
            tokens,
        }),
    });
}

export function initializeEcomApiWithTokens(tokens: Tokens) {
    const client = createWixClient(tokens);
    return createEcomApi(client);
}

export function initializeEcomApiAnonymous() {
    const client = createWixClient();
    return createEcomApi(client);
}

const createEcomApi = (wixClient: WixApiClient): EcomApi =>
    withNormalizedWixClientErrors({
        async getProducts(params = {}) {
            let collectionId = params.categoryId;
            if (!collectionId && params.categorySlug) {
                const result = await wixClient.collections.getCollectionBySlug(params.categorySlug);
                collectionId = result.collection!._id!;
            }

            let query = wixClient.products.queryProducts();

            if (collectionId) query = query.hasSome('collectionIds', [collectionId]);
            if (params.filters) query = getFilteredProductsQuery(query, params.filters);
            if (params.sortBy) query = getSortedProductsQuery(query, params.sortBy);

            const { items, totalCount = 0 } = await query
                .skip(params.skip ?? 0)
                .limit(params.limit ?? 100)
                .find();

            return { items, totalCount };
        },

        async getProductBySlug(productSlug) {
            const { items } = await wixClient.products
                .queryProducts()
                .eq('slug', productSlug)
                .limit(1)
                .find();

            return items.at(0);
        },

        getCart() {
            return wixClient.currentCart.getCurrentCart();
        },

        getCartTotals() {
            return wixClient.currentCart.estimateCurrentCartTotals();
        },

        async updateCartItemQuantity(id, quantity) {
            const { cart } = await wixClient.currentCart.updateCurrentCartLineItemQuantity([
                { _id: id, quantity },
            ]);
            return cart!;
        },

        async removeFromCart(id) {
            const { cart } = await wixClient.currentCart.removeLineItemsFromCurrentCart([id]);
            return cart!;
        },

        async addToCart(id, quantity, options) {
            const { cart } = await wixClient.currentCart.addToCurrentCart({
                lineItems: [
                    {
                        catalogReference: {
                            catalogItemId: id,
                            appId: WIX_STORES_APP_ID,
                            options,
                        },
                        quantity,
                    },
                ],
            });
            return cart!;
        },

        async checkout({ successUrl, cancelUrl }) {
            const { checkoutId } = await wixClient.currentCart.createCheckoutFromCurrentCart({
                channelType: currentCart.ChannelType.WEB,
            });

            const { redirectSession } = await wixClient.redirects.createRedirectSession({
                ecomCheckout: { checkoutId },
                callbacks: { postFlowUrl: cancelUrl, thankYouPageUrl: successUrl },
            });

            const checkoutUrl = redirectSession?.fullUrl;
            if (!checkoutUrl) throw new Error('Failed to retrieve checkout URL');
            return { checkoutUrl };
        },

        async getAllCategories() {
            const { items } = await wixClient.collections.queryCollections().find();
            return items;
        },

        async getCategoryBySlug(slug) {
            try {
                const { collection } = await wixClient.collections.getCollectionBySlug(slug);
                return collection!;
            } catch (error) {
                if (!isNotFoundWixClientError(error)) throw error;
            }
        },

        async getOrder(id) {
            try {
                return await wixClient.orders.getOrder(id);
            } catch (error) {
                if (!isNotFoundWixClientError(error)) throw error;
            }
        },

        async getProductPriceBoundsInCategory(categoryId: string) {
            const query = wixClient.products.queryProducts().hasSome('collectionIds', [categoryId]);

            const [ascendingPrice, descendingPrice] = await Promise.all([
                query.ascending('price').limit(1).find(),
                query.descending('price').limit(1).find(),
            ]);

            const lowest = ascendingPrice.items[0]?.priceData?.price ?? 0;
            const highest = descendingPrice.items[0]?.priceData?.price ?? 0;
            return { lowest, highest };
        },
    });

/**
 * Wraps all methods of the EcomApi with a try-catch block that fixes broken
 * error messages in WixClient errors and rethrows them.
 */
const withNormalizedWixClientErrors = (api: EcomApi): EcomApi => {
    for (const key of Object.keys(api)) {
        const original = Reflect.get(api, key);
        if (typeof original !== 'function') continue;
        Reflect.set(api, key, (...args: unknown[]) => {
            try {
                const result = Reflect.apply(original, api, args);
                if (result instanceof Promise) {
                    return result.catch((error) => {
                        throw normalizeWixClientError(error);
                    });
                }
                return result;
            } catch (error) {
                throw normalizeWixClientError(error);
            }
        });
    }
    return api;
};
