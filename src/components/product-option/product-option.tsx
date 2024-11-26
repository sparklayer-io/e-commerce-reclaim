import { productsV3 as products } from '@wix/stores';
import { ColorSelect } from '~/src/components/color-select/color-select';
import { getChoiceValue } from '~/src/wix/products';
import { Select, SelectItem } from '~/src/components/select/select';
import { ErrorIcon } from '../icons';

import styles from './product-option.module.scss';

export interface ProductOptionProps {
    option: products.ConnectedOption;
    selectedChoice: products.ConnectedOptionChoice | undefined;
    error: string | undefined;
    onChange: (choice: products.ConnectedOptionChoice) => void;
}

export const ProductOption = ({ option, selectedChoice, error, onChange }: ProductOptionProps) => {
    const { name, optionRenderType: optionType, choicesSettings: { choices } = {} } = option;

    if (name === undefined || choices === undefined || optionType === undefined) {
        return null;
    }

    const handleChange = (value: string) => {
        const newSelectedChoice = choices.find((c) => getChoiceValue(optionType, c) === value);
        if (newSelectedChoice) {
            onChange(newSelectedChoice);
        }
    };

    const hasError = error !== undefined;

    return (
        <div className={styles.root}>
            <div className="paragraph2">
                {name}
                {selectedChoice && `: ${selectedChoice.name}`}
            </div>

            {optionType === products.ProductOptionRenderType.SWATCH_CHOICES ? (
                <ColorSelect
                    className="colorSelect"
                    // `description` is what identifies the color choice. It's the unique color name.
                    // `value` is the color value, which can be repeated in different color choices.
                    options={choices
                        .filter((c) => c.colorCode && c.name && c.visible)
                        .map((c) => ({
                            id: c.name!,
                            color: c.colorCode!,
                            crossedOut: !c.inStock,
                        }))}
                    selectedId={selectedChoice?.name ?? ''}
                    onChange={handleChange}
                    hasError={hasError}
                />
            ) : (
                <Select
                    placeholder={`Select ${name}`}
                    value={selectedChoice?.name ?? ''}
                    onValueChange={handleChange}
                    hasError={hasError}
                >
                    {choices
                        .filter((c) => c.name && c.visible)
                        .map((c) => (
                            <SelectItem key={c.name} value={c.name!}>
                                {c.name}
                                {!c.inStock && ` (out of stock)`}
                            </SelectItem>
                        ))}
                </Select>
            )}

            {hasError && (
                <div className={styles.error}>
                    <ErrorIcon width={18} height={18} />
                    {error}
                </div>
            )}
        </div>
    );
};
