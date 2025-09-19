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
            'spark-product-card': React.DetailedHTMLProps<
                React.HTMLAttributes<HTMLElement>,
                HTMLElement
            >;

            'spark-pdp': {
                'parent-id': string;
                'selected-variant-id'?: string;
                'mode-table-only'?: boolean;
                'mode-all-variants'?: boolean;
                'show-barcode'?: boolean;
                'hide-dropdown'?: string;
                'hide-on-mobile'?: string;
            };

            'spark-product-card': {
                'parent-id': string;
                'selected-variant-id'?: string;
                'mode-quick-buy'?: boolean;
                'show-stock'?: boolean;
                'show-sku'?: boolean;
                'show-barcode'?: boolean;
                'hide-dropdown'?: string;
            };

            'spark-product-matrix': {
                'parent-id': string;
                'show-barcode'?: boolean;
            };

            'spark-product-price': {
                'parent-id': string;
                'exclude-price-breaks'?: boolean;
            };

            'spark-product-rrp': {
                'parent-id': string;
            };
        }
    }
}

export {};
