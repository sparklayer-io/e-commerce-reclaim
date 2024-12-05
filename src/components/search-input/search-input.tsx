import { Form } from '@remix-run/react';
import React, { useCallback, useId } from 'react';
import { CrossSmallIcon, SearchIcon } from '../icons';
import styles from './search-input.module.scss';

export interface SearchInputProps {
    className?: string;
    defaultValue?: string;
    onSearchSubmit?: (value: string) => void;
}

export const SearchInput = React.memo<SearchInputProps>(function SearchInput({
    className,
    defaultValue,
    onSearchSubmit,
}) {
    const inputRef = React.useRef<HTMLInputElement>(null);
    // input is uncontrolled, so we clear it manually
    const onClickClear = useCallback(() => (inputRef.current!.value = ''), []);

    const onSubmit: React.EventHandler<React.FormEvent<HTMLFormElement>> = (event) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        const search = formData.get('search');
        if (typeof search === 'string' && search.trim() !== '') {
            onSearchSubmit?.(search);
        }
    };
    const inputId = useId();

    return (
        <label className={className} htmlFor={inputId}>
            <Form className={styles.form} role="search" onSubmit={onSubmit}>
                <SearchIcon className={styles.searchIcon} width={14} />
                <input
                    id={inputId}
                    ref={inputRef}
                    className={styles.input}
                    type="text"
                    name="search"
                    spellCheck="false"
                    defaultValue={defaultValue}
                    placeholder="Search"
                    minLength={2}
                />
                <CrossSmallIcon className={styles.clearIcon} onClick={onClickClear} />
            </Form>
        </label>
    );
});
