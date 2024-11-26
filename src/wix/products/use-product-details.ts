import type { SerializeFrom } from '@remix-run/node';
import { useCallback, useState } from 'react';
import { useCart, useCartOpen } from '../cart';
import { AddToCartOptions, type Product } from '../ecom';
import {
    getMedia,
    getPriceData,
    getProductOptions,
    getSelectedVariant,
    getSKU,
    isOutOfStock,
    selectedChoicesToVariantChoices,
} from './product-details';
import type { productsV3 } from '@wix/stores';

export function useProductDetails(product: Product | SerializeFrom<Product>) {
    const cartOpener = useCartOpen();
    const { addToCart, isAddingToCart } = useCart();

    const getInitialSelectedChoices = () => {
        const result: Record<string, productsV3.ConnectedOptionChoice | undefined> = {};
        for (const option of product.options ?? []) {
            if (option.name) {
                result[option.name] =
                    option.choicesSettings?.choices?.length === 1
                        ? option.choicesSettings?.choices[0]
                        : undefined;
            }
        }

        return result;
    };

    const [selectedChoices, setSelectedChoices] = useState(() => getInitialSelectedChoices());
    const [quantity, setQuantity] = useState(1);
    const [addToCartAttempted, setAddToCartAttempted] = useState(false);

    const outOfStock = isOutOfStock(product, selectedChoices);
    const priceData = getPriceData(product, selectedChoices);
    const sku = getSKU(product, selectedChoices);
    const media = getMedia(product, selectedChoices);
    const productOptions = getProductOptions(product, selectedChoices);

    const handleAddToCart = useCallback(async () => {
        setAddToCartAttempted(true);

        if (Object.values(selectedChoices).includes(undefined)) return;

        const selectedVariant = getSelectedVariant(product, selectedChoices);

        const options: AddToCartOptions =
            product.variantsInfo?.variants && selectedVariant?._id
                ? { variantId: selectedVariant._id }
                : { options: selectedChoicesToVariantChoices(product, selectedChoices) };

        await addToCart(product._id!, quantity, options);
        cartOpener.setIsOpen(true);
    }, [addToCart, cartOpener, product, quantity, selectedChoices]);

    const handleOptionChange = useCallback((optionName: string, newChoice: Choice) => {
        setQuantity(1);
        setSelectedChoices((prev) => ({
            ...prev,
            [optionName]: newChoice,
        }));
    }, []);

    return {
        outOfStock,
        priceData,
        sku,
        media,
        productOptions,
        quantity,
        selectedChoices,
        isAddingToCart,
        addToCartAttempted,
        handleAddToCart,
        handleOptionChange,
        handleQuantityChange: setQuantity,
    };
}
