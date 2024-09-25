import { createBoard, Variant } from '@wixc3/react-board';
import classNames from 'classnames';
import { Accordion } from '~/components/accordion/accordion';
import { ProductCard } from '~/components/product-card/product-card';
import { QuantityInput } from '~/components/quantity-input/quantity-input';
import ComponentWrapper from '_codux/board-wrappers/component-wrapper';

import styles from './components.board.module.scss';

export default createBoard({
    name: 'Components',
    Board: () => (
        <ComponentWrapper>
            <div className={styles.container}>
                <div>
                    <span className={styles.uikit}>UI Kit</span>
                    <span className={styles.foundation}> | Core components</span>
                    <hr className={styles.hrSolid} />
                    <h3 className={styles.sectionTitle}>Components &amp; Elements</h3>
                    <h4 className={styles.sectionHeader}>INPUT</h4>
                </div>
                <QuantityInput value={6} className={styles.quantityInput1} onChange={() => {}} />
                <span className={styles.fontDetails}>Number Input</span>
                <Variant name="Heading1">
                    <hr className={styles.hrLight} />
                    <h4 className={styles.sectionHeader}>ACCORDION</h4>
                    <Accordion
                        items={[
                            {
                                title: 'Product Info',
                                content: 'Content',
                            },
                            {
                                title: 'Return & Refund Policy',
                                content: 'Content',
                            },
                            {
                                title: 'Shipping Info ',
                                content: 'Content',
                            },
                        ]}
                        className={styles.accordion}
                    />
                    <hr className={styles.hrLight} />
                </Variant>
                <p className={classNames(styles.variantName, styles.headlinesSpacing)}></p>
                <h4 className={styles.sectionHeader}>LABELS</h4>
                <h4>Labels missing</h4>
                <hr className={styles.hrLight} />
                <h4 className={styles.sectionHeader}>CARDS</h4>
                <ProductCard
                    name="Bamboo Toothbrush"
                    imageUrl="https://static.wixstatic.com/media/c837a6_18152edaef9940ca88f446ae94b48a47~mv2.jpg/v1/fill/w_824,h_1098,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/c837a6_18152edaef9940ca88f446ae94b48a47~mv2.jpg"
                    ribbon="NEW"
                    price="$5.5"
                />
                <span className={styles.fontDetails}>Product Card</span>
                <h4>Product gallery missing</h4>
                <span className={styles.fontDetails}>Product Card</span>
            </div>
        </ComponentWrapper>
    ),
    environmentProps: {
        windowWidth: 423,
        windowHeight: 756,
    },
    isSnippet: true,
});
