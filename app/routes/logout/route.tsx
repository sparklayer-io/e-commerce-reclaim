import { LoaderFunctionArgs, redirect } from '@remix-run/node';
import { destroySession, getSession, initializeEcomApiForRequest } from '~/lib/ecom/session';

export async function loader({ request }: LoaderFunctionArgs) {
    const api = await initializeEcomApiForRequest(request);

    const currentUrl = new URL(request.url);
    const { logoutUrl } = await api.logout(currentUrl.origin);

    const session = await getSession(request.headers.get('Cookie'));
    return redirect(logoutUrl, {
        headers: {
            'Set-Cookie': await destroySession(session),
        },
    });
}
