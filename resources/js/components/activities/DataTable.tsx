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
import { ChevronDown, Search, Filter, FilterX } from 'lucide-react';
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
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type { Activity } from '@/types/activity';
import ActivityFilters, { type ActivityFilterValues } from './ActivityFilters';

interface DataTableProps {
    columns: ColumnDef<Activity, unknown>[];
    data: Activity[];
    clients: { id: number; name: string }[];
    activityTypes: string[];
}

export function DataTable({
    columns,
    data,
    clients,
    activityTypes,
}: DataTableProps) {
    'use no memo';
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] =
        React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});
    const [globalFilter, setGlobalFilter] = React.useState('');
    const [isFiltersVisible, setIsFiltersVisible] = React.useState(false);
    const [filterValues, setFilterValues] =
        React.useState<ActivityFilterValues>({});

    const filteredData = React.useMemo(() => {
        return data.filter((item) => {
            // Type filter
            if (filterValues.types && filterValues.types.length > 0) {
                if (!filterValues.types.includes(item.type)) return false;
            }

            // Client filter
            if (filterValues.clientIds && filterValues.clientIds.length > 0) {
                if (!filterValues.clientIds.includes(item.client_id))
                    return false;
            }

            // Date range filter
            if (filterValues.startDate || filterValues.endDate) {
                const occurredAt = new Date(item.occurred_at);
                if (
                    filterValues.startDate &&
                    occurredAt < new Date(filterValues.startDate)
                )
                    return false;
                if (filterValues.endDate) {
                    const endDate = new Date(filterValues.endDate);
                    endDate.setHours(23, 59, 59, 999);
                    if (occurredAt > endDate) return false;
                }
            }

            return true;
        });
    }, [data, filterValues]);

    /* eslint-disable react-hooks/incompatible-library */
    const table = useReactTable({
        data: filteredData,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onGlobalFilterChange: setGlobalFilter,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            globalFilter,
        },
    });

    const activeFilterCount = Object.values(filterValues).filter(
        (v) => v !== undefined && (Array.isArray(v) ? v.length > 0 : true),
    ).length;

    return (
        <div className="w-full">
            <div className="flex flex-wrap items-center gap-2 py-4">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search activities..."
                        value={globalFilter ?? ''}
                        onChange={(event) =>
                            setGlobalFilter(event.target.value)
                        }
                        className="pl-8"
                    />
                </div>

                <div className="ml-auto flex items-center gap-2">
                    <Button
                        variant={isFiltersVisible ? 'secondary' : 'outline'}
                        onClick={() => setIsFiltersVisible(!isFiltersVisible)}
                        className="relative"
                    >
                        {activeFilterCount > 0 ? (
                            <FilterX className="mr-2 h-4 w-4" />
                        ) : (
                            <Filter className="mr-2 h-4 w-4" />
                        )}
                        Filters
                        {activeFilterCount > 0 && (
                            <Badge
                                variant="default"
                                className="ml-2 h-5 w-5 justify-center rounded-full p-0 text-[10px]"
                            >
                                {activeFilterCount}
                            </Badge>
                        )}
                    </Button>

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
                                            className="capitalize"
                                            checked={column.getIsVisible()}
                                            onCheckedChange={(value) =>
                                                column.toggleVisibility(!!value)
                                            }
                                        >
                                            {column.id}
                                        </DropdownMenuCheckboxItem>
                                    );
                                })}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {isFiltersVisible && (
                <ActivityFilters
                    values={filterValues}
                    onChange={setFilterValues}
                    onClear={() => setFilterValues({})}
                    clients={clients}
                    activityTypes={activityTypes}
                />
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
                                    className="group hover:bg-muted/50"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell
                                            key={cell.id}
                                            className="py-3"
                                        >
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
                                    className="h-24 text-center"
                                >
                                    No results.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-between space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                    {table.getFilteredRowModel().rows.length} activity(s) found.
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
        </div>
    );
}
