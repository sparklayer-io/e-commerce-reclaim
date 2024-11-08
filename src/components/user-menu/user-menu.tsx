import { NavLink } from '@remix-run/react';
import classNames from 'classnames';
import { useUserInfo } from '~/src/wix/hooks';
import { Avatar } from '../avatar/avatar';
import {
    DropdownMenu,
    DropdownMenuItem,
    DropdownMenuSeparator,
} from '../dropdown-menu/dropdown-menu';
import { DropdownIcon } from '../icons';

import styles from './user-menu.module.scss';

export const UserMenu = () => {
    const { isLoggedIn, user } = useUserInfo();

    if (!isLoggedIn) {
        return (
            <NavLink className={classNames(styles.link, styles.root)} to={'/login'}>
                <Avatar imageSrc={undefined} />
                Log In
            </NavLink>
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
