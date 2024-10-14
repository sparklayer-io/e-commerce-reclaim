import styles from './price.module.scss';

export interface PriceProps {
    discountedPrice?: string;
    fullPrice: string;
}

export const Price = ({ fullPrice, discountedPrice }: PriceProps) => {
    const hasDiscount = discountedPrice !== undefined && fullPrice !== discountedPrice;

    return (
        <div className={styles.root}>
            {hasDiscount && <div className={styles.previousPrice}>{fullPrice}</div>}
            <div>{hasDiscount ? discountedPrice : fullPrice}</div>
        </div>
    );
};
