import { createBoard, Variant } from '@wixc3/react-board';
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
                </div>
                <h4 className={styles.sectionHeader}>INPUT</h4>
                <Variant name="Number Input">
                    <QuantityInput value={6} onChange={() => {}} />
                </Variant>
                <span className={styles.variantName}>Number Input</span>
                <hr className={styles.hrLight} />
                <h4 className={styles.sectionHeader}>ACCORDION</h4>
                <div style={{ width: '70%' }}>
                    <Variant name="Accordion">
                        <Accordion
                            items={[
                                {
                                    title: 'Product Info',
                                    content: 'Description',
                                },
                                {
                                    title: 'Return & Refund Policy',
                                    content: 'Description',
                                },
                                {
                                    title: 'Shipping Info ',
                                    content: 'Description',
                                },
                            ]}
                        />
                    </Variant>
                </div>
                <hr className={styles.hrLight} />
                <h4 className={styles.sectionHeader}>LABELS</h4>
                <Variant name="Ribbon">
                    <span className="ribbon">Sale</span>
                </Variant>
                <hr className={styles.hrLight} />
                <h4 className={styles.sectionHeader}>PRODUCT CARD</h4>
                <Variant name="Product Card">
                    <ProductCard
                        name="Bamboo Toothbrush"
                        imageUrl="https://static.wixstatic.com/media/c837a6_18152edaef9940ca88f446ae94b48a47~mv2.jpg/v1/fill/w_824,h_1098,al_c,q_85,usm_0.66_1.00_0.01,enc_auto/c837a6_18152edaef9940ca88f446ae94b48a47~mv2.jpg"
                        ribbon="NEW"
                        price="$6"
                        discountedPrice="$5.5"
                    />
                </Variant>
            </div>
        </ComponentWrapper>
    ),
    environmentProps: {
        windowWidth: 423,
        windowHeight: 756,
    },
    isSnippet: true,
});
