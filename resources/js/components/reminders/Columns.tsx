import type { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, Calendar, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import type { Reminder } from '@/types';

const priorityWeights: Record<string, number> = {
    low: 1,
    medium: 2,
    high: 3,
};

export const getColumns = (): ColumnDef<Reminder>[] => [
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
                onClick={(e) => e.stopPropagation()}
                aria-label="Select row"
            />
        ),
        enableSorting: false,
        enableHiding: false,
    },
    {
        accessorKey: 'remindable.name',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === 'asc')
                    }
                    className="-ml-4"
                >
                    Client
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => (
            <span className="font-medium">
                {row.original.remindable?.name || '-'}
            </span>
        ),
    },
    {
        accessorKey: 'title',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === 'asc')
                    }
                    className="-ml-4"
                >
                    What to do
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => (
            <div className="flex flex-col">
                <span className="font-medium">{row.original.title}</span>
            </div>
        ),
    },
    {
        accessorKey: 'description',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === 'asc')
                    }
                    className="-ml-4"
                >
                    Description
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => (
            <div className="max-w-[300px]">
                <p className="line-clamp-2 text-sm">
                    {row.original.description || '-'}
                </p>
            </div>
        ),
    },
    {
        accessorKey: 'reminder_at',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === 'asc')
                    }
                    className="-ml-4"
                >
                    When
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const date = new Date(row.original.reminder_at);
            return (
                <div className="flex flex-col text-sm">
                    <span className="flex items-center gap-1.5 font-medium">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        {date.toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        {date.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </span>
                </div>
            );
        },
    },
    {
        accessorKey: 'priority',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === 'asc')
                    }
                    className="-ml-4"
                >
                    Priority
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const priority = row.getValue('priority') as string;
            switch (priority) {
                case 'high':
                    return (
                        <Badge
                            variant="destructive"
                            className="bg-red-500 hover:bg-red-600"
                        >
                            High
                        </Badge>
                    );
                case 'medium':
                    return (
                        <Badge
                            variant="default"
                            className="bg-yellow-500 text-yellow-950 hover:bg-yellow-600"
                        >
                            Medium
                        </Badge>
                    );
                case 'low':
                    return (
                        <Badge
                            variant="default"
                            className="bg-green-500 hover:bg-green-600"
                        >
                            Low
                        </Badge>
                    );
                default:
                    return <Badge variant="secondary">{priority}</Badge>;
            }
        },
        sortingFn: (rowA, rowB, columnId) => {
            const a = priorityWeights[rowA.getValue(columnId) as string] || 0;
            const b = priorityWeights[rowB.getValue(columnId) as string] || 0;
            return a - b;
        },
    },
];
