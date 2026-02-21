import { format } from 'date-fns';
import { useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Input } from './input';
import { Label } from './label';

interface DateTimePickerProps {
    value: Date | undefined;
    onChange: (date: Date | undefined) => void;
    label?: string;
    placeholder?: string;
    error?: boolean;
    disabled?: boolean;
    className?: string;
}

export function DateTimePicker({
    value,
    onChange,
    label,
    error = false,
    disabled = false,
    className,
}: DateTimePickerProps) {
    // Convert Date to datetime-local format (yyyy-MM-ddTHH:mm)
    const inputValue =
        value instanceof Date && !isNaN(value.getTime())
            ? format(value, "yyyy-MM-dd'T'HH:mm")
            : '';

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (!e.target.value) {
                onChange(undefined);
                return;
            }
            onChange(new Date(e.target.value));
        },
        [onChange],
    );

    return (
        <div className={cn('space-y-1.5', className)}>
            {label && (
                <Label
                    className={cn(
                        'text-xs font-semibold',
                        error ? 'text-destructive' : 'text-muted-foreground',
                    )}
                >
                    {label}
                </Label>
            )}
            <div className="relative">
                <Input
                    type="datetime-local"
                    value={inputValue}
                    onChange={handleChange}
                    disabled={disabled}
                    className={cn(
                        'h-9 text-sm w-full',
                        error &&
                            'border-destructive/50 bg-destructive/5 text-destructive focus-visible:ring-destructive',
                    )}
                />
            </div>
        </div>
    );
}
