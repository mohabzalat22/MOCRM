import {
    X,
    Filter,
    Calendar,
    DollarSign,
    Tag as TagIcon,
    Activity,
    Users,
    RotateCcw,
} from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { Separator } from '@/components/ui/separator';
import type { Tag } from '@/types';

export interface ClientFilterValues {
    status?: string[];
    tags?: number[];
    lastContactStart?: string;
    lastContactEnd?: string;
    minValue?: number;
    maxValue?: number;
    projectStatuses?: string[];
}

interface ClientFiltersProps {
    values: ClientFilterValues;
    onChange: (values: ClientFilterValues) => void;
    onClear: () => void;
    allTags: Tag[];
    statuses: string[];
    projectStatuses: string[];
}

export default function ClientFilters({
    values,
    onChange,
    onClear,
    allTags,
    statuses,
    projectStatuses,
}: ClientFiltersProps) {
    const hasFilters = Object.values(values).some(
        (v) => v !== undefined && (Array.isArray(v) ? v.length > 0 : true),
    );

    const tagOptions = allTags.map((tag) => ({
        label: tag.name,
        value: tag.id,
    }));

    return (
        <div className="mb-6 animate-in duration-200 fade-in slide-in-from-top-2">
            <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
                {/* Header */}
                <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-3">
                    <div className="flex items-center gap-2">
                        <div className="rounded-md bg-primary/10 p-1.5 text-primary">
                            <Filter className="h-4 w-4" />
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold capitalize">
                                Advanced Filters
                            </h3>
                            <p className="text-[11px] leading-none text-muted-foreground">
                                Refine your client list with precision
                            </p>
                        </div>
                    </div>
                    {hasFilters && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClear}
                            className="h-8 px-2.5 text-xs text-destructive transition-colors hover:bg-destructive/10 hover:text-destructive"
                        >
                            <RotateCcw className="mr-1.5 h-3 w-3" />
                            Reset All
                        </Button>
                    )}
                </div>

                <div className="space-y-8 p-5">
                    {/* Top Row: Categorical Filters */}
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                        {/* Status Filter */}
                        <div className="space-y-2.5">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Users className="h-3.5 w-3.5" />
                                <Label className="text-xs font-bold tracking-wider uppercase">
                                    Client Status
                                </Label>
                            </div>
                            <MultiSelect
                                options={statuses.map((s) => ({
                                    label: s,
                                    value: s,
                                }))}
                                selected={values.status || []}
                                onChange={(selected) =>
                                    onChange({
                                        ...values,
                                        status: selected as string[],
                                    })
                                }
                                placeholder="All Statuses"
                                className="bg-background"
                            />
                        </div>

                        {/* Tags Multi-select */}
                        <div className="space-y-2.5">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <TagIcon className="h-3.5 w-3.5" />
                                <Label className="text-xs font-bold tracking-wider uppercase">
                                    Tags
                                </Label>
                            </div>
                            <MultiSelect
                                options={tagOptions}
                                selected={values.tags || []}
                                onChange={(selected) =>
                                    onChange({
                                        ...values,
                                        tags: selected as number[],
                                    })
                                }
                                placeholder="Any Tags"
                                className="bg-background"
                            />
                        </div>

                        {/* Project Status Multi-select */}
                        <div className="space-y-2.5">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Activity className="h-3.5 w-3.5" />
                                <Label className="text-xs font-bold tracking-wider uppercase">
                                    Project Status
                                </Label>
                            </div>
                            <MultiSelect
                                options={projectStatuses.map((ps) => ({
                                    label: ps
                                        .split('_')
                                        .map(
                                            (word) =>
                                                word.charAt(0).toUpperCase() +
                                                word.slice(1),
                                        )
                                        .join(' '),
                                    value: ps,
                                }))}
                                selected={values.projectStatuses || []}
                                onChange={(selected) =>
                                    onChange({
                                        ...values,
                                        projectStatuses: selected as string[],
                                    })
                                }
                                placeholder="Any Status"
                                className="bg-background"
                            />
                        </div>
                    </div>

                    <Separator className="opacity-50" />

                    {/* Range Filters Grid */}
                    <div className="grid grid-cols-1 gap-8 pb-2 lg:grid-cols-2">
                        {/* Monthly Value Range */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <DollarSign className="h-3.5 w-3.5" />
                                <Label className="text-xs font-bold tracking-wider uppercase">
                                    Monthly Value Range
                                </Label>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="relative flex-1">
                                    <span className="absolute top-1/2 left-3 -translate-y-1/2 text-[10px] font-medium text-muted-foreground">
                                        $
                                    </span>
                                    <Input
                                        type="number"
                                        placeholder="Min"
                                        value={values.minValue || ''}
                                        onChange={(e) =>
                                            onChange({
                                                ...values,
                                                minValue: e.target.value
                                                    ? Number(e.target.value)
                                                    : undefined,
                                            })
                                        }
                                        className="h-10 bg-background pl-7 text-xs transition-all focus:ring-1"
                                    />
                                </div>
                                <span className="shrink-0 text-[11px] font-bold text-muted-foreground/30">
                                    to
                                </span>
                                <div className="relative flex-1">
                                    <span className="absolute top-1/2 left-3 -translate-y-1/2 text-[10px] font-medium text-muted-foreground">
                                        $
                                    </span>
                                    <Input
                                        type="number"
                                        placeholder="Max"
                                        value={values.maxValue || ''}
                                        onChange={(e) =>
                                            onChange({
                                                ...values,
                                                maxValue: e.target.value
                                                    ? Number(e.target.value)
                                                    : undefined,
                                            })
                                        }
                                        className="h-10 bg-background pl-7 text-xs transition-all focus:ring-1"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Last Contact Date Range */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="h-3.5 w-3.5" />
                                <Label className="text-xs font-bold tracking-wider uppercase">
                                    Last Contact Range
                                </Label>
                            </div>
                            <div className="flex items-center gap-3">
                                <Input
                                    type="date"
                                    value={values.lastContactStart || ''}
                                    onChange={(e) =>
                                        onChange({
                                            ...values,
                                            lastContactStart:
                                                e.target.value || undefined,
                                        })
                                    }
                                    className="h-10 flex-1 bg-background px-4 text-xs transition-all focus:ring-1"
                                />
                                <span className="shrink-0 text-[11px] font-bold text-muted-foreground/30">
                                    to
                                </span>
                                <Input
                                    type="date"
                                    value={values.lastContactEnd || ''}
                                    onChange={(e) =>
                                        onChange({
                                            ...values,
                                            lastContactEnd:
                                                e.target.value || undefined,
                                        })
                                    }
                                    className="h-10 flex-1 bg-background px-4 text-xs transition-all focus:ring-1"
                                />
                            </div>
                        </div>
                    </div>

                    {hasFilters && (
                        <div className="mt-4 flex items-center justify-center border-t pt-6">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onClear}
                                className="group h-10 bg-background px-16 text-xs font-medium shadow-sm transition-all duration-300 hover:border-destructive/30 hover:bg-destructive/5 hover:text-destructive"
                            >
                                <X className="mr-2 h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-90" />
                                <span>Clear all filters</span>
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
