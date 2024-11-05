import type { LoaderFunctionArgs } from '@remix-run/node';
import { isRouteErrorResponse, useLoaderData, useNavigate, useRouteError } from '@remix-run/react';
import type { GetStaticRoutes } from '@wixc3/define-remix-app';
import classNames from 'classnames';
import { initializeEcomApiAnonymous } from '~/lib/ecom';
import { initializeEcomApiForRequest } from '~/lib/ecom/session';
import { useProductDetails } from '~/lib/hooks';
import { getErrorMessage, removeQueryStringFromUrl } from '~/lib/utils';
import { Accordion } from '~/src/components/accordion/accordion';
import { BreadcrumbData, Breadcrumbs } from '~/src/components/breadcrumbs/breadcrumbs';
import { RouteBreadcrumbs, useBreadcrumbs } from '~/src/components/breadcrumbs/use-breadcrumbs';
import { ErrorPage } from '~/src/components/error-page/error-page';
import { MinusIcon, PlusIcon } from '~/src/components/icons';
import { ProductImages } from '~/src/components/product-images/product-images';
import { ProductOption } from '~/src/components/product-option/product-option';
import { ProductPrice } from '~/src/components/product-price/product-price';
import { QuantityInput } from '~/src/components/quantity-input/quantity-input';
import { ShareProductLinks } from '~/src/components/share-product-links/share-product-links';

import styles from './route.module.scss';

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
    if (!params.productSlug) throw new Response('Bad Request', { status: 400 });
    const api = await initializeEcomApiForRequest(request);
    const product = await api.getProductBySlug(params.productSlug);
    if (!product) throw new Response('Product Not Found', { status: 404 });
    return { product, canonicalUrl: removeQueryStringFromUrl(request.url) };
};

export const getStaticRoutes: GetStaticRoutes = async () => {
    const api = initializeEcomApiAnonymous();
    const { items } = await api.getProducts();
    return items.map((product) => `/product-details/${product.slug}`);
};

interface ProductDetailsLocationState {
    fromCategory?: {
        name: string;
        slug: string;
    };
}

const breadcrumbs: RouteBreadcrumbs<typeof loader, ProductDetailsLocationState> = (
    match,
    location,
) => {
    const fromCategory = location.state?.fromCategory;

    const breadcrumbs: BreadcrumbData[] = [
        {
            title: match.data.product.name!,
            to: `/product-details/${match.data.product.slug}`,
        },
    ];

    if (fromCategory) {
        breadcrumbs.unshift({
            title: fromCategory.name,
            to: `/products/${fromCategory.slug}`,
            clientOnly: true,
        });
    }

    return breadcrumbs;
};

export const handle = {
    breadcrumbs,
};

export default function ProductDetailsPage() {
    const { product, canonicalUrl } = useLoaderData<typeof loader>();

    const {
        outOfStock,
        priceData,
        sku,
        media,
        productOptions,
        quantity,
        selectedChoices,
        isAddingToCart,
        addToCartAttempted,
        handleAddToCart,
        handleOptionChange,
        handleQuantityChange,
    } = useProductDetails(product);

    const breadcrumbs = useBreadcrumbs();

    return (
        <div className={styles.page}>
            <Breadcrumbs breadcrumbs={breadcrumbs} />

            <div className={styles.content}>
                <ProductImages media={media} />

                <div>
                    <h1 className={styles.productName}>{product.name}</h1>
                    {sku && <p className={styles.sku}>SKU: {sku}</p>}

                    {priceData && (
                        <ProductPrice
                            className={styles.price}
                            price={priceData.formatted?.price}
                            discountedPrice={priceData.formatted?.discountedPrice}
                        />
                    )}

                    {product.description && (
                        <div
                            className={styles.description}
                            dangerouslySetInnerHTML={{ __html: product.description }}
                        />
                    )}

                    {productOptions && productOptions.length > 0 && (
                        <div className={styles.productOptions}>
                            {productOptions.map((option) => (
                                <ProductOption
                                    key={option.name}
                                    error={
                                        addToCartAttempted &&
                                        selectedChoices[option.name!] === undefined
                                            ? `Select ${option.name}`
                                            : undefined
                                    }
                                    option={option}
                                    selectedChoice={selectedChoices[option.name!]}
                                    onChange={(choice) => handleOptionChange(option.name!, choice)}
                                />
                            ))}
                        </div>
                    )}

                    <div className={styles.quantity}>
                        <label htmlFor="quantity" className={styles.quantityLabel}>
                            Quantity
                        </label>
                        <QuantityInput
                            id="quantity"
                            value={quantity}
                            onChange={handleQuantityChange}
                            disabled={outOfStock}
                        />
                    </div>

                    <button
                        className={classNames('button', 'primaryButton', styles.addToCartButton)}
                        onClick={handleAddToCart}
                        disabled={outOfStock || isAddingToCart}
                    >
                        {outOfStock ? 'Out of stock' : 'Add to Cart'}
                    </button>

                    {product.additionalInfoSections &&
                        product.additionalInfoSections.length > 0 && (
                            <Accordion
                                className={styles.additionalInfoSections}
                                expandIcon={<PlusIcon width={22} />}
                                collapseIcon={<MinusIcon width={22} />}
                                items={product.additionalInfoSections.map((section) => ({
                                    header: (
                                        <div className={styles.additionalInfoSectionTitle}>
                                            {section.title!}
                                        </div>
                                    ),
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

export function ErrorBoundary() {
    const error = useRouteError();
    const navigate = useNavigate();

    let title = 'Error';
    let message = getErrorMessage(error);

    if (isRouteErrorResponse(error) && error.status === 404) {
        title = 'Product Not Found';
        message = "Unfortunately a product page you trying to open doesn't exist";
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
