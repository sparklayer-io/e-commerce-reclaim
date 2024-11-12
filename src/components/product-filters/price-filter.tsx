import { FC, useEffect, useRef, useState } from 'react';
import { Slider } from '../slider/slider';
import { formatPrice } from '~/src/wix/products';
import { useDebouncedCallback } from '~/src/wix/utils';
import styles from './price-filter.module.scss';

export interface PriceFilterProps {
    minAvailablePrice: number;
    maxAvailablePrice: number;
    minSelectedPrice?: number;
    maxSelectedPrice?: number;
    currency: string;
    onChange: (value: { minPrice: number; maxPrice: number }) => void;
}

export const PriceFilter: FC<PriceFilterProps> = ({
    minAvailablePrice,
    maxAvailablePrice,
    minSelectedPrice,
    maxSelectedPrice,
    currency,
    onChange,
}) => {
    // Round available prices to the nearest whole number to ensure the slider
    // thumbs can reach the track's start and end, as they move only in integer
    // steps.
    minAvailablePrice = Math.floor(minAvailablePrice);
    maxAvailablePrice = Math.ceil(maxAvailablePrice);
    minSelectedPrice ??= minAvailablePrice;
    maxSelectedPrice ??= maxAvailablePrice;

    const [value, setValue] = useState([minSelectedPrice, maxSelectedPrice]);
    useEffect(() => {
        setValue([minSelectedPrice, maxSelectedPrice]);
    }, [minSelectedPrice, maxSelectedPrice]);

    const isUsingKeyboard = useRef(false);

    const debouncedOnChange = useDebouncedCallback(onChange, 500);
    useEffect(() => debouncedOnChange.cancel, [debouncedOnChange]);

    const handleValueCommit = ([minPrice, maxPrice]: number[]) => {
        if (isUsingKeyboard.current) {
            debouncedOnChange({ minPrice, maxPrice });
        } else {
            onChange({ minPrice, maxPrice });
        }
    };

    return (
        <div className={styles.root}>
            <Slider
                className="slider"
                min={minAvailablePrice}
                max={maxAvailablePrice}
                step={1}
                value={value}
                onValueChange={setValue}
                onValueCommit={handleValueCommit}
                onKeyDown={() => (isUsingKeyboard.current = true)}
                onPointerDown={() => (isUsingKeyboard.current = false)}
            />
            <div className={styles.labels}>
                <div>{formatPrice(value[0], currency)}</div>
                <div>{formatPrice(value[1], currency)}</div>
            </div>
        </div>
    );
};
