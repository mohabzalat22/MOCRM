import { Link } from '@inertiajs/react';
import type { ColumnDef } from '@tanstack/react-table';
import { format } from 'date-fns';
import {
    ArrowUpDown,
    Phone,
    Mail,
    Users,
    FileText,
    DollarSign,
    RefreshCw,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import type { Activity } from '@/types/activity';

const typeIcons: Record<string, React.ElementType> = {
    call: Phone,
    email: Mail,
    meeting: Users,
    note: FileText,
    transaction: DollarSign,
    status_change: RefreshCw,
};

const typeColors: Record<string, string> = {
    call: 'bg-blue-100 text-blue-800 border-blue-200',
    email: 'bg-purple-100 text-purple-800 border-purple-200',
    meeting: 'bg-green-100 text-green-800 border-green-200',
    note: 'bg-orange-100 text-orange-800 border-orange-200',
    transaction: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    status_change: 'bg-gray-100 text-gray-800 border-gray-200',
};

export const columns: ColumnDef<Activity>[] = [
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
        accessorKey: 'type',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === 'asc')
                    }
                    className="-ml-4"
                >
                    Type
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        meta: { label: 'Type' },
        cell: ({ row }) => {
            const type = row.getValue('type') as string;
            const Icon = typeIcons[type] || FileText;
            return (
                <Badge variant="outline" className={typeColors[type] || ''}>
                    <Icon className="mr-1 h-3 w-3" />
                    {type.charAt(0).toUpperCase() +
                        type.slice(1).replace('_', ' ')}
                </Badge>
            );
        },
    },
    {
        accessorKey: 'client.name',
        header: 'Client',
        meta: { label: 'Client' },
        cell: ({ row }) => {
            const client = row.original.client;
            if (!client) return '-';
            return (
                <Link
                    href={`/clients/${client.id}`}
                    className="font-medium text-primary hover:underline"
                    onClick={(e) => e.stopPropagation()}
                >
                    {client.name}
                </Link>
            );
        },
    },
    {
        accessorKey: 'summary',
        header: 'Summary',
        meta: { label: 'Summary' },
        cell: ({ row }) => {
            const summary = row.getValue('summary') as string;
            return (
                <div className="max-w-[400px] truncate">{summary || '-'}</div>
            );
        },
    },
    {
        accessorKey: 'occurred_at',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === 'asc')
                    }
                    className="-ml-4"
                >
                    Date
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        meta: { label: 'Date' },
        cell: ({ row }) => {
            const date = row.getValue('occurred_at') as string;
            return format(new Date(date), 'MMM d, yyyy h:mm a');
        },
    },
    {
        accessorKey: 'user.name',
        header: 'Created By',
        meta: { label: 'Created By' },
        cell: ({ row }) => row.original.user?.name || '-',
    },
];
