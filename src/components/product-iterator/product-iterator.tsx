import { SerializeFrom } from '@remix-run/node';
import { Product } from '@wix/stores_products';

export interface ProductIteratorProps {
    className?: string;
    Comp?: (props: { product: SerializeFrom<Product> }) => JSX.Element;
    loadProducts: () => SerializeFrom<{
        categoryProducts: {
            items: Product[];
            totalCount: number;
        };
    }>;
}

export const ProductIterator = ({ Comp, loadProducts }: ProductIteratorProps) => {
    const C = Comp || (() => null);
    const { categoryProducts } = loadProducts();
    return (
        <>
            {categoryProducts.items.map((p) => (
                <C key={p._id} product={p} />
            ))}
        </>
    );
};
