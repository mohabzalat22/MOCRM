import {
    Filter,
    Calendar,
    Users,
    RotateCcw,
    Activity as ActivityIcon,
    Percent,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MultiSelect } from '@/components/ui/multi-select';
import { Separator } from '@/components/ui/separator';

export interface ActivityFilterValues {
    types?: string[];
    clientIds?: number[];
    startDate?: string;
    endDate?: string;
    projectStatuses?: string[];
    projectDueDateStart?: string;
    projectDueDateEnd?: string;
    minProjectCompletion?: number;
    maxProjectCompletion?: number;
}

interface ActivityFiltersProps {
    values: ActivityFilterValues;
    onChange: (values: ActivityFilterValues) => void;
    onClear: () => void;
    clients: { id: number; name: string }[];
    activityTypes: string[];
    projectStatuses: string[];
}

export default function ActivityFilters({
    values,
    onChange,
    onClear,
    clients,
    activityTypes,
    projectStatuses,
}: ActivityFiltersProps) {
    const hasFilters = Object.values(values).some(
        (v) => v !== undefined && (Array.isArray(v) ? v.length > 0 : true),
    );

    const clientOptions = clients.map((client) => ({
        label: client.name,
        value: client.id,
    }));

    const typeOptions = activityTypes.map((type) => ({
        label: type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' '),
        value: type,
    }));

    const projectStatusOptions = projectStatuses.map((s) => ({
        label: s
            .split('_')
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' '),
        value: s,
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
                                Activity Filters
                            </h3>
                            <p className="text-[11px] leading-none text-muted-foreground">
                                Refine activity results
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
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                        {/* Type Filter */}
                        <div className="space-y-2.5">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <ActivityIcon className="h-3.5 w-3.5" />
                                <Label className="text-xs font-bold tracking-wider uppercase">
                                    Activity Type
                                </Label>
                            </div>
                            <MultiSelect
                                options={typeOptions}
                                selected={values.types || []}
                                onChange={(selected) =>
                                    onChange({
                                        ...values,
                                        types: selected as string[],
                                    })
                                }
                                placeholder="All Types"
                                className="bg-background"
                            />
                        </div>

                        {/* Client Filter */}
                        <div className="space-y-2.5">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Users className="h-3.5 w-3.5" />
                                <Label className="text-xs font-bold tracking-wider uppercase">
                                    Client
                                </Label>
                            </div>
                            <MultiSelect
                                options={clientOptions}
                                selected={values.clientIds || []}
                                onChange={(selected) =>
                                    onChange({
                                        ...values,
                                        clientIds: selected as number[],
                                    })
                                }
                                placeholder="All Clients"
                                className="bg-background"
                            />
                        </div>

                        {/* Project Status Filter */}
                        <div className="space-y-2.5">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <ActivityIcon className="h-3.5 w-3.5" />
                                <Label className="text-xs font-bold tracking-wider uppercase">
                                    Project Status
                                </Label>
                            </div>
                            <MultiSelect
                                options={projectStatusOptions}
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

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                        {/* Date Range Filter */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="h-3.5 w-3.5" />
                                <Label className="text-xs font-bold tracking-wider uppercase">
                                    Activity Date Range
                                </Label>
                            </div>
                            <div className="flex items-center gap-3">
                                <Input
                                    type="date"
                                    value={values.startDate || ''}
                                    onChange={(e) =>
                                        onChange({
                                            ...values,
                                            startDate:
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
                                    value={values.endDate || ''}
                                    onChange={(e) =>
                                        onChange({
                                            ...values,
                                            endDate:
                                                e.target.value || undefined,
                                        })
                                    }
                                    className="h-10 flex-1 bg-background px-4 text-xs transition-all focus:ring-1"
                                />
                            </div>
                        </div>

                        {/* Project Due Date Range */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Calendar className="h-3.5 w-3.5" />
                                <Label className="text-xs font-bold tracking-wider uppercase">
                                    Project Due Date Range
                                </Label>
                            </div>
                            <div className="flex items-center gap-3">
                                <Input
                                    type="date"
                                    value={values.projectDueDateStart || ''}
                                    onChange={(e) =>
                                        onChange({
                                            ...values,
                                            projectDueDateStart:
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
                                    value={values.projectDueDateEnd || ''}
                                    onChange={(e) =>
                                        onChange({
                                            ...values,
                                            projectDueDateEnd:
                                                e.target.value || undefined,
                                        })
                                    }
                                    className="h-10 flex-1 bg-background px-4 text-xs transition-all focus:ring-1"
                                />
                            </div>
                        </div>

                        {/* Project Completion Filter */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-muted-foreground">
                                <Percent className="h-3.5 w-3.5" />
                                <Label className="text-xs font-bold tracking-wider uppercase">
                                    Project Completion %
                                </Label>
                            </div>
                            <div className="flex items-center gap-3">
                                <Input
                                    type="number"
                                    placeholder="Min %"
                                    min={0}
                                    max={100}
                                    value={values.minProjectCompletion ?? ''}
                                    onChange={(e) =>
                                        onChange({
                                            ...values,
                                            minProjectCompletion: e.target.value
                                                ? Number(e.target.value)
                                                : undefined,
                                        })
                                    }
                                    className="h-10 flex-1 bg-background px-4 text-xs transition-all focus:ring-1"
                                />
                                <span className="shrink-0 text-[11px] font-bold text-muted-foreground/30">
                                    to
                                </span>
                                <Input
                                    type="number"
                                    placeholder="Max %"
                                    min={0}
                                    max={100}
                                    value={values.maxProjectCompletion ?? ''}
                                    onChange={(e) =>
                                        onChange({
                                            ...values,
                                            maxProjectCompletion: e.target.value
                                                ? Number(e.target.value)
                                                : undefined,
                                        })
                                    }
                                    className="h-10 flex-1 bg-background px-4 text-xs transition-all focus:ring-1"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
