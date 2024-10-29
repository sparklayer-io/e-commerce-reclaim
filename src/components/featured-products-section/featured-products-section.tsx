import classNames from 'classnames';
import useSWR from 'swr';
import { FadeIn, Reveal } from '~/lib/components/visual-effects';
import { useEcomAPI } from '~/lib/ecom';
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

    const api = useEcomAPI();

    const { data } = useSWR(
        `/category/${categorySlug}/featured/limit/${productCount}`,
        async () => {
            const response = await api.getFeaturedProducts(categorySlug, productCount);
            if (response.status === 'failure') {
                throw response.error;
            }

            return response.body;
        },
    );

    return (
        <div className={classNames(styles.root, className)}>
            <FadeIn className={styles.header} duration={1.8}>
                <h3 className={styles.headerTitle}>{title ?? data?.category.name}</h3>
                <div className={styles.headerDescription}>
                    {description ?? data?.category.description}
                </div>
            </FadeIn>
            <Reveal className={styles.productsRow} direction="down" duration={1.4}>
                {data
                    ? data.items.map((product) => (
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
