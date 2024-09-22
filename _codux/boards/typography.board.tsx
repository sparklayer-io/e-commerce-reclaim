import '~/styles/common.scss';
import { createBoard, Variant } from '@wixc3/react-board';
import styles from './typography.board.module.scss';
import classNames from 'classnames';

export default createBoard({
    name: 'Typography',
    Board: () => (
        <div className={styles.container}>
            <div>
                <span className={styles.uikit}>UI Kit</span>
                <span className={styles.foundation}> | Foundation</span>
                <hr className={styles.hrSolid} />
                <h3 className={styles.sectionTitle}>Typography</h3>
                <h4 className={styles.sectionHeader}>DISPLAY</h4>
            </div>
            <Variant name="Heading1">
                <h1 className="heading1">Heading 1</h1>
            </Variant>
            <p className={classNames(styles.variantName, styles.headlinesSpacing)}>
                --heading1:<span className={styles.fontDetails}>Marcellus / 80px / 1</span>
            </p>
            <hr className={styles.hrLight} />
            <h4 className={styles.sectionHeader}>HEADING</h4>
            <Variant name="Heading2">
                <h2 className="heading2">Heading 2</h2>
            </Variant>
            <p className={classNames(styles.variantName, styles.headlinesSpacing)}>
                --heading1
                <span className={styles.fontDetails}>Marcellus / 80px / 1</span>
            </p>
            <Variant name="Heading3">
                <h3 className="heading3">Heading 3</h3>
            </Variant>
            <Variant name="Heading4">
                <h4 className="heading4">Heading 4</h4>
            </Variant>
            <Variant name="Heading5">
                <h5 className="heading5">Heading 5</h5>
            </Variant>
            <h6 className="heading6">Heading 6</h6>

            <p className="paragraph1">Paragraph 1</p>
            <p className="paragraph2">Paragraph 2</p>
            <p className="paragraph3">Paragraph 3</p>
        </div>
    ),
    environmentProps: {
        windowWidth: 450,
        windowHeight: 460,
    },
    isSnippet: true,
});
