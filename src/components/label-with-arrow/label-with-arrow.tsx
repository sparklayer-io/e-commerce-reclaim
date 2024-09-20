import styles from './label-with-arrow.module.scss';
import { ArrowRightIcon } from '~/components/icons';
import classNames from 'classnames';

interface LabelWithArrowProps {
    className?: string;
    children: React.ReactNode;
}

export const LabelWithArrow = ({ children, className }: LabelWithArrowProps) => {
    return (
        <div className={classNames(styles.root, className)}>
            {children}
            <ArrowRightIcon className={styles.icon} />
        </div>
    );
};
