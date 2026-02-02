import { router } from '@inertiajs/react';
import type {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState} from '@tanstack/react-table';
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
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
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

interface WithId {
    id: string | number;
    tags?: { id: number; name: string; color: string }[];
}

interface DataTableProps<TData extends WithId, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
    allTags?: Tag[];
}

export function DataTable<TData extends WithId, TValue>({
    columns,
    data,
    allTags = [],
}: DataTableProps<TData, TValue>) {
    "use no memo";
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
        [],
    );
    const [columnVisibility, setColumnVisibility] =
        React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});
    const [globalFilter, setGlobalFilter] = React.useState('');

    // Extract unique tags from data for the filter
    const uniqueTags = React.useMemo(() => {
        const tagsMap = new Map<string, string>();
        data.forEach((item) => {
            item.tags?.forEach((tag) => {
                 if (!tagsMap.has(tag.name)) {
                     tagsMap.set(tag.name, tag.color);
                 }
            });
        });
        return Array.from(tagsMap.entries())
            .sort((a, b) => a[0].localeCompare(b[0]))
            .map(([name, color]) => ({ name, color }));
    }, [data]);
/* eslint-disable react-hooks/incompatible-library */
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

    const handleBulkAction = (action: string, value?: string | number) => {
        const ids = selectedRows.map((row) => row.original.id);
        
        clientService.bulkUpdate({
            ids,
            action,
            status: action === 'change_status' ? value as string : undefined,
            tag_id: action === 'add_tag' ? value as number : undefined,
            onSuccess: () => {
                table.resetRowSelection();
                toast.success('Bulk action completed successfully.');
            },
            onError: () => {
                toast.error('Failed to complete bulk action.');
            }
        });
    };

    const handleExport = () => {
        const rowsToExport = hasSelection 
            ? selectedRows.map(r => r.original) 
            : data;
            
        const headers = ["Name", "Company", "Email", "Phone", "Status", "Tags"];
        const csvData = [
            headers.join(","),
            ...rowsToExport.map((row) => {
                const client = row as unknown as Client;
                const tags = (client.tags || []).map((t) => t.name).join("; ");
                return [
                    `"${client.name || ''}"`,
                    `"${client.company_name || ''}"`,
                    `"${client.email || ''}"`,
                    `"${client.phone || ''}"`,
                    `"${client.status || ''}"`,
                    `"${tags}"`
                ].join(",");
            })
        ].join("\n");

        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", "clients_export.csv");
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="w-full">
            <div className="flex items-center py-4 gap-2 flex-wrap">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search clients..."
                        value={globalFilter ?? ''}
                        onChange={(event) =>
                            setGlobalFilter(event.target.value)
                        }
                        className="pl-8"
                    />
                </div>
                
                {/* Status Filter */}
                <Select
                    onValueChange={(value) =>
                        table.getColumn('status')?.setFilterValue(value === 'all' ? '' : value)
                    }
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by Status" />
                    </SelectTrigger>
                    <SelectContent>
                         <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Lead">Lead</SelectItem>
                        <SelectItem value="At Risk">At Risk</SelectItem>
                        <SelectItem value="In Active">In Active</SelectItem>
                    </SelectContent>
                </Select>

                {/* Tags Filter */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-2 border-dashed">
                            <Filter className="mr-2 h-4 w-4" />
                            Filter Tags
                            {/* Show count of selected filters */}
                            {(table.getColumn('tags')?.getFilterValue() as string[])?.length > 0 && (
                                <Badge variant="secondary" className="ml-2 rounded-sm px-1 font-normal">
                                    {(table.getColumn('tags')?.getFilterValue() as string[]).length}
                                </Badge>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-[200px]">
                         <DropdownMenuLabel>Filter by Tag</DropdownMenuLabel>
                         <DropdownMenuSeparator />
                         <div className="max-h-[300px] overflow-y-auto">
                            {/* None Option */}
                            <DropdownMenuCheckboxItem
                                checked={(table.getColumn('tags')?.getFilterValue() as string[])?.includes('_none_')}
                                onCheckedChange={(checked) => {
                                    const filterValue = (table.getColumn('tags')?.getFilterValue() as string[]) || [];
                                    const newValue = checked
                                        ? [...filterValue, '_none_']
                                        : filterValue.filter((val) => val !== '_none_');
                                    table.getColumn('tags')?.setFilterValue(newValue.length ? newValue : undefined);
                                }}
                            >
                                <span className="text-muted-foreground italic">None (No Tags)</span>
                            </DropdownMenuCheckboxItem>
                            
                            {uniqueTags.map((tag) => {
                                 const filterValue = (table.getColumn('tags')?.getFilterValue() as string[]) || [];
                                 const isSelected = filterValue.includes(tag.name);
                                 return (
                                    <DropdownMenuCheckboxItem
                                        key={tag.name}
                                        checked={isSelected}
                                        onCheckedChange={(checked) => {
                                            const newValue = checked
                                                ? [...filterValue, tag.name]
                                                : filterValue.filter((val) => val !== tag.name);
                                            table.getColumn('tags')?.setFilterValue(newValue.length ? newValue : undefined);
                                        }}
                                    >
                                        <div className="flex items-center gap-2">
                                            <span 
                                                className="h-2 w-2 rounded-full" 
                                                style={{ backgroundColor: tag.color }}
                                            />
                                            {tag.name}
                                        </div>
                                    </DropdownMenuCheckboxItem>
                                );
                            })}
                        </div>
                        {uniqueTags.length === 0 && <DropdownMenuItem disabled>No tags found</DropdownMenuItem>}
                        {(table.getColumn('tags')?.getFilterValue() as string[])?.length > 0 && (
                            <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onSelect={() => table.getColumn('tags')?.setFilterValue(undefined)}
                                    className="justify-center text-center"
                                >
                                    Clear filters
                                </DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>

                {/* Bulk Actions */}
                {hasSelection && (
                    <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-200">
                        <div className="h-8 w-[1px] bg-border mx-2" />
                        
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="secondary" size="sm" className="h-8">
                                    <CheckCircle2 className="mr-2 h-4 w-4" />
                                    Change Status
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => handleBulkAction('change_status', 'Active')}>Active</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleBulkAction('change_status', 'Lead')}>Lead</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleBulkAction('change_status', 'At Risk')}>At Risk</DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleBulkAction('change_status', 'In Active')}>In Active</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="secondary" size="sm" className="h-8">
                                    <TagIcon className="mr-2 h-4 w-4" />
                                    Add Tag
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="max-h-[300px] overflow-y-auto">
                                {allTags.map(tag => (
                                    <DropdownMenuItem key={tag.id} onClick={() => handleBulkAction('add_tag', tag.id)}>
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full" style={{ backgroundColor: tag.color }} />
                                            {tag.name}
                                        </div>
                                    </DropdownMenuItem>
                                ))}
                                {allTags.length === 0 && <DropdownMenuItem disabled>No tags available</DropdownMenuItem>}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Button variant="secondary" size="sm" className="h-8" onClick={handleExport}>
                            <Download className="mr-2 h-4 w-4" />
                            Export ({selectedRows.length})
                        </Button>
                    </div>
                )}

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ml-auto">
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

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
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
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id} 
                                            onClick={(e) => {
                                                  // Prevent navigation when clicking checkbox or actions
                                                 if ((e.target as HTMLElement).closest('[role="checkbox"]')) return;
                                                router.visit(`clients/${row.original.id}`);
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
