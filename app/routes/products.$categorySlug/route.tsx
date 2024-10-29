import type { LoaderFunctionArgs, SerializeFrom } from '@remix-run/node';
import { isRouteErrorResponse, useLoaderData, useNavigate, useRouteError } from '@remix-run/react';
import { Product } from '@wix/stores_products';
import { getProductsRouteData } from '~/lib/route-loaders';
import { getErrorMessage } from '~/lib/utils';
import { RouteBreadcrumbs } from '~/src/components/breadcrumbs/use-breadcrumbs';
import { ErrorPage } from '~/src/components/error-page/error-page';
import { ROUTES } from '~/src/router/config';
import { ProductIterator } from '../../../src/components/product-iterator/product-iterator';
import { ProductView1 } from '../../../src/components/product-view-1/product-view-1';

export const loader = ({ params, request }: LoaderFunctionArgs) => {
    return getProductsRouteData(params.categorySlug, request.url);
};

const breadcrumbs: RouteBreadcrumbs<typeof loader> = (match) => [
    {
        title: match.data.category.name!,
        to: ROUTES.products.to(match.data.category.slug!),
    },
];

export const handle = {
    breadcrumbs,
};

export default function ProductsPage() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const loadProducts: () => SerializeFrom<{
        categoryProducts: {
            items: Product[];
            totalCount: number;
        };
    }> = useLoaderData<typeof loader>;
    return <div>list of all products</div>;
}

export function ErrorBoundary() {
    const error = useRouteError();
    const navigate = useNavigate();

    let title = 'Error';
    let message = getErrorMessage(error);

    // if (isRouteErrorResponse(error) && error.data.code === EcomApiErrorCodes.CategoryNotFound) {
    if (isRouteErrorResponse(error)) {
        title = 'Category Not Found';
        message = "Unfortunately, the category page you're trying to open does not exist";
    }

    return (
        <ErrorPage
            title={title}
            message={message}
            actionButtonText="Back to shopping"
            onActionButtonClick={() => navigate(ROUTES.products.to('all-products'))}
        />
    );
}
