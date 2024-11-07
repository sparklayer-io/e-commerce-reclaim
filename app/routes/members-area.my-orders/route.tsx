import { redirect, type LoaderFunctionArgs, type MetaFunction } from '@remix-run/node';
import { initializeEcomApiForRequest } from '~/lib/ecom/session';

import styles from './route.module.scss';

export async function loader({ request }: LoaderFunctionArgs) {
    const api = await initializeEcomApiForRequest(request);
    if (!api.isLoggedIn()) {
        return redirect('/login');
    }

    return null;
}

export default function MyOrdersPage() {
    return (
        <div>
            <div className={styles.underConstructionMessage}>This page is under construction</div>
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
