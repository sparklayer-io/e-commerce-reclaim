import { useCallback, useMemo } from 'react';
import { IProductFilters } from '~/api/types';
import {
    productFiltersFromSearchParams,
    searchParamsFromProductFilters,
} from '~/api/product-filters';
import { formatPrice, mergeUrlSearchParams } from '~/utils';
import { useSearchParamsOptimistic } from '~/utils/use-search-params-state';
import { Accordion } from '../accordion/accordion';
import { RangeSlider } from '../range-slider/range-slider';

interface ProductFiltersProps {
    lowestPrice: number;
    highestPrice: number;
    currency: string;
}

export const ProductFilters = ({ lowestPrice, highestPrice, currency }: ProductFiltersProps) => {
    const [searchParams, setSearchParams] = useSearchParamsOptimistic();

    const filters = useMemo(() => productFiltersFromSearchParams(searchParams), [searchParams]);

    const handleFiltersChange = (changed: Partial<IProductFilters>) => {
        const newParams = searchParamsFromProductFilters({ ...filters, ...changed });
        setSearchParams((params) => mergeUrlSearchParams(params, newParams), {
            preventScrollReset: true,
        });
    };

    const formatPriceValue = useCallback(
        (price: number) => formatPrice(price, currency),
        [currency],
    );

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
