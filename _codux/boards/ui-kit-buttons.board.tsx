import { createBoard, Variant } from '@wixc3/react-board';
import '~/styles/common.scss';
import classNames from 'classnames';
import styles from './ui-kit-buttons.board.module.scss';
import { Button } from '../../src/components/button/button';
import { LabelWithArrow } from '../../src/components/label-with-arrow/label-with-arrow';

export default createBoard({
    name: 'UI-Kit Buttons',
    Board: () => (
        <div>
            <div>
                <h2>Buttons</h2>
                <div className={styles.primaryContainer}>
                    <Variant name="Primary Button">
                        <LabelWithArrow>Shop Collection </LabelWithArrow>
                    </Variant>
                    <p>Primary </p>
                </div>
                <div className={styles.secondaryContainer}>
                    // Link for "Shop now goes here"
                    <p>Secondary</p>
                </div>
                <div className={styles.addToCartContainer}>
                    <Variant name="Add to Cart Button">
                        <Button className={styles.fullWidth}>Add to Cart</Button>
                    </Variant>
                    <p>Add to Cart</p>
                </div>
            </div>
            <div>
                <h2>Menus </h2>
                <div />
                // Menu Component goes here
            </div>
        </div>
    ),
    isSnippet: true,
});
