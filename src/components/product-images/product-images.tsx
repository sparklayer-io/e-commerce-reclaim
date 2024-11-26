import { productsV3 as products } from '@wix/stores';
import { useEffect, useState } from 'react';
import classNames from 'classnames';
import { getClickableElementAttributes } from '~/src/wix/utils';
import { ImagePlaceholderIcon } from '../icons';
import styles from './product-images.module.scss';

export interface ProductImagesProps {
    media?: products.Media;
}

export const ProductImages = ({ media }: ProductImagesProps) => {
    const [selectedImage, setSelectedImage] = useState<products.ProductMedia | undefined>(
        media?.main,
    );

    // The media can change when another product variant was selected and it has
    // a different set of media items. In this case make sure the selected image is refreshed.
    useEffect(() => {
        setSelectedImage(media?.main);
    }, [media]);

    const imageItems = media?.itemsInfo?.items?.filter((item) => item.image !== undefined);

    return (
        <div>
            <div className={styles.mainImageWrapper}>
                {selectedImage && selectedImage.image ? (
                    <img
                        className={styles.mainImage}
                        src={selectedImage.url}
                        alt={selectedImage.altText ?? ''}
                    />
                ) : (
                    <ImagePlaceholderIcon className={styles.imagePlaceholderIcon} />
                )}
            </div>

            {imageItems && imageItems.length > 0 && (
                <div className={styles.thumbnails}>
                    {imageItems.map((item) => (
                        <div
                            key={item._id}
                            className={classNames(styles.thumbnail, {
                                [styles.selected]: selectedImage && selectedImage._id === item._id,
                            })}
                            {...getClickableElementAttributes(() => setSelectedImage(item))}
                        >
                            <img
                                className={styles.thumbnailImage}
                                src={item.url}
                                alt={item.altText ?? ''}
                            />
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
