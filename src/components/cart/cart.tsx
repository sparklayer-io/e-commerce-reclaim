import { Drawer } from '~/components/drawer/drawer';
import { useCartOpen } from './cart-open-context';
import { CartView } from './cart-view/cart-view';
import { useCart } from '~/hooks/use-cart';

export const Cart = () => {
    const { isOpen, setIsOpen } = useCartOpen();
    const { cartData, cartTotals, checkout, removeItem, updateItemQuantity } = useCart();

    return (
        <Drawer onClose={() => setIsOpen(false)} open={isOpen}>
            <CartView
                cart={cartData}
                cartTotals={cartTotals}
                close={() => setIsOpen(false)}
                onCheckout={checkout}
                onItemRemove={removeItem}
                onItemQuantityChange={updateItemQuantity}
            />
        </Drawer>
    );
};
