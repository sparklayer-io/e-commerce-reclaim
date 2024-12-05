import { Link, useNavigate } from '@remix-run/react';
import classNames from 'classnames';
import { useState } from 'react';
import { CartIcon, MenuIcon } from '~/src/components/icons';
import { getCartItemCount, useCartData, useCartOpen } from '~/src/wix/cart';
import { NavigationMenu } from '../navigation-menu/navigation-menu';
import { SearchInput } from '../search-input/search-input';
import { SidebarNavigationMenu } from '../sidebar-navigation-menu/sidebar-navigation-menu';
import { UserMenu } from '../user-menu/user-menu';

import styles from './header.module.scss';

export interface HeaderProps {
    className?: string;
}

export const Header = ({ className }: HeaderProps) => {
    const cart = useCartData();
    const cartOpener = useCartOpen();
    const navigate = useNavigate();

    const onSearchSubmit = (search: string) => {
        navigate(`/products/all-products?search=${encodeURIComponent(search)}`);
    };

    const cartItemCount = cart.data ? getCartItemCount(cart.data) : 0;

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
                <SearchInput className={styles.searchInput} onSearchSubmit={onSearchSubmit} />
                <NavigationMenu className={styles.menu} />
                <div className={styles.actions}>
                    <UserMenu />

                    <button
                        className={classNames(styles.cartButton, 'iconButton')}
                        onClick={() => cartOpener.setIsOpen(true)}
                    >
                        <CartIcon className={styles.cart} count={cartItemCount} />
                    </button>

                    <button
                        className={classNames(styles.openMenuButton, 'iconButton')}
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
