import { router } from '@inertiajs/react';
import type {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
} from '@tanstack/react-table';
import {
    flexRender,
    getCoreRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { ChevronDown, Search, Filter, FilterX } from 'lucide-react';
import { useState, useEffect } from 'react';
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
import type { PaginatedResponse } from '@/types';
import type { Activity } from '@/types/activity';
import ActivityFilters, { type ActivityFilterValues } from './ActivityFilters';

export interface TableFilters extends ActivityFilterValues {
    search?: string;
    sort?: string;
    direction?: 'asc' | 'desc';
    page?: number;
}

interface DataTableProps {
    columns: ColumnDef<Activity, unknown>[];
    data: Activity[];
    pagination?: PaginatedResponse<Activity>;
    filters?: TableFilters;
    clients: { id: number; name: string }[];
    activityTypes: string[];
    projectStatuses: string[];
}

export function DataTable({
    columns,
    data,
    pagination,
    filters,
    clients,
    activityTypes,
    projectStatuses,
}: DataTableProps) {
    'use no memo';
    const [sorting, setSorting] = useState<SortingState>(
        filters?.sort
            ? [{ id: filters.sort, desc: filters.direction === 'desc' }]
            : [],
    );
    const [columnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
        {},
    );
    const [rowSelection, setRowSelection] = useState({});
    const [globalFilter, setGlobalFilter] = useState(filters?.search ?? '');
    const [isFiltersVisible, setIsFiltersVisible] = useState(
        Object.keys(filters || {}).some(
            (k) =>
                !['sort', 'direction', 'search', 'page'].includes(k) &&
                filters?.[k as keyof TableFilters],
        ),
    );
    const [filterValues, setFilterValues] = useState<ActivityFilterValues>(
        () => {
            const initial = { ...filters };
            if (initial.clientIds) {
                initial.clientIds = (
                    initial.clientIds as (string | number)[]
                ).map((c) => Number(c));
            }
            return initial || {};
        },
    );

    // Sync filters with props when they change (e.g. on navigation)
    useEffect(() => {
        if (filters) {
            const normalizedFilters = { ...filters };
            if (normalizedFilters.clientIds) {
                normalizedFilters.clientIds = (
                    normalizedFilters.clientIds as (string | number)[]
                ).map((c) => Number(c));
            }
            setFilterValues(normalizedFilters);
            if (filters.search !== undefined)
                setGlobalFilter(filters.search as string);
            if (filters.sort) {
                setSorting([
                    { id: filters.sort, desc: filters.direction === 'desc' },
                ]);
            }
        }
    }, [filters]);

    const handleFilterChange = (newValues: ActivityFilterValues) => {
        setFilterValues(newValues);
        updateQuery({ ...newValues, page: 1 });
    };

    const updateQuery = (
        newParams: Record<
            string,
            string | number | string[] | number[] | undefined
        >,
    ) => {
        const currentParams: Record<
            string,
            string | number | string[] | number[] | undefined
        > = {
            search: globalFilter,
            sort: sorting[0]?.id,
            direction: sorting[0]?.desc ? 'desc' : 'asc',
            ...filterValues,
            ...newParams,
        };

        // Remove empty values
        Object.keys(currentParams).forEach((key) => {
            const val = currentParams[key];
            if (
                val === undefined ||
                val === '' ||
                (Array.isArray(val) && val.length === 0)
            ) {
                delete currentParams[key];
            }
        });

        router.get(window.location.pathname, currentParams, {
            preserveState: true,
            preserveScroll: true,
            replace: true,
        });
    };

    /* eslint-disable react-hooks/incompatible-library */
    const table = useReactTable({
        data,
        columns,
        manualPagination: true,
        manualSorting: true,
        manualFiltering: true,
        pageCount: pagination?.last_page ?? 1,
        onSortingChange: (updater) => {
            const nextSorting =
                typeof updater === 'function' ? updater(sorting) : updater;
            setSorting(nextSorting);
            updateQuery({
                sort: nextSorting[0]?.id,
                direction: nextSorting[0]?.desc ? 'desc' : 'asc',
                page: 1,
            });
        },
        getCoreRowModel: getCoreRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
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
                        onChange={(event) => {
                            const val = event.target.value;
                            setGlobalFilter(val);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                updateQuery({ search: globalFilter, page: 1 });
                            }
                        }}
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
                    onChange={handleFilterChange}
                    onClear={() => handleFilterChange({})}
                    clients={clients}
                    activityTypes={activityTypes}
                    projectStatuses={projectStatuses}
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
                                    className="group cursor-pointer hover:bg-muted/50"
                                    onClick={() =>
                                        router.visit(
                                            `/activities/${row.original.id}`,
                                        )
                                    }
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
                    {pagination ? (
                        <>
                            Showing {pagination.from} to {pagination.to} of{' '}
                            {pagination.total} results
                        </>
                    ) : (
                        <>{data.length} activity(s) found.</>
                    )}
                </div>
                <div className="flex items-center space-x-2">
                    {pagination?.links.map((link, i) => {
                        if (
                            link.label.includes('Previous') ||
                            link.label.includes('Next')
                        ) {
                            return (
                                <Button
                                    key={i}
                                    variant="outline"
                                    size="sm"
                                    onClick={() =>
                                        router.get(
                                            link.url!,
                                            {},
                                            {
                                                preserveState: true,
                                                preserveScroll: true,
                                            },
                                        )
                                    }
                                    disabled={!link.url}
                                >
                                    {link.label.includes('Previous')
                                        ? 'Previous'
                                        : 'Next'}
                                </Button>
                            );
                        }
                        if (pagination.last_page > 1) {
                            return (
                                <Button
                                    key={i}
                                    variant={
                                        link.active ? 'default' : 'outline'
                                    }
                                    size="sm"
                                    onClick={() =>
                                        link.url &&
                                        router.get(
                                            link.url,
                                            {},
                                            {
                                                preserveState: true,
                                                preserveScroll: true,
                                            },
                                        )
                                    }
                                    disabled={!link.url}
                                    className="hidden h-8 w-8 p-0 sm:flex"
                                >
                                    <span
                                        dangerouslySetInnerHTML={{
                                            __html: link.label,
                                        }}
                                    />
                                </Button>
                            );
                        }
                        return null;
                    })}
                </div>
            </div>
        </div>
    );
}
