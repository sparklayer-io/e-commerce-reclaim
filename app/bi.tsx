import { useEffect } from 'react';
import * as WixBiImport from '@codux-pond/analytics';
import { useLocation } from '@remix-run/react';

if (typeof window !== 'undefined') {
    window.WixBi = WixBiImport;
}

declare global {
    // eslint-disable-next-line no-var
    var WixBi: typeof WixBiImport;
    // eslint-disable-next-line no-var
    var wixBiAnalytics: WixBiImport.WixBiAnalytics;
    // eslint-disable-next-line no-var
    var ENABLE_BI_IN_DEV: boolean;
    // eslint-disable-next-line no-var
    var reportInitialPageView: () => void;
}

export function BiScript(props: { metaSiteId: string; visitorId: string }) {
    return <script dangerouslySetInnerHTML={{ __html: initBiScript(props) }} />;
}

function initBiScript({ metaSiteId, visitorId }: { metaSiteId: string; visitorId: string }) {
    return `
globalThis.onload = () =>{
    const { WixBiAnalytics, beaconTransport } = globalThis.WixBi;
    globalThis.ENABLE_BI_IN_DEV = true;
    globalThis.wixBiAnalytics = new WixBiAnalytics(
        [beaconTransport],
        () => ({
            metaSiteId: '${metaSiteId}',
            visitorId: '${visitorId}',
        }),
    );
    globalThis.reportInitialPageView?.();
}
`;
}

export function useTrackPageView() {
    const location = useLocation();
    // const { ENV, wixEcomTokens } = useLoaderData<typeof loader>();
    useEffect(() => {
        async function reportPageView() {
            globalThis.wixBiAnalytics.reportPageView({});
        }
        if (globalThis.wixBiAnalytics) {
            reportPageView();
        }
        globalThis.reportInitialPageView = reportPageView;
    }, [location]);
}
