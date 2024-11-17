import React, { useEffect, useMemo } from 'react';
import {
    WixBiAnalytics,
    getDefaultTransports,
    getVisitorId,
    getViewerSessionId,
} from '@codux-pond/analytics';
import { useLocation } from '@remix-run/react';

const WixBiContext = React.createContext<WixBiAnalytics | null>(null);

export function useWixBi() {
    const wbi = React.useContext(WixBiContext);
    if (!wbi) {
        throw new Error('Bi hooks must be used within a WixBiProvider');
    }
    return wbi;
}

export function WixBiProvider({
    children,
    metaSiteId,
    visitorId = getVisitorId(),
    viewerSessionId = getViewerSessionId(),
}: {
    children: React.ReactNode;
    metaSiteId?: string;
    visitorId?: string;
    viewerSessionId?: string;
}) {
    const wixBi = useMemo(
        () =>
            new WixBiAnalytics(
                () => ({
                    metaSiteId,
                    visitorId,
                    viewerSessionId,
                }),
                () => {},
                getDefaultTransports(),
            ),
        [metaSiteId, visitorId],
    );
    useTrackPageView(wixBi);
    return <WixBiContext.Provider value={wixBi}>{children}</WixBiContext.Provider>;
}

export function useTrackPageView(wixBi: WixBiAnalytics) {
    const location = useLocation();
    useEffect(() => wixBi.reportPageView(), [location, wixBi]);
}
