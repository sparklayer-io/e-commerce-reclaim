import { LoaderFunctionArgs, redirect } from '@remix-run/node';
import { commitSession, getSession, initializeEcomApiForRequest } from '~/src/wix/ecom/session';

export async function loader({ request }: LoaderFunctionArgs) {
    const currentUrl = new URL(request.url);
    const returnUrl = request.headers.get('Referer') ?? currentUrl.origin;

    const api = await initializeEcomApiForRequest(request);
    const { oAuthData, authUrl } = await api.login(
        `${currentUrl.origin}/login-callback`,
        returnUrl,
    );

    const session = await getSession(request.headers.get('Cookie'));

    session.flash('oAuthData', oAuthData);

    return redirect(authUrl, {
        headers: {
            'Set-Cookie': await commitSession(session),
        },
    });
}
