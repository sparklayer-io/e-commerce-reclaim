import { createRemixStub } from '@remix-run/testing';
import { PropsWithChildren } from 'react';
import { EcomAPIContextProvider } from '~/lib/ecom';
import { ROUTES } from '~/src/router/config';

export interface ComponentWrapperProps extends PropsWithChildren {
    loaderData?: Record<string, unknown>;
}

export default function ComponentWrapper({ children, loaderData }: ComponentWrapperProps) {
    const RemixStub = createRemixStub([
        {
            Component: () => children,
            children: Object.values(ROUTES).map(({ path }) => ({ path })),
        },
    ]);

    return (
        <EcomAPIContextProvider>
            <RemixStub hydrationData={{ loaderData }} />
        </EcomAPIContextProvider>
    );
}
