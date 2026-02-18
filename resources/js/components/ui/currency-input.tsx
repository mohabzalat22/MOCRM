import { DollarSign } from 'lucide-react';
import * as React from 'react';
import { cn } from '@/lib/utils';
import { Input } from './input';

interface CurrencyInputProps
    extends Omit<React.ComponentProps<typeof Input>, 'onChange' | 'value'> {
    value: number | string;
    onChange: (value: number) => void;
}

export function CurrencyInput({
    value,
    onChange,
    className,
    ...props
}: CurrencyInputProps) {
    const [displayValue, setDisplayValue] = React.useState<string>(
        value?.toString() || '',
    );
    const [prevValue, setPrevValue] = React.useState<number | string>(value);

    // Sync with external value when it changes, but don't disrupt typing
    if (value !== prevValue) {
        setPrevValue(value);
        const numValue = typeof value === 'string' ? parseFloat(value) : value;
        const currentNum = parseFloat(displayValue);

        if (numValue !== currentNum && !isNaN(numValue)) {
            setDisplayValue(numValue.toString());
        } else if (value === 0 && displayValue === '') {
            // Keep empty if it was reset to 0
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let val = e.target.value;

        // If the current value is "0" and the user types a digit, replace the "0"
        if (displayValue === '0' && /^[1-9]$/.test(val.slice(-1))) {
            val = val.slice(-1);
        }

        // Strip non-numeric except for one decimal point
        const cleanVal = val.replace(/[^0-9.]/g, '');

        // Prevent multiple decimal points
        const parts = cleanVal.split('.');
        const formattedVal =
            parts.length > 2 ? `${parts[0]}.${parts.slice(1).join('')}` : cleanVal;

        setDisplayValue(formattedVal);

        const numericValue = parseFloat(formattedVal);
        if (!isNaN(numericValue)) {
            onChange(numericValue);
        } else {
            onChange(0);
        }
    };

    return (
        <div className="relative">
            <DollarSign className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
                {...props}
                type="text"
                inputMode="decimal"
                value={displayValue}
                onChange={handleChange}
                className={cn(
                    'pl-9 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none',
                    className,
                )}
                onFocus={(e) => {
                    e.target.select();
                }}
                onBlur={() => {
                    // Clean up display value on blur (e.g. 10. -> 10)
                    const num = parseFloat(displayValue);
                    if (!isNaN(num)) {
                        setDisplayValue(num.toString());
                    } else {
                        setDisplayValue('0');
                    }
                }}
            />
        </div>
    );
}
