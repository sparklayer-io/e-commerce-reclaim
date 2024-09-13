import { type LoaderFunctionArgs, redirect, json } from '@remix-run/node';
import { Link, useLoaderData } from '@remix-run/react';
import { getEcomApi } from '~/api/ecom-api';
import { ROUTES } from '~/router/config';
import styles from './products.module.scss';
import { ProductCard } from '~/components/product-card/product-card';
import { collections } from '@wix/stores';
import classNames from 'classnames';
import { CategoryLink } from '~/components/category-link/category-link';

export const loader = async ({ params: { categorySlug } }: LoaderFunctionArgs) => {
    const api = getEcomApi();
    const redirectToAllProducts = () => redirect(ROUTES.products.to('all-products'));

    if (!categorySlug) return redirectToAllProducts();

    let category: collections.Collection;

    try {
        const categoryDetails = await api.getCategoryBySlug(categorySlug);
        // It throws if category doesn't exist, so this is just to please TS.
        if (!categoryDetails) return redirectToAllProducts();
        category = categoryDetails;
    } catch (error) {
        // Redirect to "All products" if the requested category doesn't exist.
        // In case of another error throw it again and let the global error boundary handle it.
        if ((error as any)?.details?.applicationError?.code === 404) {
            return redirectToAllProducts();
        } else {
            throw error;
        }
    }

    const categoryProducts = await api.getProductsByCategory(categorySlug);
    const allCategories = await api.getAllCategories();

    return json({ category, categoryProducts, allCategories });
};

export default function ProductsPage() {
    const { category, categoryProducts, allCategories } = useLoaderData<typeof loader>();

    return (
        <div className={styles.page}>
            <nav className={styles.navigation}>
                <h2 className={styles.navigationTitle}>Browse by</h2>
                <ul>
                    {allCategories.map((category) => (
                        <li key={category._id} className={styles.categoryListItem}>
                            <CategoryLink
                                title={category.name}
                                categorySlug={category.slug!}
                                className={({ isActive }) =>
                                    classNames(styles.categoryLink, {
                                        [styles.categoryLinkActive]: isActive,
                                    })
                                }
                            />
                        </li>
                    ))}
                </ul>
            </nav>

            <div>
                <h1 className={styles.categoryName}>{category.name}</h1>
                {category.description && (
                    <p className={styles.categoryDescription}>{category.description}</p>
                )}

                <p className={styles.productsCount}>
                    {category.numberOfProducts}{' '}
                    {category.numberOfProducts === 1 ? 'product' : 'products'}
                </p>

                <div className={styles.productsList}>
                    {categoryProducts.map((product) => (
                        <Link key={product._id} to={ROUTES.productDetails.to(product.slug!)}>
                            <ProductCard
                                name={product.name!}
                                imageUrl={product.media?.mainMedia?.image?.url}
                                priceData={product.priceData}
                                ribbon={product.ribbon ?? undefined}
                            />
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
