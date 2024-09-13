import { Link, NavLink } from '@remix-run/react';
import styles from './footer.module.scss';
import classNames from 'classnames';
import { ROUTES } from '~/router/config';
import { CategoryLink } from '../category-link/category-link';

export interface FooterProps {
    className?: string;
}

export const Footer = ({ className }: FooterProps) => {
    const navItemStyle = ({ isActive }: { isActive: boolean }) =>
        classNames(styles.navItem, {
            [styles.active]: isActive,
        });

    return (
        <footer className={classNames(styles.root, className)}>
            <section className={styles.navigation}>
                <nav>
                    <ul>
                        <li>
                            <CategoryLink
                                title="Shop All"
                                categorySlug="all-products"
                                className={navItemStyle}
                            />
                        </li>
                        <li>
                            <CategoryLink
                                title="Kitchen"
                                categorySlug="kitchen-essentials"
                                className={navItemStyle}
                            />
                        </li>
                        <li>
                            <CategoryLink
                                title="Bath"
                                categorySlug="bath"
                                className={navItemStyle}
                            />
                        </li>
                        <li>
                            <CategoryLink
                                title="On the Go"
                                categorySlug="on-the-go"
                                className={navItemStyle}
                            />
                        </li>
                        <li>
                            <CategoryLink
                                title="New In"
                                categorySlug="new-in"
                                className={navItemStyle}
                            />
                        </li>
                        <li>
                            <CategoryLink
                                title="Best Sellers"
                                categorySlug="best-sellers"
                                className={navItemStyle}
                            />
                        </li>
                        <li>
                            <NavLink to={ROUTES.aboutUs.to()} className={navItemStyle}>
                                About Us
                            </NavLink>
                        </li>
                    </ul>
                </nav>
                <ul>
                    <li>
                        <NavLink to={ROUTES.termsAndConditions.to()} className={navItemStyle}>
                            Terms & Conditions
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to={ROUTES.privacyPolicy.to()} className={navItemStyle}>
                            Privacy Policy
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to={ROUTES.shippingPolicy.to()} className={navItemStyle}>
                            Shipping Policy
                        </NavLink>
                    </li>
                    <li>
                        <NavLink to={ROUTES.refundPolicy.to()} className={navItemStyle}>
                            Refund Policy
                        </NavLink>
                    </li>
                </ul>
                <ul>
                    <li>
                        <Link to={ROUTES.home.to()} className={styles.navItem}>
                            Facebook
                        </Link>
                    </li>
                    <li>
                        <Link to={ROUTES.home.to()} className={styles.navItem}>
                            Instagram
                        </Link>
                    </li>
                    <li>
                        <Link to={ROUTES.home.to()} className={styles.navItem}>
                            Pinterest
                        </Link>
                    </li>
                </ul>
            </section>
            <section className={styles.bottomBar}>
                <Link to={ROUTES.home.to()} className={styles.logo}>
                    ReClaim
                </Link>
                <div className={styles.copyright}>
                    <span>© 2035 by ReClaim. Made with </span>
                    <Link to="https://www.codux.com/" className={styles.coduxLink}>
                        Codux™
                    </Link>
                </div>
            </section>
        </footer>
    );
};
