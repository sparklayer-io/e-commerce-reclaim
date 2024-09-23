import type { LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import classNames from 'classnames';
import { useState } from 'react';
import { useAddToCart } from '~/api/api-hooks';
import { getEcomApi } from '~/api/ecom-api';
import { Accordion } from '~/components/accordion/accordion';
import { Breadcrumbs } from '~/components/breadcrumbs/breadcrumbs';
import { useCartOpen } from '~/components/cart/cart-open-context';
import { CategoryLink } from '~/components/category-link/category-link';
import { ProductImages } from '~/components/product-images/product-images';
import { ProductLink } from '~/components/product-link/product-link';
import { ProductPrice } from '~/components/product-price/product-price';
import { QuantityInput } from '~/components/quantity-input/quantity-input';
import { ShareProductLinks } from '~/components/share-product-links/share-product-links';
import { RouteHandle } from '~/router/types';
import { removeQueryStringFromUrl } from '~/utils';

import styles from './product-details.module.scss';

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
    const productSlug = params.productSlug;
    if (!productSlug) {
        throw new Error('Missing product slug');
    }

    const product = await getEcomApi().getProduct(productSlug);
    if (!product) {
        throw new Response('Product Not Found', { status: 404 });
    }

    const canonicalUrl = removeQueryStringFromUrl(request.url);

    return { product, canonicalUrl };
};

interface ProductDetailsLocationState {
    fromCategory?: {
        name: string;
        slug: string;
    };
}

export const handle: RouteHandle<typeof loader, ProductDetailsLocationState> = {
    breadcrumb: (match, location) => {
        const fromCategory = location.state?.fromCategory;

        const productLink = (
            <ProductLink productSlug={match.data.product.slug!} state={{ fromCategory }}>
                {match.data.product.name!}
            </ProductLink>
        );

        if (fromCategory) {
            const categoryLink = (
                <CategoryLink categorySlug={fromCategory.slug}>{fromCategory.name}</CategoryLink>
            );
            return [categoryLink, productLink];
        }

        return productLink;
    },
};

export default function ProductDetailsPage() {
    const { product, canonicalUrl } = useLoaderData<typeof loader>();

    const cartOpener = useCartOpen();
    const { trigger: addToCart, isMutating: isAddingToCart } = useAddToCart();

    const [quantity, setQuantity] = useState(1);

    const handleAddToCartClick = () => {
        addToCart(
            {
                id: product._id!,
                quantity,
            },
            {
                onSuccess: () => cartOpener.setIsOpen(true),
            }
        );
    };

    return (
        <div className={styles.page}>
            <Breadcrumbs />

            <div className={styles.content}>
                <ProductImages media={product.media} />

                <div>
                    <h1 className={styles.productName}>{product.name}</h1>
                    {product.sku && <p className={styles.sku}>SKU: {product.sku}</p>}

                    {product.priceData && (
                        <ProductPrice priceData={product.priceData} className={styles.price} />
                    )}

                    {product.description && (
                        <div
                            className={styles.description}
                            dangerouslySetInnerHTML={{ __html: product.description }}
                        />
                    )}

                    <div className={styles.quantity}>
                        <label htmlFor="quantity" className={styles.quantityLabel}>
                            Quantity
                        </label>
                        <QuantityInput id="quantity" value={quantity} onChange={setQuantity} />
                    </div>

                    <button
                        className={classNames('button', 'primaryButton', styles.addToCartButton)}
                        onClick={handleAddToCartClick}
                        disabled={isAddingToCart}
                    >
                        Add to Cart
                    </button>

                    {product.additionalInfoSections &&
                        product.additionalInfoSections.length > 0 && (
                            <Accordion
                                className={styles.additionalInfoSections}
                                items={product.additionalInfoSections.map((section) => ({
                                    title: section.title!,
                                    content: section.description ? (
                                        <div
                                            dangerouslySetInnerHTML={{
                                                __html: section.description,
                                            }}
                                        />
                                    ) : null,
                                }))}
                            />
                        )}

                    <ShareProductLinks
                        className={styles.socialLinks}
                        productCanonicalUrl={canonicalUrl}
                    />
                </div>
            </div>
        </div>
    );
}
