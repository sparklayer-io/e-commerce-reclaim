import '~/src/styles/reset.scss';
import '~/src/styles/colors.scss';
import '~/src/styles/typography.scss';
import '~/src/styles/global.scss';
import '~/src/styles/utils.scss';

import { json, LoaderFunctionArgs } from '@remix-run/node';
import {
    Links,
    Meta,
    type MetaFunction,
    Outlet,
    Scripts,
    ScrollRestoration,
    useLoaderData,
} from '@remix-run/react';
import { CartOpenContextProvider } from '~/lib/cart-open-context';
import { EcomApiContextProvider } from '~/lib/ecom';
import { commitSession, initializeEcomSession } from '~/lib/ecom/session';
import { RouteBreadcrumbs } from '~/src/components/breadcrumbs/use-breadcrumbs';
import { Cart } from '~/src/components/cart/cart';
import { Footer } from '~/src/components/footer/footer';
import { Header } from '~/src/components/header/header';

import styles from './root.module.scss';

export async function loader({ request }: LoaderFunctionArgs) {
    const { wixSessionTokens, session, shouldUpdateSessionCookie } =
        await initializeEcomSession(request);

    return json(
        {
            ENV: {
                WIX_CLIENT_ID: process?.env?.WIX_CLIENT_ID,
            },
            wixSessionTokens,
        },
        shouldUpdateSessionCookie
            ? {
                  headers: {
                      'Set-Cookie': await commitSession(session),
                  },
              }
            : undefined,
    );
}

const breadcrumbs: RouteBreadcrumbs = () => [{ title: 'Home', to: '/' }];

export const handle = {
    breadcrumbs,
};

export function Layout({ children }: React.PropsWithChildren) {
    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <Meta />
                <Links />
            </head>
            <body>
                {children}
                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    );
}

export default function App() {
    const { ENV, wixSessionTokens } = useLoaderData<typeof loader>();

    if (typeof window !== 'undefined' && typeof window.ENV === 'undefined') {
        window.ENV = ENV;
    }

    return (
        <EcomApiContextProvider tokens={wixSessionTokens}>
            <CartOpenContextProvider>
                <div className={styles.root}>
                    <Header />
                    <main className={styles.main}>
                        <Outlet />
                    </main>
                    <Footer />
                </div>
                <Cart />
            </CartOpenContextProvider>
        </EcomApiContextProvider>
    );
}

export const meta: MetaFunction = () => {
    const title = 'ReClaim: Home Goods Store';
    const description = 'Essential home products for sustainable living';

    return [
        { title },
        {
            name: 'description',
            content: description,
        },
        {
            property: 'robots',
            content: 'index, follow',
        },
        {
            property: 'og:title',
            content: title,
        },
        {
            property: 'og:description',
            content: description,
        },
        {
            property: 'og:image',
            content: '/social-media-image.jpg',
        },
    ];
};

export { ErrorBoundary } from '~/src/components/error-page/error-page';
