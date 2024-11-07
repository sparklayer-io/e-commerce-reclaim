import { LoaderFunctionArgs, redirect } from '@remix-run/node';
import type { MetaFunction } from '@remix-run/react';
import { initializeEcomApiForRequest } from '~/lib/ecom/session';

import styles from './route.module.scss';

export async function loader({ request }: LoaderFunctionArgs) {
    const api = await initializeEcomApiForRequest(request);
    if (!api.isLoggedIn()) {
        return redirect('/login');
    }

    return null;
}

export default function MyAccountPage() {
    return (
        <div>
            <div className={styles.underConstructionMessage}>This page is under construction</div>
        </div>
    );
}

export const meta: MetaFunction = () => {
    return [
        { title: 'My Account | ReClaim' },
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
