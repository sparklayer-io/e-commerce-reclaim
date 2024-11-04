import { currentCart, orders } from '@wix/ecom';
import { redirects } from '@wix/redirects';
import { createClient, IOAuthStrategy, OAuthStrategy, Tokens, WixClient } from '@wix/sdk';
import { collections, products } from '@wix/stores';
import { getErrorMessage } from '~/lib/utils';
import { DEMO_STORE_WIX_CLIENT_ID, WIX_STORES_APP_ID } from './constants';
import { getFilteredProductsQuery } from './product-filters';
import { getSortedProductsQuery } from './product-sorting';
import {
    EcomApi,
    EcomApiErrorCodes,
    EcomApiFailureResponse,
    EcomApiSuccessResponse,
} from './types';
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
        async getProducts({ categorySlug, skip = 0, limit = 100, filters, sortBy } = {}) {
            try {
                const { collection } = categorySlug
                    ? await wixClient.collections.getCollectionBySlug(categorySlug)
                    : {};

                let query = wixClient.products.queryProducts();

                if (collection) {
                    query = query.hasSome('collectionIds', [collection._id]);
                }

                if (filters) {
                    query = getFilteredProductsQuery(query, filters);
                }

                if (sortBy) {
                    query = getSortedProductsQuery(query, sortBy);
                }

                const { items, totalCount = 0 } = await query.skip(skip).limit(limit).find();
                return successResponse({ items, totalCount });
            } catch (e) {
                return failureResponse(EcomApiErrorCodes.GetProductsFailure, getErrorMessage(e));
            }
        },

        async getProductBySlug(slug) {
            const { items } = await wixClient.products
                .queryProducts()
                .eq('slug', slug)
                .limit(1)
                .find();
            return items.at(0);
        },

        async getCart() {
            try {
                const currentCart = await wixClient.currentCart.getCurrentCart();
                return successResponse(currentCart);
            } catch (e) {
                return failureResponse(EcomApiErrorCodes.GetCartFailure, getErrorMessage(e));
            }
        },

        async getCartTotals() {
            try {
                const cartTotals = await wixClient.currentCart.estimateCurrentCartTotals();
                return successResponse(cartTotals);
            } catch (e) {
                return failureResponse(EcomApiErrorCodes.GetCartTotalsFailure, getErrorMessage(e));
            }
        },

        async updateCartItemQuantity(id, quantity) {
            try {
                const result = await wixClient.currentCart.updateCurrentCartLineItemQuantity([
                    {
                        _id: id || undefined,
                        quantity,
                    },
                ]);
                if (!result.cart) {
                    throw new Error('Failed to update cart item quantity');
                }
                return successResponse(result.cart);
            } catch (e) {
                return failureResponse(
                    EcomApiErrorCodes.UpdateCartItemQuantityFailure,
                    getErrorMessage(e),
                );
            }
        },

        async removeItemFromCart(id) {
            try {
                const result = await wixClient.currentCart.removeLineItemsFromCurrentCart([id]);
                if (!result.cart) {
                    throw new Error('Failed to remove cart item');
                }
                return successResponse(result.cart);
            } catch (e) {
                return failureResponse(EcomApiErrorCodes.RemoveCartItemFailure, getErrorMessage(e));
            }
        },

        async addToCart(id, quantity, options) {
            try {
                const result = await wixClient.currentCart.addToCurrentCart({
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

                if (!result.cart) {
                    throw new Error('Failed to add item to cart');
                }

                return successResponse(result.cart);
            } catch (e) {
                return failureResponse(EcomApiErrorCodes.AddCartItemFailure, getErrorMessage(e));
            }
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
            try {
                const categories = (await wixClient.collections.queryCollections().find()).items;
                return successResponse(categories);
            } catch (e) {
                return failureResponse(
                    EcomApiErrorCodes.GetAllCategoriesFailure,
                    getErrorMessage(e),
                );
            }
        },

        async getCategoryBySlug(slug) {
            try {
                const category = (await wixClient.collections.getCollectionBySlug(slug)).collection;
                if (!category) {
                    return failureResponse(
                        EcomApiErrorCodes.CategoryNotFound,
                        'Category not found',
                    );
                }

                return successResponse(category);
            } catch (e) {
                if (isNotFoundWixClientError(e)) {
                    return failureResponse(
                        EcomApiErrorCodes.CategoryNotFound,
                        'Category not found',
                    );
                }

                return failureResponse(EcomApiErrorCodes.GetCategoryFailure, getErrorMessage(e));
            }
        },

        async getOrder(id) {
            try {
                return await wixClient.orders.getOrder(id);
            } catch (error) {
                if (!isNotFoundWixClientError(error)) throw error;
            }
        },

        async getProductPriceBounds(categorySlug: string) {
            try {
                const category = (await wixClient.collections.getCollectionBySlug(categorySlug))
                    .collection;
                if (!category) throw new Error('Category not found');

                const query = wixClient.products
                    .queryProducts()
                    .hasSome('collectionIds', [category._id]);

                const [ascendingPrice, descendingPrice] = await Promise.all([
                    query.ascending('price').limit(1).find(),
                    query.descending('price').limit(1).find(),
                ]);

                const lowest = ascendingPrice.items[0]?.priceData?.price ?? 0;
                const highest = descendingPrice.items[0]?.priceData?.price ?? 0;

                return successResponse({ lowest, highest });
            } catch (e) {
                return failureResponse(EcomApiErrorCodes.GetProductsFailure, getErrorMessage(e));
            }
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

function failureResponse(code: EcomApiErrorCodes, message: string): EcomApiFailureResponse {
    return {
        status: 'failure',
        error: { code, message },
    };
}

function successResponse<T>(body: T): EcomApiSuccessResponse<T> {
    return {
        status: 'success',
        body,
    };
}
