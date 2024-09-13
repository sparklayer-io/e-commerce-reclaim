import { Link, NavLink } from '@remix-run/react';
import classNames from 'classnames';
import { ROUTES } from '~/router/config';
import styles from './header.module.scss';
import { CartIcon } from '../cart-icon/cart-icon';
import loginIcon from '~/assets/svg/user.svg';
import { CategoryLink } from '../category-link/category-link';

export interface HeaderProps {
    className?: string;
}

export const Header = ({ className }: HeaderProps) => {
    const menuItemStyle = ({ isActive }: { isActive: boolean }) =>
        classNames(styles.menuItem, {
            [styles.active]: isActive,
        });

    return (
        <header className={classNames(styles.root, className)}>
            <section className={styles.topBar}>
                <Link to={ROUTES.home.to()} className={styles.logo}>
                    ReClaim
                </Link>
                <div className={styles.advertisingText}>
                    Free shipping on all intl. orders over $35
                </div>
                <Link className={styles.shopNow} to={ROUTES.products.to('all-products')}>
                    Shop Now
                </Link>
            </section>
            <section className={styles.navigation}>
                <div className={styles.empty} />
                <nav className={styles.menu}>
                    <ul>
                        <li>
                            <CategoryLink
                                title="Shop All"
                                categorySlug="all-products"
                                className={menuItemStyle}
                            />
                        </li>
                        <li>
                            <CategoryLink
                                title="Kitchen"
                                categorySlug="kitchen-essentials"
                                className={menuItemStyle}
                            />
                        </li>
                        <li>
                            <CategoryLink
                                title="Bath"
                                categorySlug="bath"
                                className={menuItemStyle}
                            />
                        </li>
                        <li>
                            <CategoryLink
                                title="On the Go"
                                categorySlug="on-the-go"
                                className={menuItemStyle}
                            />
                        </li>
                        <li>
                            <NavLink to={ROUTES.aboutUs.to()} className={menuItemStyle}>
                                About Us
                            </NavLink>
                        </li>
                    </ul>
                </nav>
                <div className={styles.actions}>
                    <Link to="/login" className={styles.logInLink}>
                        <img className={styles.loginIcon} src={loginIcon} alt="Login icon" />
                        <span>Log In</span>
                    </Link>
                    <CartIcon className={styles.cart} count={0} />
                </div>
            </section>
        </header>
    );
};
