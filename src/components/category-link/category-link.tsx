import { NavLink, NavLinkProps } from '@remix-run/react';
import { ROUTES } from '~/router/config';

export interface CategoryLinkProps {
    categorySlug: string;
    title: string;
    className?: string | NavLinkProps['className'];
}

export const CategoryLink = ({ categorySlug, title, className }: CategoryLinkProps) => {
    return (
        <NavLink to={ROUTES.products.to(categorySlug)} className={className}>
            {title}
        </NavLink>
    );
};
