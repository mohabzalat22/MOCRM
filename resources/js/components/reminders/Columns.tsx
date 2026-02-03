import type { ColumnDef } from '@tanstack/react-table';
import { ArrowUpDown, Calendar, Clock, Edit2, Trash2 } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Reminder } from '@/types';


interface ColumnProps {
    onEdit: (reminder: Reminder) => void;
    onDelete: (reminder: Reminder) => void;
}

const priorityWeights: Record<string, number> = {
    low: 1,
    medium: 2,
    high: 3,
};

export const getColumns = ({ onEdit, onDelete }: ColumnProps): ColumnDef<Reminder>[] => [
    {
        accessorKey: 'remindable.name',
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
        cell: ({ row }) => <span className="font-medium px-4">{row.original.remindable?.name || 'N/A'}</span>
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
                >
                    What to do
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => (
            <div className="flex flex-col px-4">
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
                >
                    Description
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => (
            <div className="px-4 max-w-[300px]">
                <p className="text-sm line-clamp-2">
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
                >
                    When
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const date = new Date(row.original.reminder_at);
            return (
                <div className="flex flex-col text-sm px-4">
                    <span className="flex items-center gap-1.5 font-medium">
                        <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                        {date.toLocaleDateString()}
                    </span>
                    <span className="flex items-center gap-1.5 text-muted-foreground text-xs">
                        <Clock className="h-3.5 w-3.5" />
                        {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                </div>
            );
        }
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
                    return <Badge variant="destructive" className="bg-red-500 hover:bg-red-600">High</Badge>;
                case 'medium':
                    return <Badge variant="default" className="bg-yellow-500 hover:bg-yellow-600 text-yellow-950">Medium</Badge>;
                case 'low':
                    return <Badge variant="default" className="bg-green-500 hover:bg-green-600">Low</Badge>;
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
    {
        id: 'actions',
        accessorKey: 'actions',
        header: () => <div className="text-right pr-4">Actions</div>,
        cell: ({ row }) => (
            <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity pr-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(row.original)}
                >
                    <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => onDelete(row.original)}
                >
                    <Trash2 className="h-4 w-4" />
                </Button>
            </div>
        ),
    },
];
