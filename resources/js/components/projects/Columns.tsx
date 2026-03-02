import type { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import type { Project, Tag } from '@/types';

const statusConfig: Record<
    string,
    {
        label: string;
        variant: 'default' | 'secondary' | 'destructive' | 'outline';
    }
> = {
    not_started: { label: 'Not Started', variant: 'outline' },
    in_progress: { label: 'In Progress', variant: 'outline' },
    on_hold: { label: 'On Hold', variant: 'outline' },
    completed: { label: 'Completed', variant: 'outline' },
    cancelled: { label: 'Cancelled', variant: 'outline' },
    archived: { label: 'Archived', variant: 'outline' },
};

export const getColumns = (): ColumnDef<Project>[] => [
    {
        id: 'select',
        header: ({ table }) => (
            <Checkbox
                checked={
                    table.getIsAllPageRowsSelected() ||
                    (table.getIsSomePageRowsSelected() && 'indeterminate')
                }
                onCheckedChange={(value) =>
                    table.toggleAllPageRowsSelected(!!value)
                }
                aria-label="Select all"
            />
        ),
        cell: ({ row }) => (
            <Checkbox
                checked={row.getIsSelected()}
                onCheckedChange={(value) => row.toggleSelected(!!value)}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'name',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === 'asc')
                    }
                >
                    Project Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => (
            <span className="font-medium">{row.original.name}</span>
        ),
    },
    {
        accessorKey: 'client.name',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === 'asc')
                    }
                >
                    Client
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => row.original.client?.name || '-',
    },
    {
        accessorKey: 'tasks_count',
        header: 'Tasks',
        cell: ({ row }) => {
            const project = row.original;
            const total = project.tasks_count || 0;
            const completed = project.completed_tasks_count || 0;

            if (total === 0)
                return (
                    <span className="text-xs text-muted-foreground">
                        No tasks
                    </span>
                );

            return (
                <div className="flex items-center gap-2 whitespace-nowrap">
                    <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
                        <div
                            className="h-full bg-primary"
                            style={{
                                width: `${Math.round((completed / total) * 100)}%`,
                            }}
                        />
                    </div>
                    <span className="text-[10px] font-medium">
                        {completed}/{total}
                    </span>
                </div>
            );
        },
    },
    {
        accessorKey: 'status',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === 'asc')
                    }
                >
                    Status
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const status = row.getValue('status') as string;
            const config = statusConfig[status] || {
                label: status,
                variant: 'secondary' as const,
            };
            return <Badge variant={config.variant}>{config.label}</Badge>;
        },
    },
    {
        accessorKey: 'tags',
        header: 'Tags',
        cell: ({ row }) => {
            const tags = row.original.tags || [];
            if (tags.length === 0) return null;

            return (
                <div className="flex flex-wrap gap-1">
                    {tags.map((tag: Tag) => (
                        <Badge
                            key={tag.id}
                            style={{
                                backgroundColor: tag.color,
                                color: '#fff',
                            }}
                        >
                            {tag.name}
                        </Badge>
                    ))}
                </div>
            );
        },
    },
    {
        accessorKey: 'start_date',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === 'asc')
                    }
                >
                    Start Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const date = new Date(row.original.start_date);
            return (
                <div className="flex items-center gap-1.5 text-sm">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{date.toLocaleDateString()}</span>
                </div>
            );
        },
    },
    {
        accessorKey: 'end_date',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === 'asc')
                    }
                >
                    Due Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            if (!row.original.end_date)
                return <span className="text-muted-foreground">-</span>;
            const date = new Date(row.original.end_date);
            return (
                <div className="flex items-center gap-1.5 text-sm">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{date.toLocaleDateString()}</span>
                </div>
            );
        },
    },
];
