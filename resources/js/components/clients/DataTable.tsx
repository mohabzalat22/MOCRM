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
import {
    ChevronDown,
    Search,
    Filter,
    CheckCircle2,
    Tag as TagIcon,
    Download,
    FilterX,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
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
import { clientService } from '@/services/clientService';
import type { Client, Tag, PaginatedResponse } from '@/types';
import ClientFilters, { type ClientFilterValues } from './ClientFilters';

interface WithId {
    id: string | number;
    tags?: { id: number; name: string; color: string }[];
    status: string;
    monthly_value: number;
    activities_max_created_at?: string;
    projects?: { id: number; client_id: number; status: string }[];
}

export interface TableFilters extends ClientFilterValues {
    search?: string;
    sort?: string;
    direction?: 'asc' | 'desc';
    page?: number;
}

interface DataTableProps<TData extends WithId, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    pagination?: PaginatedResponse<TData>;
    filters?: TableFilters;
    allTags?: Tag[];
    statuses?: string[];
    projectStatuses?: string[];
}

export function DataTable<TData extends WithId, TValue>({
    columns,
    data,
    pagination,
    filters,
    allTags = [],
    statuses = [],
    projectStatuses = [],
}: DataTableProps<TData, TValue>) {
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
                filters?.[k as keyof ClientFilterValues],
        ),
    );
    const [filterValues, setFilterValues] = useState<ClientFilterValues>(() => {
        const initial = { ...filters };
        if (initial.tags) {
            initial.tags = (initial.tags as (string | number)[]).map((t) =>
                Number(t),
            );
        }
        return initial || { status: [] };
    });

    // Sync filters with props when they change (e.g. on navigation)
    useEffect(() => {
        if (filters) {
            const normalizedFilters = { ...filters };
            if (normalizedFilters.tags) {
                normalizedFilters.tags = (
                    normalizedFilters.tags as (string | number)[]
                ).map((t) => Number(t));
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

    const handleFilterChange = (newValues: ClientFilterValues) => {
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

    // eslint-disable-next-line react-hooks/incompatible-library
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

    const selectedRows = table.getFilteredSelectedRowModel().rows;
    const hasSelection = selectedRows.length > 0;
    const activeFilterCount = Object.values(filterValues).filter(
        (v) => v !== undefined && (Array.isArray(v) ? v.length > 0 : true),
    ).length;

    const handleBulkAction = (action: string, value?: string | number) => {
        const ids = selectedRows.map((row) => row.original.id);

        clientService.bulkUpdate({
            ids,
            action,
            status: action === 'change_status' ? (value as string) : undefined,
            tag_id: action === 'add_tag' ? (value as number) : undefined,
            onSuccess: () => {
                table.resetRowSelection();
                toast.success('Bulk action completed successfully.');
            },
            onError: () => {
                toast.error('Failed to complete bulk action.');
            },
        });
    };

    const handleExport = () => {
        const rowsToExport = hasSelection
            ? selectedRows.map((r) => r.original)
            : data;

        const headers = ['Name', 'Company', 'Email', 'Phone', 'Status', 'Tags'];
        const csvData = [
            headers.join(','),
            ...rowsToExport.map((row) => {
                const client = row as unknown as Client;
                const tags = (client.tags || []).map((t) => t.name).join('; ');
                return [
                    `"${client.name || ''}"`,
                    `"${client.company_name || ''}"`,
                    `"${client.email || ''}"`,
                    `"${client.phone || ''}"`,
                    `"${client.status || ''}"`,
                    `"${tags}"`,
                ].join(',');
            }),
        ].join('\n');

        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'clients_export.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="w-full">
            <div className="flex flex-wrap items-center gap-2 py-4">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute top-2.5 left-2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search clients..."
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

                {/* Bulk Actions */}
                {hasSelection && (
                    <div className="flex animate-in items-center gap-2 duration-200 fade-in slide-in-from-left-2">
                        <div className="mx-2 h-8 w-[1px] bg-border" />

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="h-8"
                                >
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Change Status
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem
                                    onClick={() =>
                                        handleBulkAction(
                                            'change_status',
                                            'Active',
                                        )
                                    }
                                >
                                    Active
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() =>
                                        handleBulkAction(
                                            'change_status',
                                            'Lead',
                                        )
                                    }
                                >
                                    Lead
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() =>
                                        handleBulkAction(
                                            'change_status',
                                            'At Risk',
                                        )
                                    }
                                >
                                    At Risk
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                    onClick={() =>
                                        handleBulkAction(
                                            'change_status',
                                            'In Active',
                                        )
                                    }
                                >
                                    In Active
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="h-8"
                                >
                                    <TagIcon className="mr-2 h-4 w-4" />
                                    Add Tag
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="max-h-[300px] overflow-y-auto">
                                {allTags.map((tag) => (
                                    <DropdownMenuItem
                                        key={tag.id}
                                        onClick={() =>
                                            handleBulkAction('add_tag', tag.id)
                                        }
                                    >
                                        <div className="flex items-center gap-2">
                                            <div
                                                className="h-2 w-2 rounded-full"
                                                style={{
                                                    backgroundColor: tag.color,
                                                }}
                                            />
                                            {tag.name}
                                        </div>
                                    </DropdownMenuItem>
                                ))}
                                {allTags.length === 0 && (
                                    <DropdownMenuItem disabled>
                                        No tags available
                                    </DropdownMenuItem>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Button
                            variant="secondary"
                            size="sm"
                            className="h-8"
                            onClick={handleExport}
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Export ({selectedRows.length})
                        </Button>
                    </div>
                )}

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
                <ClientFilters
                    values={filterValues}
                    onChange={handleFilterChange}
                    onClear={() => handleFilterChange({ status: [] })}
                    allTags={allTags}
                    statuses={statuses}
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
                                    className="group hover:bg-muted/50"
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell
                                            key={cell.id}
                                            onClick={(e) => {
                                                // Prevent navigation when clicking checkbox or actions
                                                if (
                                                    (
                                                        e.target as HTMLElement
                                                    ).closest(
                                                        '[role="checkbox"]',
                                                    )
                                                )
                                                    return;
                                                router.visit(
                                                    `clients/${row.original.id}`,
                                                );
                                            }}
                                            className="cursor-pointer"
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
                    {pagination ? (
                        <>
                            Showing {pagination.from} to {pagination.to} of{' '}
                            {pagination.total} results
                        </>
                    ) : (
                        <>
                            {table.getFilteredSelectedRowModel().rows.length} of{' '}
                            {table.getFilteredRowModel().rows.length} row(s)
                            selected.
                        </>
                    )}
                </div>
                <div className="flex items-center space-x-2">
                    {pagination?.links.map((link, i) => {
                        // Skip "Previous" and "Next" labels if they are not needed or duplicated
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
                        // Only show numeric links if there are more than 1 page
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
