import type { SerializeFrom } from '@remix-run/node';
import React from 'react';
import { FadeIn } from '~/lib/components/visual-effects';
import type { CollectionDetails, Product } from '~/lib/ecom';
import { EmptyProductsCategory } from '../empty-products-category/empty-products-category';
import { ProductCard } from '../product-card/product-card';
import { ProductLink } from '../product-link/product-link';
import styles from './product-grid.module.scss';

export interface ProductGridProps {
    /** list of products to show (either from API or serialized from loader) */
    products: Array<Product | SerializeFrom<Product>>;
    /** category containing the shown products */
    category: CollectionDetails;
    /** are there any filters appiled to the passed product list */
    filtersApplied?: boolean;
    /** called when user clicks the "Clear Filters" link (shown when filters applied + no products found)  */
    onClickClearFilters?: () => void;
}

export const ProductGrid = React.memo<ProductGridProps>(function ProductGrid({
    category,
    products,
    filtersApplied,
    onClickClearFilters,
}) {
    if (category.numberOfProducts === 0) {
        return (
            <EmptyProductsCategory
                title="No products here yet..."
                subtitle="In the meantime, you can choose a different category to continue shopping."
            />
        );
    }

    if (filtersApplied && products.length === 0) {
        return (
            <EmptyProductsCategory
                title="We couldn't find any matches"
                subtitle="Try different filters or another category."
                actionButton={
                    <button className={styles.clearFiltersButton} onClick={onClickClearFilters}>
                        Clear Filters
                    </button>
                }
            />
        );
    }

    return (
        <div className={styles.productGrid}>
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
});
