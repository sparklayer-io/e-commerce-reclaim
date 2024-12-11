import { useEffect, useState } from 'react';

const defaultStyles = `
:root {
  /* Set the brand styling */
  --b2b-brand-color: #000; /* Main brand colour */
  --b2b-brand-color-hover: #333; /* Main brand colour hover */
  --b2b-brand-font: Arial, sans-serif; /* Main brand font */
  --b2b-brand-font-heading: Arial, sans-serif; /* Main brand heading font */

  /* Update colours */
  --spark-default-body-color: #555555; /* Main body colour */
  --spark-primary-color: #000000; /* Main title colour */
  --spark-secondary-color: var(--b2b-brand-color); /* Main highlight colour */
  --spark-link-color: var(--b2b-brand-color); /* Link colour */

  /* Typefaces */
  --spark-font-default: var(--b2b-brand-font); /* Body typeface */
  --spark-font-highlight: var(--b2b-brand-font-heading); /* Highlight typeface */
  --spark-font-weight-default: 400; /* Default font weight */
  --spark-font-weight-medium: 500; /* Medium font weight */
  --spark-font-weight-heavy: 600; /* Bold font weight */

  /* General */
  --spark-border-radius-default: 0; /* Default border radius */
  --spark-drawer-max-width: 700px; /* Width of overlay */
  --spark-drawer-max-width-wide: 1000px; /* Width of overlay in maximised view */

  /* Font sizes */
  --spark-font-default-size: 14px; /* Default font size*/
  --spark-font-default-size-small: 14px; /* Default font size - small screens */
  --spark-header-font: var(--b2b-brand-font-heading); /* Header typeface */
  --spark-header-font-weight: 500; /* Header font weight */
  --spark-h1-fontsize: 24px; /* Header 1 font size */
  --spark-h2-fontsize: 22px; /* Header 2 font size */
  --spark-h3-fontsize: 20px; /* Header 3 font size */
  --spark-h4-fontsize: 16px; /* Header 4 font size */
  --spark-h5-fontsize: 15px; /* Header 5 font size */
  --spark-h6-fontsize: 14px; /* Header 6 font size */

  --spark-pricing-fontsize: 20px; /* Font size of pricing */
  --spark-pricing-font-weight: 500; /* Font weight of pricing */
  --spark-pricing-fontsize-small: 14px; /* Font size of pricing on mobile */

  --spark-product-code-fontsize: 16px; /* Font size of product code */
  --spark-product-code-font-weight: 500; /* Font weight of product code */
  --spark-product-code-fontsize-small: 14px; /* Font size of product code on mobile */
  --spark-product-stockstatus-align: flex-start; /* Alignment of stock status for single variants */

  /* Buttons */
  --spark-button-font-family: var(--b2b-brand-font-heading); /* Button typeface */
  --spark-button-color: var(--b2b-brand-color); /* Default sutton colour */
  --spark-button-color-highlight: var(--b2b-brand-color-hover); /* Default button colour hover */
  --spark-button-large-color: var(--b2b-brand-color); /* Large button colour */
  --spark-button-large-color-highlight: var(--b2b-brand-color-hover); /* Large button colour hover */
  --spark-border-radius-button: 0; /* Button border radius */
  --spark-button-font-weight: 600; /* Button font weight */
  --spark-button-text-transform: none; /* Button text transform */
  --spark-button-text-letter-spacing: 0; /* Button letter spacing */
  --spark-button-padding: 1em 2.75em; /* Button padding */
  --spark-button-small-font-size: 16px; /* Small button font size */

  /* Tables */
  --spark-table-border-color: #CCCCCC; /* Table border colour */
  --spark-table-header-background-color: #F1F1F1; /* Table header background */
  --spark-table-header-text-color: #222222; /* Table header font colour */
  --spark-table-header-font-weight: 500; /* Table header font weight */

  /* Product Card */
  --spark-product-card-button-radius: 0; /* Button radius */
  --spark-product-card-button-padding: 0.75em 1em; /* Button padding */
  --spark-product-card-pricing-font-size: 15px; /* Pricing font size */
  --spark-product-card-pricing-font-size-small: 14px; /* Pricing font size on mobile */
  --spark-product-card-select-min-height: 0; /* Set a min-height for select menu */
}
`;

const defaultOptions = {
    platform: 'wix',
    siteId: 'tomcodux',
    sparkDomain: 'https://app.dev.sparklayer.io',

    // CSS selector for cart button usually located in header
    cartButtonSelectors: '',
    // CSS selector for account button usually located in header
    accountButtonSelectors: '',
};

export function SparkLayer({
    customer,
    authenticationMetafield,
    options,
    onLogout,
    siteId,
    siteEnv,
    styles = defaultStyles,
}: {
    customer: any;
    authenticationMetafield: any;
    options?: any;
    onLogout: any;
    siteId: string;
    siteEnv: string;
    styles?: any;
}) {
    const _options = { ...defaultOptions, ...options };

    const [sparkInitialised, setSparkInitialised] = useState<boolean>(false);
    const [sparkLoaded, setSparkLoaded] = useState<boolean>(false);

    useEffect(() => {
        return;

        if (
            sparkInitialised ||
            customer === null ||
            !authenticationMetafield.finished ||
            !sparkLoaded ||
            window.spark
        ) {
            return;
        }

        const s = document.createElement('style');
        s.innerHTML = styles;
        document.head.appendChild(s);

        window.spark = window.initSpark({
            ..._options,
            onLogout,
            auth: {
                user: customer?.email,
                token: authenticationMetafield.metafield?.value,
            },
        });

        setSparkInitialised(true);
    }, [customer, authenticationMetafield, sparkLoaded]);

    // if (customer === null || !customer.tags.includes('b2b')) {
    //     return null;
    // }

    return (
        <script
            id="spark-script"
            async
            // type="text/javascript"
            type="module"
            //  src={`https://dev.sparkcdn.io/sparkjs/${siteId}/${siteEnv}`}
            src="http://localhost:8005/spark.ts"
            onLoad={() => setSparkLoaded(true)}
        />
    )
}