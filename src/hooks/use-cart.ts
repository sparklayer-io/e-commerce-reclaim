import { useState } from 'react';
import {
    useCartTotals,
    useCartData,
    useUpdateCartItemQuantity,
    useRemoveItemFromCart,
    useAddToCart,
} from '~/api/api-hooks';
import { useEcomAPI } from '~/api/ecom-api-context-provider';

export const useCart = () => {
    const ecomAPI = useEcomAPI();
    const [updatingCartItemIds, setUpdatingCartItems] = useState<string[]>([]);

    const { data: cartData } = useCartData();
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

    const addToCart = (productId: string, quantity: number) =>
        triggerAddToCart({ id: productId, quantity });

    const checkout = async () => {
        const checkoutResponse = await ecomAPI.checkout();

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

        isAddingToCart,
        isCartTotalsUpdating: updatingCartItemIds.length > 0 || isCartTotalsValidating,

        updateItemQuantity,
        removeItem,
        addToCart,
        checkout,
    };
};
