import {
    X,
    Filter,
    Calendar,
    Tag as TagIcon,
    Activity,
    Users,
    RotateCcw,
    Percent,
} from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { Separator } from '@/components/ui/separator';
import type { Tag } from '@/types';

export interface ProjectFilterValues {
    status?: string[];
    tags?: number[];
    clientId?: number[];
    dueDateStart?: string;
    dueDateEnd?: string;
    minCompletion?: number;
    maxCompletion?: number;
}

interface ProjectFiltersProps {
    values: ProjectFilterValues;
    onChange: (values: ProjectFilterValues) => void;
    onClear: () => void;
    allTags: Tag[];
    clients: { id: number; name: string }[];
    statuses: string[];
}

export default function ProjectFilters({
    values,
    onChange,
    onClear,
    allTags,
    clients,
    statuses,
}: ProjectFiltersProps) {
    const hasFilters = Object.values(values).some(
        (v) => v !== undefined && (Array.isArray(v) ? v.length > 0 : true),
    );

    const tagOptions = allTags.map((tag) => ({
        label: tag.name,
        value: tag.id,
    }));

    const clientOptions = clients.map((client) => ({
        label: client.name,
        value: client.id,
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
                                Refine your project list with precision
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
                                <Activity className="h-3.5 w-3.5" />
                                <Label className="text-xs font-bold tracking-wider uppercase">
                                    Project Status
                                </Label>
                            </div>
                            <MultiSelect
                                options={statuses.map((s) => ({
                                    label: s
                                        .split('_')
                                        .map(
                                            (word) =>
                                                word.charAt(0).toUpperCase() +
                                                word.slice(1),
                                        )
                                        .join(' '),
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

                        {/* Client Filter */}
                        <div className="space-y-2.5">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Users className="h-3.5 w-3.5" />
                                <Label className="text-xs font-bold tracking-wider uppercase">
                                    Clients
                                </Label>
                            </div>
                            <MultiSelect
                                options={clientOptions}
                                selected={values.clientId || []}
                                onChange={(selected) =>
                                    onChange({
                                        ...values,
                                        clientId: selected as number[],
                                    })
                                }
                                placeholder="Any Client"
                                className="bg-background"
                            />
                        </div>

                        {/* Tags Filter */}
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
                    </div>

                    <Separator className="opacity-50" />

                    {/* Range Filters Grid */}
                    <div className="grid grid-cols-1 gap-8 pb-2 lg:grid-cols-2">
                        {/* Completion Percentage Range */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Percent className="h-3.5 w-3.5" />
                                <Label className="text-xs font-bold tracking-wider uppercase">
                                    Completion Percentage
                                </Label>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="relative flex-1">
                                    <Input
                                        type="number"
                                        placeholder="Min %"
                                        min={0}
                                        max={100}
                                        value={values.minCompletion ?? ''}
                                        onChange={(e) =>
                                            onChange({
                                                ...values,
                                                minCompletion: e.target.value
                                                    ? Number(e.target.value)
                                                    : undefined,
                                            })
                                        }
                                        className="h-10 bg-background text-xs transition-all focus:ring-1"
                                    />
                                </div>
                                <span className="shrink-0 text-[11px] font-bold text-muted-foreground/30">
                                    to
                                </span>
                                <div className="relative flex-1">
                                    <Input
                                        type="number"
                                        placeholder="Max %"
                                        min={0}
                                        max={100}
                                        value={values.maxCompletion ?? ''}
                                        onChange={(e) =>
                                            onChange({
                                                ...values,
                                                maxCompletion: e.target.value
                                                    ? Number(e.target.value)
                                                    : undefined,
                                            })
                                        }
                                        className="h-10 bg-background text-xs transition-all focus:ring-1"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Due Date Range */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="h-3.5 w-3.5" />
                                <Label className="text-xs font-bold tracking-wider uppercase">
                                    Due Date Range
                                </Label>
                            </div>
                            <div className="flex items-center gap-3">
                                <Input
                                    type="date"
                                    value={values.dueDateStart || ''}
                                    onChange={(e) =>
                                        onChange({
                                            ...values,
                                            dueDateStart:
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
                                    value={values.dueDateEnd || ''}
                                    onChange={(e) =>
                                        onChange({
                                            ...values,
                                            dueDateEnd:
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
