import cx from 'classnames';
import styles from './product-view-1.module.scss';
import { Product } from '@wix/stores_products';
import { SerializeFrom } from '@remix-run/node';

export interface ProductView1Props {
    className?: string;
    product: SerializeFrom<Product>;
}

/**
 * This component was created using Codux's Default new component template.
 * To create custom component templates, see https://help.codux.com/kb/en/article/kb16522
 */
export const ProductView1 = ({ className }: ProductView1Props) => {
    return <div className={cx(styles.root, className)}>ProductView1</div>;
};
