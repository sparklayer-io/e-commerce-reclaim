export interface MemoryCacheOptions {
    /** Time-to-live for cache entries in milliseconds. */
    ttl: number;

    /**
     * Maximum number of entries in the cache. When running in an environment
     * with limited memory, such as Netlify Functions, it's important to limit
     * the cache size to avoid running out of memory.
     */
    maxEntries: number;

    /** Interval in milliseconds between checks for expired cache entries. */
    expiryCheckInterval: number;
}

export class MemoryCache {
    private cache = new Map<string, { value: any; expiry: number }>();
    private lastCheckedExpiry = 0;

    public constructor(private options: MemoryCacheOptions) {}

    public has = (key: string): boolean => {
        this.deleteExpired();
        return this.cache.has(key);
    };

    public get = (key: string): unknown => {
        this.deleteExpired();
        return this.cache.get(key)?.value;
    };

    public set = (key: string, value: unknown) => {
        if (this.cache.size >= this.options.maxEntries) return;
        const expiry = Date.now() + this.options.ttl;
        this.cache.set(key, { value, expiry });
    };

    public delete = (key: string) => {
        this.cache.delete(key);
    };

    /**
     * Replaces a method on an object with a cached version. The method name
     * must be unique per cache instance, and its arguments must be
     * JSON-serializable.
     */
    public wrapMethod = <O>(obj: O, methodName: AsyncMethodName<O>): void => {
        const method = (obj as any)[methodName];
        (obj as any)[methodName] = (...args: unknown[]) => {
            const key = JSON.stringify([methodName, args]);
            if (this.has(key)) return this.get(key);
            const result = method.apply(obj, args).catch((error: unknown) => {
                this.delete(key);
                throw error;
            });
            this.set(key, result);
            return result;
        };
    };

    private deleteExpired = () => {
        const now = Date.now();
        if (now - this.lastCheckedExpiry < this.options.expiryCheckInterval) {
            return;
        }

        this.lastCheckedExpiry = now;
        for (const [key, { expiry }] of this.cache.entries()) {
            if (expiry < now) this.cache.delete(key);
        }
    };
}

type AsyncMethodName<T> = {
    [K in keyof T & string]: T[K] extends (...args: any[]) => Promise<any> ? K : never;
}[keyof T & string];
