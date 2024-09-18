import styles from './label-with-arrow.module.scss';
import { ArrowIcon } from '../arrow-icon/arrow-icon';
import classNames from 'classnames';

interface LabelWithArrowProps {
    className?: string;
    children: React.ReactNode;
}

export const LabelWithArrow = ({ children, className }: LabelWithArrowProps) => {
    return (
        <div className={classNames(styles.root, className)}>
            {children}
            <ArrowIcon className={styles.icon} />
        </div>
    );
};
