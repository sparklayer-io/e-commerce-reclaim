import classNames from 'classnames';
import { FadeIn, Reveal } from '~/lib/components/visual-effects';
import { useCategoryDetails, useProducts } from '~/lib/ecom';
import { ProductCard, ProductCardSkeleton } from '~/src/components/product-card/product-card';
import { ProductLink } from '~/src/components/product-link/product-link';

import styles from './featured-products-section.module.scss';

interface FeaturedProductsSectionProps {
    categorySlug: string;
    title?: string;
    description?: JSX.Element | string;
    productCount?: number;
    className?: string;
}

export const FeaturedProductsSection = (props: FeaturedProductsSectionProps) => {
    const { title, description, productCount = 4, categorySlug, className } = props;
    const { data: category } = useCategoryDetails(categorySlug);
    const { data: products } = useProducts({ categorySlug, limit: productCount });

    return (
        <div className={classNames(styles.root, className)}>
            <FadeIn className={styles.header} duration={1.8}>
                <h3 className={styles.headerTitle}>{title ?? category?.name ?? categorySlug}</h3>
                <div className={styles.headerDescription}>
                    {description ?? category?.description}
                </div>
            </FadeIn>
            <Reveal className={styles.products} direction="down" duration={1.4}>
                {products
                    ? products.items.map((product) => (
                          <ProductLink key={product._id} productSlug={product.slug!}>
                              <ProductCard
                                  name={product.name!}
                                  imageUrl={product.media?.mainMedia?.image?.url}
                                  price={product.priceData?.formatted?.price}
                                  discountedPrice={product.priceData?.formatted?.discountedPrice}
                                  ribbon={product.ribbon ?? undefined}
                              />
                          </ProductLink>
                      ))
                    : Array.from({ length: productCount }).map((_, i) => (
                          <ProductCardSkeleton key={i} />
                      ))}
            </Reveal>
        </div>
    );
};
