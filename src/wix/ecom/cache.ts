type CacheEntry = {
    callInProgress: Promise<unknown> | null;
    savedAt: number;
    value: unknown;
};

/**
 * A caching utility class to wrap asynchronous methods and cache their results
 * with expiration and limited entry control.
 */
export class Cache {
    private maxCachedEntries = 10000;
    private cacheTimeout = 1000 * 60 * 1; // one minute
    private cache = new Map<string, CacheEntry>();
    private cacheKeyByRequestTime: string[] = [];

    public wrapWithCache<M extends (...args: any[]) => Promise<any>>(
        createCacheKey: (...args: Parameters<M>) => string,
        method: M,
    ) {
        return (async (...args: Parameters<M>) => {
            const cacheKey = createCacheKey(...args);
            const cacheEntry = this.cache.get(cacheKey);
            let result;
            if (cacheEntry) {
                if (cacheEntry.callInProgress && !cacheEntry.value) {
                    // wait for existing call to finish
                    result = await cacheEntry.callInProgress;
                } else {
                    // return cached value
                    result = cacheEntry.value;
                }
                // if cache is outdated, refresh it
                if (
                    !cacheEntry.callInProgress &&
                    Date.now() - cacheEntry.savedAt > this.cacheTimeout
                ) {
                    const callToValue = method.apply(this, args);
                    cacheEntry.callInProgress = callToValue;
                    callToValue
                        .then((newResult) => {
                            this.updateCache(cacheKey, newResult);
                        })
                        .catch(() => {
                            cacheEntry.callInProgress = null;
                        });
                }
            } else {
                const cacheEntry = this.createCacheEntry(cacheKey);
                const valuePromise = method.apply(this, args);
                cacheEntry.callInProgress = valuePromise;
                result = await valuePromise.catch((e) => {
                    // clear cache entry in case of error
                    this.cache.delete(cacheKey);
                    throw e;
                });
                this.updateCache(cacheKey, result);
            }
            return result;
        }) as M;
    }
    private createCacheEntry(id: string) {
        const cacheEntry: CacheEntry = { callInProgress: null, value: null, savedAt: Date.now() };
        this.cache.set(id, cacheEntry);
        return cacheEntry;
    }
    private updateCache(key: string, newValue: unknown) {
        const cacheEntry = this.cache.get(key) || this.createCacheEntry(key);
        // update entry
        cacheEntry.callInProgress = null;
        cacheEntry.value = newValue;
        cacheEntry.savedAt = Date.now();
        // advance entry usage and clean excess entries
        const index = this.cacheKeyByRequestTime.indexOf(key);
        if (index !== -1) {
            this.cacheKeyByRequestTime.splice(index, 1);
        }
        this.cacheKeyByRequestTime.unshift(key);
        for (const entryKeyToRemove of this.cacheKeyByRequestTime.splice(this.maxCachedEntries)) {
            this.cache.delete(entryKeyToRemove);
        }
    }
}
