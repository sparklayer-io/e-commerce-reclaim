import * as RadixSelect from '@radix-ui/react-select';
import classNames from 'classnames';
import { DropdownIcon } from '../icons';

import styles from './select.module.scss';

export interface SelectProps {
    value: string;
    onValueChange: (value: string) => void;
    placeholder?: string;
    children: React.ReactNode;
}

export const Select = ({ value, onValueChange, placeholder, children }: SelectProps) => (
    <RadixSelect.Root value={value} onValueChange={onValueChange}>
        <RadixSelect.Trigger className={styles.trigger}>
            <RadixSelect.Value placeholder={placeholder} />
            <RadixSelect.Icon className={styles.triggerIcon}>
                <DropdownIcon width={12} />
            </RadixSelect.Icon>
        </RadixSelect.Trigger>

        <RadixSelect.Portal>
            <RadixSelect.Content className={styles.content} position="popper">
                <RadixSelect.Viewport>{children}</RadixSelect.Viewport>
            </RadixSelect.Content>
        </RadixSelect.Portal>
    </RadixSelect.Root>
);

export interface SelectItemProps {
    value: string;
    children: React.ReactNode;
    className?: string;
}

export const SelectItem = ({ value, children, className }: SelectItemProps) => {
    return (
        <RadixSelect.Item className={classNames(styles.item, className)} value={value}>
            <RadixSelect.ItemText>{children}</RadixSelect.ItemText>
        </RadixSelect.Item>
    );
};
