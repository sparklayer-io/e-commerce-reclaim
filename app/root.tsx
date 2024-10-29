import {
    isRouteErrorResponse,
    Links,
    Meta,
    type MetaFunction,
    Outlet,
    Scripts,
    ScrollRestoration,
    useLoaderData,
    useNavigate,
    useNavigation,
    useRouteError,
} from '@remix-run/react';
import { useEffect } from 'react';
import { EcomAPIContextProvider } from '~/lib/ecom';
import { CartOpenContextProvider } from '~/lib/cart-open-context';
import { getErrorMessage, routeLocationToUrl } from '~/lib/utils';
import { ErrorPage } from '~/src/components/error-page/error-page';
import { SiteWrapper } from '~/src/components/site-wrapper/site-wrapper';
import { RouteBreadcrumbs } from '~/src/components/breadcrumbs/use-breadcrumbs';

import '~/src/styles/reset.scss';
import '~/src/styles/colors.scss';
import '~/src/styles/typography.scss';
import '~/src/styles/common.scss';
import '~/src/styles/index.scss';

export const meta: MetaFunction = () => {
    return [{ title: 'ReClaim: Home Goods Store' }];
};

export async function loader() {
    return {
        ENV: {
            WIX_CLIENT_ID: process?.env?.WIX_CLIENT_ID,
        },
    };
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

function ContentWrapper({ children }: React.PropsWithChildren) {
    return (
        <EcomAPIContextProvider>
            <CartOpenContextProvider>
                <SiteWrapper>{children}</SiteWrapper>
            </CartOpenContextProvider>
        </EcomAPIContextProvider>
    );
}

export default function App() {
    const data = useLoaderData<typeof loader>();

    if (typeof window !== 'undefined' && typeof window.ENV === 'undefined') {
        window.ENV = data.ENV;
    }

    return (
        <ContentWrapper>
            <Outlet />
        </ContentWrapper>
    );
}

export function ErrorBoundary() {
    const error = useRouteError();
    const navigation = useNavigation();

    useEffect(() => {
        if (navigation.state === 'loading') {
            const url = routeLocationToUrl(navigation.location, window.location.origin);
            // force full page reload after navigating from error boundary
            // to fix remix issue with style tags disappearing
            window.location.assign(url);
        }
    }, [navigation]);

    const navigate = useNavigate();

    const isPageNotFoundError = isRouteErrorResponse(error) && error.status === 404;

    return (
        <ContentWrapper>
            <ErrorPage
                title={isPageNotFoundError ? 'Page Not Found' : 'Oops, something went wrong'}
                message={isPageNotFoundError ? undefined : getErrorMessage(error)}
                actionButtonText="Back to shopping"
                onActionButtonClick={() => navigate('/products/all-products')}
            />
        </ContentWrapper>
    );
}
