import { redirect, type LoaderFunctionArgs, type MetaFunction } from '@remix-run/node';
import { initializeEcomApiForRequest } from '~/lib/ecom/session';
import { useLoaderData } from '@remix-run/react';
import { OrderSummary } from '~/src/components/order-summary/order-summary';
import { Accordion } from '~/src/components/accordion/accordion';
import { CategoryLink } from '~/src/components/category-link/category-link';

import styles from './route.module.scss';

export async function loader({ request }: LoaderFunctionArgs) {
    const api = await initializeEcomApiForRequest(request);
    if (!api.isLoggedIn()) {
        return redirect('/login');
    }

    const ordersResponse = await api.getOrders();
    return { orders: ordersResponse.items };
}

export default function MyOrdersPage() {
    const { orders } = useLoaderData<typeof loader>();

    const formatOrderCreationDate = (date: Date) =>
        date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });

    const accordionItems = orders.map((order) => ({
        header: (
            <div className={styles.orderHeader}>
                <div className={styles.orderHeaderSection}>
                    <span className={styles.orderHeaderSectionName}>Date: </span>
                    {formatOrderCreationDate(new Date(order._createdDate!))}
                </div>
                <div className={styles.orderHeaderSection}>
                    <span className={styles.orderHeaderSectionName}>Order: </span>
                    {order.number}
                </div>
                <div className={styles.orderHeaderSection}>
                    <span className={styles.orderHeaderSectionName}>Status: </span>
                    {order.status}
                </div>
                <div className={styles.orderHeaderSection}>
                    <span className={styles.orderHeaderSectionName}>Total: </span>
                    {order.priceSummary?.total?.formattedAmount}
                </div>
            </div>
        ),
        content: <OrderSummary key={order._id} order={order} />,
    }));

    return (
        <div>
            <div className={styles.pageHeader}>
                <div className={styles.title}>My Orders</div>
                <div className={styles.message}>
                    View your order history or check the status of a recent order.
                </div>
            </div>
            <div className={styles.orders}>
                {orders.length > 0 ? (
                    <>
                        <div className={styles.orderListHeader}>
                            <div className={styles.orderListHeaderSection}>Date</div>
                            <div className={styles.orderListHeaderSection}>Order</div>
                            <div className={styles.orderListHeaderSection}>Status</div>
                            <div className={styles.orderListHeaderSection}>Total</div>
                        </div>
                        <Accordion items={accordionItems} className={styles.orderList} />
                    </>
                ) : (
                    <div className={styles.emptyStateContainer}>
                        <div className={styles.emptyStateMessage}>
                            {"You haven't placed any orders yet"}
                        </div>
                        <CategoryLink
                            categorySlug="all-products"
                            className={styles.startBrowsingLink}
                        >
                            Start Browsing
                        </CategoryLink>
                    </div>
                )}
            </div>
        </div>
    );
}

export const meta: MetaFunction = () => {
    return [
        { title: 'My Orders | ReClaim' },
        {
            name: 'description',
            content: 'Essential home products for sustainable living',
        },
        {
            property: 'robots',
            content: 'noindex, nofollow',
        },
    ];
};

export { ErrorBoundary } from '~/src/components/error-page/error-page';
