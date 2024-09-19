import {
    Links,
    Link,
    Meta,
    Outlet,
    Scripts,
    ScrollRestoration,
    useLoaderData,
} from '@remix-run/react';
import { json } from '@remix-run/node';
import { SiteWrapper } from '~/components/site-wrapper/site-wrapper';
import { ROUTES } from '~/router/config';
import { RouteHandle } from '~/router/types';
import { EcomAPIContextProvider } from '~/api/ecom-api-context-provider';
import { CartOpenContextProvider } from '~/components/cart/cart-open-context';
import '~/styles/index.scss';

export async function loader() {
    return json({
        ENV: {
            WIX_CLIENT_ID: process?.env?.WIX_CLIENT_ID,
        },
    });
}

export const handle: RouteHandle = {
    breadcrumb: () => <Link to={ROUTES.home.path}>Home</Link>,
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
    const data = useLoaderData<typeof loader>();

    if (typeof window !== 'undefined' && typeof window.ENV === 'undefined') {
        window.ENV = data.ENV;
    }

    return (
        <EcomAPIContextProvider>
            <CartOpenContextProvider>
                <SiteWrapper>
                    <Outlet />
                </SiteWrapper>
            </CartOpenContextProvider>
        </EcomAPIContextProvider>
    );
}
