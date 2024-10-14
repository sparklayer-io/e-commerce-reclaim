import { CartItem } from '~/components/cart/cart-item/cart-item';
import { cart } from '@wix/ecom';
import classNames from 'classnames';
import { LockIcon } from '~/components/icons';

import styles from './route.module.scss';

const mockCartItem: cart.LineItem = {
    _id: '1',
    productName: { translated: 'Bamboo Toothbrush' },
    quantity: 1,
    image: 'https://static.wixstatic.com/media/c837a6_18152edaef9940ca88f446ae94b48a47~mv2.jpg/v1/fill/w_824,h_1098,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/c837a6_18152edaef9940ca88f446ae94b48a47~mv2.jpg',
    price: { formattedConvertedAmount: '$5.50' },
    fullPrice: { formattedConvertedAmount: '$7.50' },
};

const noop = () => {};

export default function CartPage() {
    return (
        <div className={styles.page}>
            <div className={styles.cart}>
                <h1 className={styles.cartHeader}>My cart</h1>
                <div className={styles.cartItems}>
                    <CartItem
                        item={mockCartItem}
                        priceBreakdown={{
                            lineItemPrice: { formattedConvertedAmount: '$5.50' },
                        }}
                        onQuantityChange={noop}
                        onRemove={noop}
                    />
                    <CartItem
                        item={mockCartItem}
                        priceBreakdown={{
                            lineItemPrice: { formattedConvertedAmount: '$5.50' },
                        }}
                        onQuantityChange={noop}
                        onRemove={noop}
                    />
                </div>
            </div>
            <div className={styles.summary}>
                <h1 className={styles.summaryHeader}>Order summary</h1>
                <div className={styles.summarySection}>
                    <div className={styles.summaryRow}>
                        <span>Subtotal</span>
                        <span>$5.50</span>
                    </div>
                    <div className={styles.summaryRow}>
                        <span>Delivery</span>
                        <span>FREE</span>
                    </div>
                    <div className={styles.summaryRow}>
                        <span className={styles.location}>Poland</span>
                    </div>
                </div>
                <div className={styles.summarySection}>
                    <div className={classNames(styles.summaryRow, styles.summaryTotal)}>
                        <span>Total</span>
                        <span>$5.50</span>
                    </div>

                    <button className={classNames('button', styles.checkoutButton)}>
                        Checkout
                    </button>

                    <div className={styles.secureCheckout}>
                        <LockIcon width={11} />
                        <span>Secure Checkout</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
