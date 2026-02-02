import {
    Phone,
    Mail,
    Users,
    FileText,
    CreditCard,
    Search,
    X,
    Download,
    Filter,
} from 'lucide-react';
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import type { ActivityType } from '@/types';

interface TimelineFiltersProps {
    searchQuery: string;
    onSearchChange: (query: string) => void;
    selectedTypes: Set<ActivityType>;
    onTypeToggle: (type: ActivityType) => void;
    onClearFilters: () => void;
    onExport: () => void;
    totalActivities: number;
    filteredCount: number;
}

const activityTypes: {
    type: ActivityType;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    color: string;
}[] = [
    { type: 'call', label: 'Call', icon: Phone, color: 'text-blue-500' },
    { type: 'email', label: 'Email', icon: Mail, color: 'text-green-500' },
    { type: 'meeting', label: 'Meeting', icon: Users, color: 'text-purple-500' },
    {
        type: 'transaction',
        label: 'Transaction',
        icon: CreditCard,
        color: 'text-amber-500',
    },
    { type: 'note', label: 'Note', icon: FileText, color: 'text-gray-500' },
];

export default function TimelineFilters({
    searchQuery,
    onSearchChange,
    selectedTypes,
    onTypeToggle,
    onClearFilters,
    onExport,
    totalActivities,
    filteredCount,
}: TimelineFiltersProps) {
    const hasActiveFilters = searchQuery || selectedTypes.size > 0;
    const activeFilterCount = selectedTypes.size + (searchQuery ? 1 : 0);

    return (
        <div className="space-y-3 rounded-lg border bg-card p-4 shadow-sm">
            {/* Top row: Search and Export */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                        type="text"
                        placeholder="Search activities..."
                        value={searchQuery}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="pl-9 pr-9"
                    />
                    {searchQuery && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
                            onClick={() => onSearchChange('')}
                        >
                            <X className="h-3 w-3" />
                        </Button>
                    )}
                </div>

                <div className="flex items-center gap-2">
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button type="button" variant="outline" className="gap-2">
                                <Filter className="h-4 w-4" />
                                Filter
                                {activeFilterCount > 0 && (
                                    <Badge
                                        variant="secondary"
                                        className="ml-1 h-5 rounded-full px-1.5 text-xs"
                                    >
                                        {activeFilterCount}
                                    </Badge>
                                )}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64" align="end">
                            <div className="space-y-4">
                                <div>
                                    <h4 className="mb-3 text-sm font-semibold">
                                        Activity Types
                                    </h4>
                                    <div className="space-y-2">
                                        {activityTypes.map((item) => {
                                            const Icon = item.icon;
                                            const isSelected = selectedTypes.has(
                                                item.type,
                                            );
                                            return (
                                                <div
                                                    key={item.type}
                                                    className="flex items-center gap-2"
                                                >
                                                    <Checkbox
                                                        id={`filter-${item.type}`}
                                                        checked={isSelected}
                                                        onCheckedChange={() =>
                                                            onTypeToggle(item.type)
                                                        }
                                                    />
                                                    <Label
                                                        htmlFor={`filter-${item.type}`}
                                                        className="flex flex-1 cursor-pointer items-center gap-2 text-sm font-normal"
                                                    >
                                                        <Icon
                                                            className={`h-4 w-4 ${item.color}`}
                                                        />
                                                        {item.label}
                                                    </Label>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {hasActiveFilters && (
                                    <>
                                        <Separator />
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="w-full"
                                            onClick={onClearFilters}
                                        >
                                            Clear All Filters
                                        </Button>
                                    </>
                                )}
                            </div>
                        </PopoverContent>
                    </Popover>

                    <Button
                        type="button"
                        variant="outline"
                        size="default"
                        onClick={onExport}
                        className="gap-2"
                        disabled={filteredCount === 0}
                    >
                        <Download className="h-4 w-4" />
                        <span className="hidden sm:inline">Export PDF</span>
                    </Button>
                </div>
            </div>

            {/* Active filters display */}
            {hasActiveFilters && (
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                        Active filters:
                    </span>
                    {searchQuery && (
                        <Badge
                            variant="secondary"
                            className="gap-1 pr-1 text-xs"
                        >
                            Search: "{searchQuery}"
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 hover:bg-transparent"
                                onClick={() => onSearchChange('')}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </Badge>
                    )}
                    {Array.from(selectedTypes).map((type) => {
                        const item = activityTypes.find((t) => t.type === type);
                        if (!item) return null;
                        const Icon = item.icon;
                        return (
                            <Badge
                                key={type}
                                variant="secondary"
                                className="gap-1 pr-1 text-xs"
                            >
                                <Icon className={`h-3 w-3 ${item.color}`} />
                                {item.label}
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-4 w-4 hover:bg-transparent"
                                    onClick={() => onTypeToggle(type)}
                                >
                                    <X className="h-3 w-3" />
                                </Button>
                            </Badge>
                        );
                    })}
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-6 px-2 text-xs"
                        onClick={onClearFilters}
                    >
                        Clear all
                    </Button>
                </div>
            )}

            {/* Results count */}
            {hasActiveFilters && (
                <div className="text-xs text-muted-foreground">
                    Showing {filteredCount} of {totalActivities} activities
                </div>
            )}
        </div>
    );
}
