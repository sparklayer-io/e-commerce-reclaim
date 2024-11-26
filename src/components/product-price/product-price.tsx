import classNames from 'classnames';
import styles from './product-price.module.scss';

export interface ProductPriceProps {
    price?: string | null;
    discountedPrice?: string | null;
    className?: string;
}

export const ProductPrice = ({ price, discountedPrice, className }: ProductPriceProps) => {
    const hasDiscount = discountedPrice && price !== discountedPrice;
    return (
        <div className={classNames(styles.root, className)}>
            {hasDiscount && <span className={styles.beforeDiscount}>{price}</span>}
            <span>{hasDiscount ? discountedPrice : price}</span>
        </div>
    );
};
