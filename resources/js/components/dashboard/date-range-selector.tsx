import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { DateRangeKey } from '@/types';

interface DateRangeSelectorProps {
    value: DateRangeKey;
    onChange: (value: DateRangeKey) => void;
}

export function DateRangeSelector({ value, onChange }: DateRangeSelectorProps) {
    return (
        <Select value={value} onValueChange={(val) => onChange(val as DateRangeKey)}>
            <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
                <SelectItem value="90d">Last 90 Days</SelectItem>
                <SelectItem value="this_month">This Month</SelectItem>
                <SelectItem value="last_month">Last Month</SelectItem>
                <SelectItem value="this_year">This Year</SelectItem>
            </SelectContent>
        </Select>
    );
}
