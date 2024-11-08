import { createCookieSessionStorage } from '@remix-run/node';
import { OauthData, Tokens } from '@wix/sdk';
import {
    createWixClient,
    getWixClientId,
    initializeEcomApiAnonymous,
    initializeEcomApiWithTokens,
} from './api';

export type SessionData = {
    wixSessionTokens: Tokens;
    wixClientId: string;
};

type FlashData = {
    oAuthData: OauthData;
};

const { getSession, commitSession, destroySession } = createCookieSessionStorage<
    SessionData,
    FlashData
>({
    cookie: {
        name: '__session',
        maxAge: 3600 * 24 * 100, // 100 days
        secure: true,
        httpOnly: true,
        sameSite: 'lax',

        secrets: [process.env.SESSION_COOKIE_SIGNING_SECRET ?? 's3cret1'],
    },
});

export { commitSession, destroySession, getSession };

export async function initializeEcomSession(request: Request) {
    const session = await getSession(request.headers.get('Cookie'));

    const sessionWixClientId = session.get('wixClientId');
    const wixClientId = getWixClientId();

    // Retrieve session tokens only if the OAuth client ID matches the one associated with the session;
    // otherwise, reset the session tokens due to client ID mismatch.
    let wixSessionTokens =
        sessionWixClientId === wixClientId ? session.get('wixSessionTokens') : undefined;
    let shouldUpdateSessionCookie = false;

    const client = createWixClient(wixSessionTokens);
    if (wixSessionTokens === undefined) {
        shouldUpdateSessionCookie = true;
        wixSessionTokens = await client.auth.generateVisitorTokens();
        session.set('wixSessionTokens', wixSessionTokens);

        // Store the OAuth client ID in the session to reset user session in case client id changed.
        session.set('wixClientId', wixClientId);
    }

    return { wixSessionTokens, session, shouldUpdateSessionCookie };
}

export async function initializeEcomApiForRequest(request: Request) {
    const { session } = await initializeEcomSession(request);
    const tokens = session.get('wixSessionTokens');
    return tokens ? initializeEcomApiWithTokens(tokens) : initializeEcomApiAnonymous();
}
