import type { LoaderFunctionArgs } from '@remix-run/node';
import { isRouteErrorResponse, useLoaderData, useNavigate, useRouteError } from '@remix-run/react';
import classNames from 'classnames';
import { FadeIn } from '~/lib/components/visual-effects';
import { EcomApiErrorCodes } from '~/lib/ecom';
import { initializeEcomApi } from '~/lib/ecom/session';
import { useAppliedProductFilters } from '~/lib/hooks';
import { useProductSorting } from '~/lib/hooks/use-product-sorting';
import { useProductsPageResults } from '~/lib/hooks/use-products-page-results';
import { getProductsRouteData } from '~/lib/route-loaders';
import { getErrorMessage } from '~/lib/utils';
import { AppliedProductFilters } from '~/src/components/applied-product-filters/applied-product-filters';
import { Breadcrumbs } from '~/src/components/breadcrumbs/breadcrumbs';
import { RouteBreadcrumbs, useBreadcrumbs } from '~/src/components/breadcrumbs/use-breadcrumbs';
import { CategoryLink } from '~/src/components/category-link/category-link';
import { EmptyProductsCategory } from '~/src/components/empty-products-category/empty-products-category';
import { ErrorPage } from '~/src/components/error-page/error-page';
import { ProductCard } from '~/src/components/product-card/product-card';
import { ProductFilters } from '~/src/components/product-filters/product-filters';
import { ProductLink } from '~/src/components/product-link/product-link';
import { ProductSortingSelect } from '~/src/components/product-sorting-select/product-sorting-select';

import styles from './route.module.scss';

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
    const api = await initializeEcomApi(request);
    return getProductsRouteData(api, params.categorySlug, request.url);
};

const breadcrumbs: RouteBreadcrumbs<typeof loader> = (match) => [
    {
        title: match.data.category.name!,
        to: `/products/${match.data.category.slug}`,
    },
];

export const handle = {
    breadcrumbs,
};

export default function ProductsPage() {
    const {
        category,
        categoryProducts: resultsFromLoader,
        allCategories,
        productPriceBounds,
    } = useLoaderData<typeof loader>();

    const { appliedFilters, someFiltersApplied, clearFilters, clearAllFilters } =
        useAppliedProductFilters();
    const { sorting } = useProductSorting();
    const { products, totalProducts, loadMoreProducts, isLoadingMoreProducts } =
        useProductsPageResults({
            categorySlug: category.slug!,
            filters: appliedFilters,
            sorting,
            resultsFromLoader,
        });

    const currency = products[0]?.priceData?.currency ?? 'USD';

    const breadcrumbs = useBreadcrumbs();

    const renderProducts = () => {
        if (category.numberOfProducts === 0) {
            return (
                <EmptyProductsCategory
                    title="No products here yet..."
                    subtitle="In the meantime, you can choose a different category to continue shopping."
                />
            );
        }

        if (someFiltersApplied && products.length === 0) {
            return (
                <EmptyProductsCategory
                    title="We couldn't find any matches"
                    subtitle="Try different filters or another category."
                    actionButton={
                        <button className={styles.clearFiltersButton} onClick={clearAllFilters}>
                            Clear Filters
                        </button>
                    }
                />
            );
        }

        return (
            <div className={styles.productsList}>
                {products.map((product) => (
                    <FadeIn key={product._id} duration={0.9}>
                        <ProductLink
                            className={styles.productLink}
                            productSlug={product.slug!}
                            state={{
                                fromCategory: {
                                    name: category.name,
                                    slug: category.slug,
                                },
                            }}
                        >
                            <ProductCard
                                name={product.name!}
                                imageUrl={product.media?.mainMedia?.image?.url}
                                price={product.priceData?.formatted?.price}
                                discountedPrice={product.priceData?.formatted?.discountedPrice}
                                ribbon={product.ribbon ?? undefined}
                                inventoryStatus={product.stock?.inventoryStatus}
                            />
                        </ProductLink>
                    </FadeIn>
                ))}
            </div>
        );
    };

    return (
        <div className={styles.page}>
            <Breadcrumbs breadcrumbs={breadcrumbs} />

            <div className={styles.content}>
                <div className={styles.sidebar}>
                    <nav>
                        <h2 className={styles.sidebarTitle}>Browse by</h2>
                        <ul>
                            {allCategories.map((category) => (
                                <li key={category._id} className={styles.categoryListItem}>
                                    <CategoryLink
                                        categorySlug={category.slug!}
                                        className={({ isActive }) =>
                                            classNames(styles.categoryLink, {
                                                [styles.categoryLinkActive]: isActive,
                                            })
                                        }
                                    >
                                        {category.name}
                                    </CategoryLink>
                                </li>
                            ))}
                        </ul>

                        {category.numberOfProducts !== 0 && (
                            <div className={styles.filters}>
                                <h2
                                    className={classNames(styles.sidebarTitle, styles.filtersTitle)}
                                >
                                    Filters
                                </h2>
                                <ProductFilters
                                    lowestPrice={productPriceBounds.lowest}
                                    highestPrice={productPriceBounds.highest}
                                    currency={currency}
                                />
                            </div>
                        )}
                    </nav>
                </div>

                <div className={styles.main}>
                    <div className={styles.categoryHeader}>
                        <h1 className={styles.categoryName}>{category.name}</h1>
                        {category.description && (
                            <p className={styles.categoryDescription}>{category.description}</p>
                        )}
                    </div>

                    {someFiltersApplied && (
                        <AppliedProductFilters
                            className={styles.appliedFilters}
                            appliedFilters={appliedFilters}
                            onClearFilters={clearFilters}
                            onClearAllFilters={clearAllFilters}
                            currency={currency}
                            minPriceInCategory={productPriceBounds.lowest}
                            maxPriceInCategory={productPriceBounds.highest}
                        />
                    )}

                    <div className={styles.countAndSorting}>
                        <p className={styles.productsCount}>
                            {totalProducts} {totalProducts === 1 ? 'product' : 'products'}
                        </p>

                        <ProductSortingSelect />
                    </div>

                    {renderProducts()}

                    {products.length < totalProducts && (
                        <div className={styles.loadMoreWrapper}>
                            <button
                                className="button secondaryButton"
                                onClick={loadMoreProducts}
                                disabled={isLoadingMoreProducts}
                            >
                                {isLoadingMoreProducts ? 'Loading...' : 'Load More'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export function ErrorBoundary() {
    const error = useRouteError();
    const navigate = useNavigate();

    let title = 'Error';
    let message = getErrorMessage(error);

    if (isRouteErrorResponse(error) && error.data.code === EcomApiErrorCodes.CategoryNotFound) {
        title = 'Category Not Found';
        message = "Unfortunately, the category page you're trying to open does not exist";
    }

    return (
        <ErrorPage
            title={title}
            message={message}
            actionButtonText="Back to shopping"
            onActionButtonClick={() => navigate('/products/all-products')}
        />
    );
}
