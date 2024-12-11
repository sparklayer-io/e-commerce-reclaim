/// <reference types="@remix-run/node" />
/// <reference types="vite/client" />

declare global {
    interface Window {
        spark: any;
        initSpark: any;
    }
}

export {};
