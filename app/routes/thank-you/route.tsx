import { useLoaderData, json, isRouteErrorResponse, useRouteError } from '@remix-run/react';
import type { LoaderFunctionArgs } from '@remix-run/node';
import { getEcomApi } from '~/api/ecom-api';
import { CategoryLink } from '~/components/category-link/category-link';
import { OrderSummary } from '~/components/order-summary/order-summary';
import styles from './thank-you.module.scss';
import { ErrorPage } from '~/components/error-page/error-page';
import { OrderDetails } from '~/api/types';

export const loader = async ({
    request,
}: LoaderFunctionArgs): Promise<{ order?: OrderDetails }> => {
    const orderId = new URL(request.url).searchParams.get('orderId');
    // Show "Thank you" page even without order details.
    if (!orderId) return { order: undefined };

    const orderResponse = await getEcomApi().getOrder(orderId);
    if (orderResponse.status === 'failure') throw json(orderResponse.error);

    return { order: orderResponse.body };
};

export default function ThankYouPage() {
    const { order } = useLoaderData<typeof loader>();

    return (
        <div className={styles.root}>
            <h1 className="heading4">Thank You!</h1>
            <div className={styles.subtitle}>You&apos;ll receive a confirmation email soon.</div>

            {order && (
                <>
                    <div className={styles.orderNumber}>Order number: {order.number}</div>
                    <OrderSummary order={order} />
                </>
            )}

            <CategoryLink categorySlug="all-products" className={styles.link}>
                Continue Browsing
            </CategoryLink>
        </div>
    );
}

export function ErrorBoundary() {
    const error = useRouteError();
    if (!isRouteErrorResponse(error)) throw error;
    return <ErrorPage title="Failed to load order details" message={error.data.message} />;
}
