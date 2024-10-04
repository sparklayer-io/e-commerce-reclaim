import { useCallback, useEffect, useState } from 'react';
import { useNavigation } from '@remix-run/react';
import { IProductFilters } from '~/api/types';
import { formatPrice } from '~/utils';
import { Accordion } from '../accordion/accordion';
import { RangeSlider } from '../range-slider/range-slider';

interface ProductFiltersProps {
    appliedFilters: IProductFilters;
    onFiltersChange: (filters: IProductFilters) => void;
    lowestPrice: number;
    highestPrice: number;
    currency: string;
}

export const ProductFilters = ({
    appliedFilters,
    onFiltersChange,
    lowestPrice,
    highestPrice,
    currency,
}: ProductFiltersProps) => {
    const navigation = useNavigation();

    // Allows updating the UI optimistically while Remix navigates to the URL
    // with updated parameters.
    const [filters, setFilters] = useState(appliedFilters);

    const handleFiltersChange = (changed: Partial<IProductFilters>) => {
        const newFilters = { ...filters, ...changed };
        setFilters(newFilters);
        onFiltersChange(newFilters);
    };

    const formatPriceValue = useCallback(
        (price: number) => formatPrice(price, currency),
        [currency],
    );

    // Synchronize filters on back/forward browser button clicks.
    useEffect(() => {
        if (navigation.state !== 'loading') {
            setFilters(appliedFilters);
        }
    }, [navigation.state, appliedFilters]);

    return (
        <Accordion
            small
            items={[
                {
                    title: 'Price',
                    content: (
                        <RangeSlider
                            className="rangeSlider"
                            startValue={filters.minPrice ?? lowestPrice}
                            endValue={filters.maxPrice ?? highestPrice}
                            onStartValueChange={(value) => {
                                handleFiltersChange({ minPrice: value });
                            }}
                            onEndValueChange={(value) => {
                                handleFiltersChange({ maxPrice: value });
                            }}
                            minValue={lowestPrice}
                            maxValue={highestPrice}
                            formatValue={formatPriceValue}
                        />
                    ),
                },
            ]}
        />
    );
};
