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
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
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
import * as React from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
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
import type { Client, Tag } from '@/types';
import ClientFilters, { type ClientFilterValues } from './ClientFilters';

interface WithId {
    id: string | number;
    tags?: { id: number; name: string; color: string }[];
    status: string;
    monthly_value: number;
    activities_max_created_at?: string;
    projects?: { id: number; client_id: number; status: string }[];
}

interface DataTableProps<TData extends WithId, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    allTags?: Tag[];
    statuses?: string[];
    projectStatuses?: string[];
}

export function DataTable<TData extends WithId, TValue>({
    columns,
    data,
    allTags = [],
    statuses = [],
    projectStatuses = [],
}: DataTableProps<TData, TValue>) {
    'use no memo';
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] =
        React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});
    const [globalFilter, setGlobalFilter] = React.useState('');
    const [isFiltersVisible, setIsFiltersVisible] = React.useState(false);
    const [filterValues, setFilterValues] = React.useState<ClientFilterValues>({
        status: [],
    });

    const filteredData = React.useMemo(() => {
        return data.filter((item) => {
            // Status filter
            if (filterValues.status && filterValues.status.length > 0) {
                if (!filterValues.status.includes(item.status)) return false;
            }

            // Tags filter
            if (filterValues.tags && filterValues.tags.length > 0) {
                const itemTagIds = item.tags?.map((t) => Number(t.id)) || [];
                if (!filterValues.tags.some((id) => itemTagIds.includes(id)))
                    return false;
            }

            // Monthly Value filter
            const val = Number(item.monthly_value);
            if (
                filterValues.minValue !== undefined &&
                val < filterValues.minValue
            )
                return false;
            if (
                filterValues.maxValue !== undefined &&
                val > filterValues.maxValue
            )
                return false;

            // Last Contact filter
            if (filterValues.lastContactStart || filterValues.lastContactEnd) {
                if (!item.activities_max_created_at) return false;
                const lastContact = new Date(item.activities_max_created_at);
                if (
                    filterValues.lastContactStart &&
                    lastContact < new Date(filterValues.lastContactStart)
                )
                    return false;
                if (filterValues.lastContactEnd) {
                    const endDate = new Date(filterValues.lastContactEnd);
                    endDate.setHours(23, 59, 59, 999);
                    if (lastContact > endDate) return false;
                }
            }

            // Project Status filter
            if (
                filterValues.projectStatuses &&
                filterValues.projectStatuses.length > 0
            ) {
                const itemProjectStatuses =
                    item.projects?.map((p) => p.status) || [];
                if (
                    !filterValues.projectStatuses.some((s) =>
                        itemProjectStatuses.includes(s),
                    )
                )
                    return false;
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
            : filteredData;

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
                        onChange={(event) =>
                            setGlobalFilter(event.target.value)
                        }
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
                <ClientFilters
                    values={filterValues}
                    onChange={setFilterValues}
                    onClear={() => setFilterValues({ status: [] })}
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
                    {table.getFilteredSelectedRowModel().rows.length} of{' '}
                    {table.getFilteredRowModel().rows.length} row(s) selected.
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
