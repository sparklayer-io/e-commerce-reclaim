import { CartItem } from '~/src/components/cart/cart-item/cart-item';
import classNames from 'classnames';
import { LockIcon } from '~/src/components/icons';
import { Link } from '@remix-run/react';
import { useCart } from '~/lib/ecom';
import { findLineItemPriceBreakdown } from '~/lib/utils';

import styles from './route.module.scss';
import { Spinner } from '~/src/components/spinner/spinner';

export default function CartPage() {
    const {
        cartData,
        cartTotals,
        isCartLoading,
        isCartTotalsUpdating,
        updatingCartItemIds,
        checkout,
        removeItem,
        updateItemQuantity,
    } = useCart();

    if (!cartData && isCartLoading) return null;

    if (!cartData?.lineItems.length)
        return (
            <div className={styles.cart}>
                <h1 className={styles.cartHeader}>My cart</h1>
                <div className={styles.emptyCart}>
                    <div className={styles.emptyCartMessage}>Cart is empty</div>
                    <Link to="/" className={styles.continueBrowsingLink}>
                        Continue Browsing
                    </Link>
                </div>
            </div>
        );

    return (
        <div className={styles.page}>
            <div className={styles.cart}>
                <h1 className={styles.cartHeader}>My cart</h1>
                <div className={styles.cartItems}>
                    {cartData?.lineItems.map((item) => (
                        <CartItem
                            key={item._id}
                            item={item}
                            isUpdating={updatingCartItemIds.includes(item._id!)}
                            priceBreakdown={findLineItemPriceBreakdown(item, cartTotals)}
                            onRemove={() => removeItem(item._id!)}
                            onQuantityChange={(quantity: number) =>
                                updateItemQuantity({ id: item._id!, quantity })
                            }
                        />
                    ))}
                </div>
            </div>
            <div className={styles.summary}>
                <h1 className={styles.summaryHeader}>Order summary</h1>
                <div
                    className={classNames(styles.summarySection, {
                        [styles.loading]: isCartTotalsUpdating,
                    })}
                >
                    <div className={styles.summaryRow}>
                        <span>Subtotal</span>
                        <span>{cartTotals?.priceSummary?.subtotal?.formattedConvertedAmount}</span>
                    </div>
                    <div className={styles.summaryRow}>
                        <span>Delivery</span>
                        <span>
                            {Number(cartTotals?.priceSummary?.shipping?.amount) === 0
                                ? 'FREE'
                                : cartTotals?.priceSummary?.shipping?.formattedConvertedAmount}
                        </span>
                    </div>
                    <div className={styles.summaryRow}>
                        <span className={styles.location}>Poland</span>
                    </div>
                    <div className={classNames(styles.summaryRow, styles.summaryTotal)}>
                        <span>Total</span>
                        <span>{cartTotals?.priceSummary?.total?.formattedConvertedAmount}</span>
                    </div>
                    {isCartTotalsUpdating && (
                        <div className={styles.spinner}>
                            <Spinner size={50} />
                        </div>
                    )}
                </div>

                <button
                    className={classNames('button', styles.checkoutButton)}
                    onClick={checkout}
                    disabled={isCartTotalsUpdating}
                >
                    Checkout
                </button>

                <div className={styles.secureCheckout}>
                    <LockIcon width={11} />
                    <span>Secure Checkout</span>
                </div>
            </div>
        </div>
    );
}
