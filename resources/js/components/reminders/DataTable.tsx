import type {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
} from '@tanstack/react-table';
import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { ChevronDown, Search, Filter, X } from 'lucide-react';
import * as React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
} from '@/components/ui/select';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { useConfirmDialog } from '@/hooks/use-confirm-dialog';

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    status?: string;
    onStatusChange?: (value: string) => void;
    onRowClick?: (row: TData) => void;
}

export function DataTable<TData, TValue>({
    columns,
    data,
    status,
    onStatusChange,
    onRowClick,
}: DataTableProps<TData, TValue>) {
    'use no memo';
    const { confirm, ConfirmDialog } = useConfirmDialog();
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] =
        React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({});
    const [globalFilter, setGlobalFilter] = React.useState('');

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onGlobalFilterChange: setGlobalFilter,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            globalFilter,
        },
    });

    return (
        <div className="w-full">
            <div className="flex flex-wrap items-center gap-2 py-4">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search reminders..."
                        value={globalFilter ?? ''}
                        onChange={(event) =>
                            setGlobalFilter(event.target.value)
                        }
                        className="pl-8"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <Select
                        value={status === 'all' ? undefined : status}
                        onValueChange={onStatusChange}
                    >
                        <SelectTrigger className="h-9 w-auto min-w-[140px] gap-2 rounded-full border-muted-foreground/20 bg-background px-4 transition-all duration-200 hover:bg-accent">
                            <div className="flex items-center gap-2">
                                <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-sm font-medium">
                                    {status === 'all'
                                        ? 'All Statuses'
                                        : status === 'completed'
                                          ? 'Completed'
                                          : 'Incomplete'}
                                </span>
                                {status !== 'all' && (
                                    <Badge
                                        variant="secondary"
                                        className="ml-1 h-5 animate-in rounded-full px-1.5 text-[10px] font-bold uppercase transition-all zoom-in-50"
                                    >
                                        Active
                                    </Badge>
                                )}
                            </div>
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-muted-foreground/20 shadow-lg">
                            <SelectItem value="all" className="rounded-lg">
                                All Statuses
                            </SelectItem>
                            <SelectItem
                                value="incomplete"
                                className="rounded-lg"
                            >
                                Incomplete
                            </SelectItem>
                            <SelectItem
                                value="completed"
                                className="rounded-lg"
                            >
                                Completed
                            </SelectItem>
                        </SelectContent>
                    </Select>

                    {status !== 'all' && (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onStatusChange?.('all')}
                            className="h-9 animate-in gap-1.5 rounded-full px-3 text-muted-foreground transition-all slide-in-from-left-2 hover:bg-muted hover:text-foreground"
                        >
                            <X className="h-3.5 w-3.5" />
                            <span className="text-xs font-semibold">Clear</span>
                        </Button>
                    )}
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                Columns <ChevronDown className="ml-2 h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {table
                                .getAllColumns()
                                .filter((column) => column.getCanHide())
                                .map((column) => {
                                    return (
                                        <DropdownMenuCheckboxItem
                                            key={column.id}
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) =>
                                                column.toggleVisibility(!!value)
                                            }
                                        >
                                            {(
                                                column.columnDef.meta as {
                                                    label?: string;
                                                }
                                            )?.label || column.id}
                                        </DropdownMenuCheckboxItem>
                                    );
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {table.getFilteredSelectedRowModel().rows.length > 0 && (
                <div className="mb-4 flex animate-in items-center gap-2 rounded-md bg-muted/50 p-2 duration-200 fade-in slide-in-from-left-2">
                    <span className="pl-2 text-sm font-medium text-muted-foreground">
                        {table.getFilteredSelectedRowModel().rows.length}{' '}
                        selected
                    </span>
                    <div className="mx-2 h-4 w-[1px] bg-border" />
                    <Button
                        variant="secondary"
                        size="sm"
                        className="h-8 gap-2"
                        onClick={() => {
                            const ids = table
                                .getFilteredSelectedRowModel()
                                .rows.map(
                                    (row) =>
                                        (row.original as { id: number }).id,
                                );
                            import('@/services/reminderService').then(
                                ({ reminderService }) => {
                                    reminderService.bulkAction(
                                        status === 'completed'
                                            ? 'incomplete'
                                            : 'complete',
                                        ids,
                                        {
                                            onSuccess: () =>
                                                table.resetRowSelection(),
                                        },
                                    );
                                },
                            );
                        }}
                    >
                        {status === 'completed'
                            ? 'Mark as Incomplete'
                            : 'Mark as Complete'}
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        className="h-8 gap-2"
                        onClick={() => {
                            const ids = table
                                .getFilteredSelectedRowModel()
                                .rows.map(
                                    (row) =>
                                        (row.original as { id: number }).id,
                                );

                            confirm(
                                () => {
                                    import('@/services/reminderService').then(
                                        ({ reminderService }) => {
                                            reminderService.bulkAction(
                                                'delete',
                                                ids,
                                                {
                                                    onSuccess: () =>
                                                        table.resetRowSelection(),
                                                },
                                            );
                                        },
                                    );
                                },
                                {
                                    title: 'Delete Selected Reminders?',
                                    message: `Are you sure you want to delete ${ids.length} selected reminders? This action cannot be undone.`,
                                },
                            );
                        }}
                    >
                        Delete
                    </Button>
                </div>
            )}
            <div className="overflow-hidden rounded-md border bg-card shadow-sm">
                <Table>
                    <TableHeader className="bg-muted/50">
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                      header.column.columnDef
                                                          .header,
                                                      header.getContext(),
                                                  )}
                                        </TableHead>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={
                                        row.getIsSelected() && 'selected'
                                    }
                                    className={`group hover:bg-muted/50 ${onRowClick ? 'cursor-pointer' : ''}`}
                                    onClick={() => onRowClick?.(row.original)}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext(),
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center text-muted-foreground"
                                >
                                    No reminders found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-between space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                    Total {table.getFilteredRowModel().rows.length} reminder(s)
                </div>
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        Next
                    </Button>
                </div>
            </div>
            <ConfirmDialog />
        </div>
    );
}
