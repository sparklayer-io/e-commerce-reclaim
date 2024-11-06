import type { MetaFunction } from '@remix-run/node';
import styles from './route.module.scss';

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
