import classNames from 'classnames';
import { UserIcon } from '../icons';

import styles from './avatar.module.scss';

export interface AvatarProps {
    className?: string;
    imageSrc: string | undefined;
}

export const Avatar = ({ className, imageSrc }: AvatarProps) => {
    return (
        <div className={classNames(styles.root, className)}>
            {imageSrc ? <img src={imageSrc} alt="" /> : <UserIcon />}
        </div>
    );
};
