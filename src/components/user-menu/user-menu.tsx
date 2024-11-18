import { NavLink, useNavigate } from '@remix-run/react';
import classNames from 'classnames';
import { Avatar } from '~/src/components/avatar/avatar';
import {
    DropdownMenu,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from '~/src/components/dropdown-menu/dropdown-menu';
import { DropdownIcon } from '~/src/components/icons';
import { useUserInfo } from '~/src/wix/users';

import styles from './user-menu.module.scss';

export interface UserMenuProps {
    loginDisabled?: boolean;
}

export const UserMenu = ({ loginDisabled }: UserMenuProps) => {
    const { isLoggedIn, user } = useUserInfo();
    const navigate = useNavigate();

    if (!isLoggedIn) {
        const handleLoginClick = () => {
            if (loginDisabled) {
                alert('Functionality is not supported in the define app mode');
            } else {
                navigate('/login');
            }
        };

        return (
            <div className={classNames(styles.link, styles.root)} onClick={handleLoginClick}>
                <Avatar imageSrc={undefined} />
                Log In
            </div>
        );
    }

    return (
        <DropdownMenu
            trigger={
                <button className={styles.root}>
                    <Avatar imageSrc={user?.profile?.photo?.url} />
                    <DropdownIcon width={10} height={10} />
                </button>
            }
            contentProps={{
                align: 'end',
                sideOffset: 6,
            }}
        >
            <DropdownMenuItem asChild>
                <NavLink className={styles.link} to={'/members-area/my-account'}>
                    My Account
                </NavLink>
            </DropdownMenuItem>

            <DropdownMenuItem asChild>
                <NavLink className={styles.link} to={'/members-area/my-orders'}>
                    My Orders
                </NavLink>
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
                <NavLink className={styles.link} to={'/logout'}>
                    Log out
                </NavLink>
            </DropdownMenuItem>
        </DropdownMenu>
    );
};
