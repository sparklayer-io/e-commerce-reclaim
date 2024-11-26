import { SerializeFrom } from '@remix-run/node';
import { productsV3 as products, type productsV3 } from '@wix/stores';
import deepEqual from 'fast-deep-equal';
import { Product } from '../ecom';

export function isOutOfStock(
    product: Product | SerializeFrom<Product>,
    selectedChoices: Record<string, products.ConnectedOptionChoice | undefined> = {},
): boolean {
    if (product.directCategoryIdsInfo?.categoryIds) {
        const selectedVariant = getSelectedVariant(product, selectedChoices);
        if (selectedVariant !== undefined) {
            return selectedVariant?.inventoryStatus?.inStock === false;
        }
    }

    return (
        product.inventory?.availabilityStatus === products.InventoryAvailabilityStatus.OUT_OF_STOCK
    );
}

export function getPriceData(
    product: Product | SerializeFrom<Product>,
    selectedChoices: Record<string, products.ConnectedOptionChoice | undefined> = {},
): Product['priceData'] {
    if (product.variantsInfo?.variants) {
        const selectedVariant = getSelectedVariant(product, selectedChoices);
        return selectedVariant?.price?.basePrice?.amount;
    }

    return product.basePriceRange;
}

export function getSKU(
    product: Product | SerializeFrom<Product>,
    selectedChoices: Record<string, products.ConnectedOptionChoice | undefined>,
): productsV3.Variant['sku'] {
    if (product.variantsInfo?.variants) {
        const selectedVariant = getSelectedVariant(product, selectedChoices);
        return selectedVariant?.sku ?? product.sku;
    }

    return product.sku;
}

export function getSelectedVariant(
    product: Product | SerializeFrom<Product>,
    selectedChoices: Record<string, products.ConnectedOptionChoice | undefined>,
): products.Variant | undefined {
    const selectedChoiceValues = selectedChoicesToVariantChoices(product, selectedChoices);
    return product.variantsInfo?.variants?.find((variant) =>
        deepEqual(variant.choices, selectedChoiceValues),
    );
}

function getMatchingVariants(
    product: Product | SerializeFrom<Product>,
    selectedChoices: Record<string, products.ConnectedOptionChoice | undefined>,
): products.Variant[] {
    const selectedChoiceValues = selectedChoicesToVariantChoices(product, selectedChoices);

    for (const optionName of Object.keys(selectedChoiceValues)) {
        if (selectedChoiceValues[optionName] === undefined) {
            delete selectedChoiceValues[optionName];
        }
    }

    return (
        product.variantsInfo?.variants?.filter((variant) =>
            deepEqual(variant.choices, {
                ...variant.choices,
                ...selectedChoiceValues,
            }),
        ) ?? []
    );
}

export const getChoiceValue = (
    optionType: products.ProductOptionRenderType,
    choice: products.ConnectedOptionChoice,
): string | undefined => {
    // for color options, `description` field contains color name and `value` field contains hex color representation
    // e-commerce SDK for some actions (adding to cart for example) expects color name as selected color value
    return optionType === products.ProductOptionRenderType.SWATCH_CHOICES
        ? choice.colorCode
        : (choice.name ?? undefined);
};

// selected choices is a map of option names to selected choice objects - {'Size': {value: 'Large', visible: true...}}
// variant choices is a map of option names to selected choice values - {'Size': 'Large'}
// the name 'variant choices' is used because the same data structure is used for the Variant['choices'] property provided by SDK
export const selectedChoicesToVariantChoices = (
    product: Product | SerializeFrom<Product>,
    selectedChoices: Record<string, products.ConnectedOptionChoice | undefined> = {},
): Record<string, string | undefined> => {
    const result: Record<string, string | undefined> = {};
    for (const [optionName, choice] of Object.entries(selectedChoices)) {
        if (!choice) {
            result[optionName] = undefined;
            continue;
        }

        const option = product.options?.find((option) => option.name === optionName);
        if (!option?.optionRenderType) continue;

        result[optionName] = getChoiceValue(option.optionRenderType, choice);
    }

    return result;
};

export function getMedia(
    product: Product | SerializeFrom<Product>,
    selectedChoices: Record<string, products.ConnectedOptionChoice | undefined> = {},
): products.Media | undefined {
    const selectedChoiceWithMedia = Object.values(selectedChoices).find(
        (c) => !!c?.linkedMedia?.length,
    );
    return selectedChoiceWithMedia?.linkedMedia?.[0] ?? product.media;
}

/**
 * returns a copy of product options array with populated availability information (visible, inStock)
 * considering currently selected option choices and available product variants
 */
export function getProductOptions(
    product: Product | SerializeFrom<Product>,
    selectedChoices: Record<string, products.ConnectedOptionChoice | undefined>,
): products.ConnectedOptionChoice[] | undefined {
    return product.options?.map((option) => {
        return {
            ...option,
            choices: option.choicesSettings?.choices?.map((choice) => ({
                ...choice,
                ...getChoiceAvailabilityInfo(choice, option, selectedChoices, product),
            })),
        };
    });
}

function getChoiceAvailabilityInfo(
    choice: products.ConnectedOptionChoice,
    option: products.ConnectedOption,
    selectedChoices: Record<string, products.ConnectedOptionChoice | undefined>,
    product: Product | SerializeFrom<Product>,
): Pick<products.ConnectedOptionChoice, 'visible' | 'inStock'> {
    if (!product.variantsInfo?.variants || !option.name || !option.optionRenderType) {
        return {
            visible: choice.visible,
            inStock: choice.inStock,
        };
    }

    // Get variants matching all other selected choices and target choice
    const matchingVariants = getMatchingVariants(product, {
        ...selectedChoices,
        [option.name]: choice,
    });

    return {
        visible: matchingVariants.some((variant) => variant?.visible),
        inStock: matchingVariants.some(
            (variant) => variant.visible && variant.inventoryStatus?.inStock,
        ),
    };
}

export function formatPrice(price: number, currency: string): string {
    const formatter = Intl.NumberFormat('en-US', {
        currency,
        style: 'currency',
        currencyDisplay: 'narrowSymbol',
        minimumFractionDigits: 2,
    });

    return formatter.format(price);
}
