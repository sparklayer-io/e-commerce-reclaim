import { useState } from 'react';
import { Link } from '@remix-run/react';
import classNames from 'classnames';
import { useCartData } from '~/lib/ecom';
import { useCartOpen } from '~/lib/cart-open-context';
import { calculateCartItemsCount } from '~/lib/utils';
import { CartIcon, MenuIcon } from '~/src/components/icons';
import { NavigationMenu } from '../navigation-menu/navigation-menu';
import { SidebarNavigationMenu } from '../sidebar-navigation-menu/sidebar-navigation-menu';

import styles from './header.module.scss';

export interface HeaderProps {
    className?: string;
}

export const Header = ({ className }: HeaderProps) => {
    const cart = useCartData();
    const cartOpener = useCartOpen();

    const cartItemsCount = cart.data ? calculateCartItemsCount(cart.data) : 0;

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <header className={classNames(styles.root, className)}>
            <section className={styles.topBar}>
                <Link to="/" className={styles.logo}>
                    ReClaim
                </Link>
                <div>
                    <div className={styles.advertisingText}>
                        Free shipping on all intl. orders over $35
                    </div>
                    <Link className={styles.shopNow} to="/products/all-products">
                        Shop Now
                    </Link>
                </div>
            </section>
            <section className={styles.navigation}>
                <div />
                <NavigationMenu className={styles.menu} />
                <div className={styles.actions}>
                    <button onClick={() => cartOpener.setIsOpen(true)}>
                        <CartIcon className={styles.cart} count={cartItemsCount} />
                    </button>

                    <button
                        className={styles.openMenuButton}
                        onClick={() => setIsSidebarOpen(true)}
                    >
                        <MenuIcon width={24} height={24} />
                    </button>
                </div>
            </section>

            <SidebarNavigationMenu open={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
        </header>
    );
};
