import { currentCart, orders } from '@wix/ecom';
import { members } from '@wix/members';
import { redirects } from '@wix/redirects';
import { createClient, OAuthStrategy, Tokens } from '@wix/sdk';
import { collections, products } from '@wix/stores';
import { CollectionDetails, EcomApi, ProductFilter, ProductSortBy, WixApiClient } from './types';
import { isNotFoundWixClientError, normalizeWixClientError } from './wix-client-error';

/**
 * The Wix Stores App ID is the same for all websites integrating with Wix
 * Stores. It is required for API calls such as adding products to the cart.
 * - https://dev.wix.com/docs/rest/business-solutions/stores/catalog/e-commerce-integration
 */
const WIX_STORES_APP_ID = '1380b703-ce81-ff05-f115-39571d94dfcd';

/**
 * OAuth app client ID for a demo store, used to access a sample product catalog
 * until you connect your own Wix store. Once connected, this client ID is
 * ignored.
 * - https://help.codux.com/kb/en/article/connecting-your-app-to-wix-headless-services
 */
const DEMO_WIX_CLIENT_ID = '35a15d20-4732-4bb8-a8ef-194fd1166827';

/**
 * OAuth app client ID for your Wix website to access Wix APIs. It is used on
 * both the server side and client side, and it is passed from the server to the
 * client by the root loader.
 * - https://dev.wix.com/docs/go-headless/coding/java-script-sdk/visitors-and-members/create-a-client-with-oauth
 * - https://dev.wix.com/docs/go-headless/getting-started/setup/authentication/create-an-oauth-app-for-visitors-and-members
 */
let WIX_CLIENT_ID: string | undefined;

export function getWixClientId(): string {
    if (typeof process !== 'undefined' && process.env.WIX_CLIENT_ID) {
        return process.env.WIX_CLIENT_ID;
    }
    return WIX_CLIENT_ID ?? DEMO_WIX_CLIENT_ID;
}

export function setWixClientId(id: string): void {
    WIX_CLIENT_ID = id;
}

export function createWixClient(tokens?: Tokens): WixApiClient {
    return createClient({
        modules: {
            products,
            currentCart,
            redirects,
            collections,
            orders,
            members,
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

let cache:
    | Promise<{
          products: products.ProductsQueryResult;
          collections: collections.CollectionsQueryResult;
      }>
    | undefined = undefined;
let cacheLastUpdated = 0;

const createEcomApi = (wixClient: WixApiClient): EcomApi => {
    const api: EcomApi = {
        getWixClient() {
            return wixClient;
        },

        async getProducts(params = {}) {
            const { products, collections } = await getCache();

            let collectionId = params.categoryId;
            const minPrice = params.filters?.[ProductFilter.minPrice];
            const maxPrice = params.filters?.[ProductFilter.maxPrice];

            if (!collectionId && params.categorySlug) {
                collectionId =
                    collections.items.find((c) => c.slug === params.categorySlug)?._id ?? undefined;
                if (!collectionId) throw new Error(`Category ${params.categorySlug} not found`);
            }

            let { items } = products;

            if (collectionId !== undefined) {
                items = items.filter((product) => product.collectionIds!.includes(collectionId));
            }

            if (minPrice !== undefined) {
                items = items.filter((product) => product.priceData!.price! >= minPrice);
            }

            if (maxPrice !== undefined) {
                items = items.filter((product) => product.priceData!.price! <= maxPrice);
            }

            if (params.sortBy === ProductSortBy.priceAsc) {
                items.sort((a, b) => a.priceData!.price! - b.priceData!.price!);
            } else if (params.sortBy === ProductSortBy.priceDesc) {
                items.sort((a, b) => b.priceData!.price! - a.priceData!.price!);
            } else if (params.sortBy === ProductSortBy.nameAsc) {
                items.sort((a, b) => a.name!.localeCompare(b.name!));
            } else if (params.sortBy === ProductSortBy.nameDesc) {
                items.sort((a, b) => b.name!.localeCompare(a.name!));
            } else {
                items.sort((a, b) => Number(b.numericId) - Number(a.numericId));
            }

            const totalCount = items.length;
            if (params.skip) items = items.slice(params.skip);
            if (params.limit) items = items.slice(0, params.limit);
            return { items, totalCount };
        },

        async getProductBySlug(productSlug) {
            const products = await this.getProducts();
            return products.items.find((product) => product.slug === productSlug);
        },

        async getCart() {
            try {
                return await wixClient.currentCart.getCurrentCart();
            } catch (error) {
                // The cart object doesn't exist for new visitors until they add
                // a product to the cart.
                if (!isNotFoundWixClientError(error)) throw error;
            }
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
            const { collections } = await getCache();
            return collections.items;
        },

        async getCategoryBySlug(slug) {
            const { collections } = await getCache();
            return collections.items.find((c) => c.slug === slug) as CollectionDetails | undefined;
        },

        async getOrder(id) {
            try {
                return await wixClient.orders.getOrder(id);
            } catch (error) {
                if (!isNotFoundWixClientError(error)) throw error;
            }
        },

        async getOrders() {
            const searchOrdersResponse = await wixClient.orders.searchOrders();
            return {
                items: searchOrdersResponse.orders,
                totalCount: searchOrdersResponse.metadata?.count ?? 0,
            };
        },

        async getProductPriceBoundsInCategory(categoryId: string) {
            const { items } = await this.getProducts({ categoryId });
            const prices = items.map((item) => item.priceData?.price ?? 0);
            const lowest = Math.min(...prices);
            const highest = Math.max(...prices);
            return { lowest, highest };
        },

        async login(callbackUrl: string, returnUrl: string) {
            const oAuthData = wixClient.auth.generateOAuthData(callbackUrl, returnUrl);

            const { authUrl } = await wixClient.auth.getAuthUrl(oAuthData, {
                responseMode: 'query',
            });

            return { oAuthData, authUrl };
        },

        async logout(returnUrl: string) {
            return wixClient.auth.logout(returnUrl);
        },

        isLoggedIn() {
            return wixClient.auth.loggedIn();
        },

        async getUser() {
            const response = await wixClient.members.getCurrentMember({
                fieldsets: [members.Set.FULL],
            });
            return response.member;
        },

        async updateUser(id: string, user: members.UpdateMember) {
            // `updateMember` is not clearing contact phone number, so
            // if phone should be empty we use separate function for this
            if (!user.contact?.phones?.[0]) {
                await wixClient.members.deleteMemberPhones(id);

                if (user.contact?.phones) {
                    user.contact.phones = [];
                }
            }

            return wixClient.members.updateMember(id, user);
        },

        async sendPasswordResetEmail(email: string, redirectUrl: string) {
            await wixClient.auth.sendPasswordResetEmail(email, redirectUrl);
        },
    };

    const loadCache = () => {
        return Promise.all([
            wixClient.products.queryProducts().find(),
            wixClient.collections.queryCollections().find(),
        ]).then(([products, collections]) => ({ products, collections }));
    };

    const getCache = () => {
        if (!cache) {
            cacheLastUpdated = Date.now();
            cache = loadCache().catch((error) => {
                cache = undefined;
                throw error;
            });
        } else if (Date.now() - cacheLastUpdated > 60_000) {
            cacheLastUpdated = Date.now();
            loadCache().then((result) => {
                cache = Promise.resolve(result);
            });
        }
        return cache;
    };

    normalizeWixClientErrors(api);
    return api;
};

/**
 * Wraps all methods of the EcomApi with a try-catch block that fixes broken
 * error messages in WixClient errors and rethrows them.
 */
const normalizeWixClientErrors = (api: EcomApi): void => {
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
};
