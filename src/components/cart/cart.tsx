import { useNavigate } from '@remix-run/react';
import { useCartOpen } from '~/lib/cart-open-context';
import { useCart } from '~/lib/ecom';
import { Drawer } from '~/src/components/drawer/drawer';
import { CartView } from './cart-view/cart-view';

export const Cart = () => {
    const { isOpen, setIsOpen } = useCartOpen();
    const navigate = useNavigate();
    const {
        cartData,
        cartTotals,
        isCartTotalsUpdating,
        updatingCartItemIds,
        checkout,
        removeItem,
        updateItemQuantity,
    } = useCart();

    const handleViewCart = () => {
        setIsOpen(false);
        navigate('/cart');
    };

    return (
        <Drawer onClose={() => setIsOpen(false)} open={isOpen}>
            <CartView
                cart={cartData}
                cartTotals={cartTotals}
                onClose={() => setIsOpen(false)}
                onCheckout={checkout}
                onViewCart={handleViewCart}
                onItemRemove={removeItem}
                onItemQuantityChange={updateItemQuantity}
                isUpdating={isCartTotalsUpdating}
                updatingCartItemIds={updatingCartItemIds}
            />
        </Drawer>
    );
};
