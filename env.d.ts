/// <reference types="@remix-run/node" />
/// <reference types="vite/client" />

declare global {
    interface Window {
        spark: any;
        initSpark: any;
    }

    namespace JSX {
        interface IntrinsicElements {
            'spark-pdp': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
            'spark-product-card': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
        }
    }
}

export {};
