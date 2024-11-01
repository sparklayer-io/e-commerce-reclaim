import { useEffect, useState } from 'react';
import useSwr, { Key, SWRResponse } from 'swr';
import useSWRMutation from 'swr/mutation';
import { findItemIdInCart } from '~/lib/utils';
import { useEcomApi } from './api-context';
import { AddToCartOptions, CollectionDetails, GetProductsOptions, Product } from './types';

export const useCartData = () => {
    const ecomApi = useEcomApi();
    return useSwr('cart', async () => {
        const response = await ecomApi.getCart();
        if (response.status === 'failure') {
            throw response.error;
        }

        return response.body;
    });
};

export const useCartTotals = () => {
    const ecomApi = useEcomApi();
    const { data } = useCartData();

    const cartTotals = useSwr('cart-totals', async () => {
        const response = await ecomApi.getCartTotals();
        if (response.status === 'failure') {
            throw response.error;
        }

        return response.body;
    });

    useEffect(() => {
        cartTotals.mutate();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data]);

    return cartTotals;
};

interface AddToCartArgs {
    id: string;
    quantity: number;
    options?: AddToCartOptions;
}

export const useAddToCart = () => {
    const ecomApi = useEcomApi();
    const { data: cart } = useCartData();
    return useSWRMutation(
        'cart',
        async (_key: Key, { arg }: { arg: AddToCartArgs }) => {
            const itemInCart = cart ? findItemIdInCart(cart, arg.id, arg.options) : undefined;

            if (itemInCart) {
                const updateCartItemQuantityResponse = await ecomApi.updateCartItemQuantity(
                    itemInCart._id,
                    (itemInCart.quantity ?? 0) + arg.quantity,
                );
                if (updateCartItemQuantityResponse.status === 'failure') {
                    throw updateCartItemQuantityResponse.error;
                }
                return updateCartItemQuantityResponse.body;
            }

            const addToCartResponse = await ecomApi.addToCart(arg.id, arg.quantity, arg.options);
            if (addToCartResponse.status === 'failure') {
                throw addToCartResponse.error;
            }
            return addToCartResponse.body;
        },
        {
            revalidate: false,
            populateCache: true,
        },
    );
};

interface UpdateCartItemQuantityArgs {
    id: string;
    quantity: number;
}

export const useUpdateCartItemQuantity = () => {
    const ecomApi = useEcomApi();
    return useSWRMutation(
        'cart',
        async (_key: Key, { arg }: { arg: UpdateCartItemQuantityArgs }) => {
            const response = await ecomApi.updateCartItemQuantity(arg.id, arg.quantity);
            if (response.status === 'failure') {
                throw response.error;
            }
            return response.body;
        },
        {
            revalidate: false,
            populateCache: true,
        },
    );
};

export const useRemoveItemFromCart = () => {
    const ecomApi = useEcomApi();
    return useSWRMutation(
        'cart',
        async (_key: Key, { arg }: { arg: string }) => {
            const response = await ecomApi.removeItemFromCart(arg);
            if (response.status === 'failure') {
                throw response.error;
            }
            return response.body;
        },
        {
            revalidate: false,
            populateCache: true,
        },
    );
};

export const useCart = () => {
    const ecomApi = useEcomApi();
    const [updatingCartItemIds, setUpdatingCartItems] = useState<string[]>([]);

    const { data: cartData, isLoading: isCartLoading } = useCartData();
    const { data: cartTotals, isValidating: isCartTotalsValidating } = useCartTotals();

    const { trigger: triggerUpdateItemQuantity } = useUpdateCartItemQuantity();
    const { trigger: triggerRemoveItem } = useRemoveItemFromCart();
    const { trigger: triggerAddToCart, isMutating: isAddingToCart } = useAddToCart();

    const updateItemQuantity = ({ id, quantity }: { id: string; quantity: number }) => {
        setUpdatingCartItems((prev) => [...prev, id]);
        triggerUpdateItemQuantity({ id, quantity }).finally(() => {
            setUpdatingCartItems((prev) => prev.filter((itemId) => itemId !== id));
        });
    };

    const removeItem = (id: string) => {
        setUpdatingCartItems((prev) => [...prev, id]);
        triggerRemoveItem(id).finally(() => {
            setUpdatingCartItems((prev) => prev.filter((itemId) => itemId !== id));
        });
    };

    const addToCart = (productId: string, quantity: number, options?: AddToCartOptions) =>
        triggerAddToCart({ id: productId, quantity, options });

    const checkout = async () => {
        const checkoutResponse = await ecomApi.checkout();

        if (checkoutResponse.status === 'success') {
            window.location.href = checkoutResponse.body.checkoutUrl;
        } else {
            alert('checkout is not configured');
        }
    };

    return {
        cartData,
        cartTotals,
        updatingCartItemIds,

        isCartLoading,
        isAddingToCart,
        isCartTotalsUpdating: updatingCartItemIds.length > 0 || isCartTotalsValidating,

        updateItemQuantity,
        removeItem,
        addToCart,
        checkout,
    };
};

export function useCategoryDetails(slug: string): SWRResponse<CollectionDetails> {
    const ecomApi = useEcomApi();
    return useSwr(
        ['category-details', slug],
        async ([, slug]) => {
            const response = await ecomApi.getCategoryBySlug(slug);
            if (response.status === 'failure') throw response.error;
            return response.body;
        },
        {
            keepPreviousData: false,
            revalidateOnFocus: false,
            shouldRetryOnError: false,
        },
    );
}

export function useProducts(
    options: GetProductsOptions,
): SWRResponse<{ items: Product[]; totalCount: number }> {
    const ecomApi = useEcomApi();
    return useSwr(
        ['products', options],
        async ([, options]) => {
            const response = await ecomApi.getProducts(options);
            if (response.status === 'failure') throw response.error;
            return response.body;
        },
        {
            keepPreviousData: false,
            revalidateOnFocus: false,
            shouldRetryOnError: false,
        },
    );
}
