import { Links, Link, Meta, Outlet, Scripts, ScrollRestoration } from '@remix-run/react';
import '~/styles/index.scss';
import { SiteWrapper } from '~/components/site-wrapper/site-wrapper';
import { ROUTES } from '~/router/config';
import { RouteHandle } from '@remix-run/react/dist/routeModules';

export const handle: RouteHandle = {
    breadcrumb: () => <Link to={ROUTES.home.path}>Home</Link>,
};

export default function App() {
    return (
        <html lang="en">
            <head>
                <meta charSet="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <Meta />
                <Links />
            </head>
            <body>
                <SiteWrapper>
                    <Outlet />
                </SiteWrapper>
                <ScrollRestoration />
                <Scripts />
            </body>
        </html>
    );
}
