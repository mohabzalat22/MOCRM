import {
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import type {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
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
import type { Project, Tag } from '@/types';
import ProjectFilters, { type ProjectFilterValues } from './ProjectFilters';

interface DataTableProps<TData extends Project, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    allTags?: Tag[];
    clients?: { id: number; name: string }[];
    statuses?: string[];
}

export function DataTable<TData extends Project, TValue>({
    columns,
    data,
    allTags = [],
    clients = [],
    statuses = [],
}: DataTableProps<TData, TValue>) {
    'use no memo';
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] =
        React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({});
    const [globalFilter, setGlobalFilter] = React.useState('');
    const [isFiltersVisible, setIsFiltersVisible] = React.useState(false);
    const [filterValues, setFilterValues] = React.useState<ProjectFilterValues>(
        {},
    );

    const filteredData = React.useMemo(() => {
        return data.filter((item) => {
            // Status filter
            if (filterValues.status && filterValues.status.length > 0) {
                if (!filterValues.status.includes(item.status)) return false;
            }

            // Client filter
            if (filterValues.clientId && filterValues.clientId.length > 0) {
                if (!filterValues.clientId.includes(item.client_id))
                    return false;
            }

            // Tags filter
            if (filterValues.tags && filterValues.tags.length > 0) {
                const itemTagIds = item.tags?.map((t) => Number(t.id)) || [];
                if (!filterValues.tags.some((id) => itemTagIds.includes(id)))
                    return false;
            }

            // Due Date filter
            if (filterValues.dueDateStart || filterValues.dueDateEnd) {
                if (!item.end_date) return false;
                const dueDate = new Date(item.end_date);
                if (
                    filterValues.dueDateStart &&
                    dueDate < new Date(filterValues.dueDateStart)
                )
                    return false;
                if (filterValues.dueDateEnd) {
                    const endDate = new Date(filterValues.dueDateEnd);
                    endDate.setHours(23, 59, 59, 999);
                    if (dueDate > endDate) return false;
                }
            }

            // Completion Percentage filter
            if (
                filterValues.minCompletion !== undefined ||
                filterValues.maxCompletion !== undefined
            ) {
                const tasksCount = item.tasks_count || 0;
                const completedCount = item.completed_tasks_count || 0;
                const completion =
                    tasksCount > 0 ? (completedCount / tasksCount) * 100 : 0;

                if (
                    filterValues.minCompletion !== undefined &&
                    completion < filterValues.minCompletion
                )
                    return false;
                if (
                    filterValues.maxCompletion !== undefined &&
                    completion > filterValues.maxCompletion
                )
                    return false;
            }

            return true;
        });
    }, [data, filterValues]);

    // eslint-disable-next-line react-hooks/incompatible-library
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
        onGlobalFilterChange: setGlobalFilter,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
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
                        placeholder="Search projects..."
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
                <ProjectFilters
                    values={filterValues}
                    onChange={setFilterValues}
                    onClear={() => setFilterValues({})}
                    allTags={allTags}
                    clients={clients}
                    statuses={statuses}
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
                                    No projects found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                    Total {table.getFilteredRowModel().rows.length} project(s)
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
