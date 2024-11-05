import { useCallback, useMemo } from 'react';
import {
    IProductFilters,
    productFiltersFromSearchParams,
    searchParamsFromProductFilters,
} from '~/lib/ecom';
import { RangeSlider } from '~/lib/components/range-slider/range-slider';
import { formatPrice, mergeUrlSearchParams } from '~/lib/utils';
import { useSearchParamsOptimistic } from '~/lib/hooks';
import { Accordion } from '../accordion/accordion';
import { MinusIcon, PlusIcon } from '../icons';

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
            expandIcon={<PlusIcon width={20} />}
            collapseIcon={<MinusIcon width={20} />}
            items={[
                {
                    header: 'Price',
                    content: (
                        <RangeSlider
                            className="rangeSlider"
                            step={1}
                            startValue={Math.floor(filters.minPrice ?? lowestPrice)}
                            endValue={Math.ceil(filters.maxPrice ?? highestPrice)}
                            onStartValueChange={(value) => {
                                handleFiltersChange({ minPrice: value });
                            }}
                            onEndValueChange={(value) => {
                                handleFiltersChange({ maxPrice: value });
                            }}
                            minValue={Math.floor(lowestPrice)}
                            maxValue={Math.ceil(highestPrice)}
                            formatValue={formatPriceValue}
                        />
                    ),
                },
            ]}
        />
    );
};
