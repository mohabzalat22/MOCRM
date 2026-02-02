# DataTable Component Documentation

## Overview
A highly customizable data table component built with TanStack Table (React Table v8). Provides sorting, filtering, pagination, column visibility, and row selection capabilities for client data.

## File Location
`resources/js/components/clients/DataTable.tsx`

## Component Structure

```typescript
interface DataTableProps<TData extends WithId, TValue> {
    columns: ColumnDef<TData, TValue>[];
    data: TData[];
}

interface WithId {
    id: string | number;
    tags?: { id: number; name: string; color: string }[];
}
```

## Props

### `columns` (ColumnDef<TData, TValue>[])
Array of column definitions from TanStack Table. Defines how each column should be rendered and behave.

### `data` (TData[])
Array of data items to display in the table. Must have an `id` property.

## State Management

### Local State
```typescript
const [sorting, setSorting] = useState<SortingState>([]);
const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
const [rowSelection, setRowSelection] = useState({});
const [globalFilter, setGlobalFilter] = useState('');
```

### Derived State
```typescript
const uniqueTags = useMemo(() => {
    // Extract and deduplicate tags from all data items
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
```

## Hooks Used

### 1. useReactTable (TanStack Table)
**Purpose**: Core table functionality

**Configuration**:
```typescript
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
```

### 2. useMemo (React)
**Purpose**: Memoize unique tags calculation to prevent unnecessary recalculations

### 3. router.visit (Inertia)
**Purpose**: Navigate to client detail page on row click

```typescript
onClick={() => router.visit(`clients/${row.original.id}`)}
```

## Data Flow

### 1. Props to Table
```
data prop → useReactTable → getCoreRowModel → Rendered rows
```

### 2. Filtering Flow
```
User types in search → setGlobalFilter → getFilteredRowModel → Update display
User selects status → setColumnFilters → Column-specific filter → Update display
User selects tags → Custom multiSelectFilter → Update display
```

### 3. Sorting Flow
```
User clicks column header → setSorting → getSortedRowModel → Update display
```

### 4. Navigation Flow
```
User clicks row → router.visit(`clients/${id}`) → Navigate to detail page
```

## Features

### 1. Global Search
```typescript
<Input
    placeholder="Search clients..."
    value={globalFilter ?? ''}
    onChange={(event) => setGlobalFilter(event.target.value)}
/>
```
Searches across all columns simultaneously.

### 2. Status Filter
```typescript
<Select
    onValueChange={(value) =>
        table.getColumn('status')?.setFilterValue(value === 'all' ? '' : value)
    }
>
    <SelectItem value="all">All Statuses</SelectItem>
    <SelectItem value="Active">Active</SelectItem>
    <SelectItem value="Lead">Lead</SelectItem>
    <SelectItem value="At Risk">At Risk</SelectItem>
    <SelectItem value="In Active">In Active</SelectItem>
</Select>
```

### 3. Tags Multi-Select Filter
Custom filter supporting:
- Multiple tag selection
- "None" option for clients without tags
- Clear filters option

```typescript
// Custom filter function
const multiSelectFilter: FilterFn<Client> = (row, columnId, filterValue: string[]) => {
    if (!filterValue || filterValue.length === 0) return true;
    const rowTags = row.original.tags;
    
    const filterHasNone = filterValue.includes('_none_');
    const rowHasNoTags = !rowTags || rowTags.length === 0;

    // If only "None" selected
    if (filterValue.length === 1 && filterHasNone) {
        return rowHasNoTags;
    }

    // Check if tags match
    let matchesTags = false;
    if (rowTags && rowTags.length > 0) {
        matchesTags = rowTags.some(tag => filterValue.includes(tag.name));
    }

    if (filterHasNone) {
        return !!(rowHasNoTags || matchesTags);
    }
    
    return matchesTags;
};
```

### 4. Column Visibility Toggle
```typescript
<DropdownMenu>
    <DropdownMenuTrigger>Columns</DropdownMenuTrigger>
    <DropdownMenuContent>
        {table.getAllColumns()
            .filter((column) => column.getCanHide())
            .map((column) => (
                <DropdownMenuCheckboxItem
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                        column.toggleVisibility(!!value)
                    }
                >
                    {column.id}
                </DropdownMenuCheckboxItem>
            ))}
    </DropdownMenuContent>
</DropdownMenu>
```

### 5. Pagination
```typescript
<Button
    onClick={() => table.previousPage()}
    disabled={!table.getCanPreviousPage()}
>
    Previous
</Button>
<Button
    onClick={() => table.nextPage()}
    disabled={!table.getCanNextPage()}
>
    Next
</Button>
```

### 6. Row Selection
```typescript
{table.getFilteredSelectedRowModel().rows.length} of{' '}
{table.getFilteredRowModel().rows.length} row(s) selected.
```

## Data Transformations

### 1. Tag Extraction and Deduplication
```typescript
data → Extract all tags → Create Map → Sort → Convert to array
Result: [{ name: string, color: string }]
```

### 2. Filter Value Processing
```typescript
// Status filter
'all' → '' (show all)
'Active' → 'Active' (filter by status)

// Tags filter
[] → undefined (show all)
['tag1', 'tag2'] → Filter by multiple tags
['_none_'] → Show only clients without tags
['_none_', 'tag1'] → Show clients without tags OR with tag1
```

## Row Click Behavior

### Normal Click
```typescript
onClick={(e) => {
    // Prevent navigation when clicking checkbox
    if ((e.target as HTMLElement).closest('[role="checkbox"]')) return;
    router.visit(`clients/${row.original.id}`);
}}
```

### Prevented Cases
- Clicking checkboxes
- Clicking action buttons (if any)

## Components Used

### UI Components
- **Input**: Search input
- **Select**: Status filter dropdown
- **DropdownMenu**: Tags filter and column visibility
- **Button**: Pagination and column header sorting
- **Badge**: Tag display and filter count
- **Table/TableHeader/TableBody/TableRow/TableCell**: Table structure

### Icons
- **Search**: Search input icon
- **Filter**: Tags filter icon
- **ChevronDown**: Column visibility dropdown

## Layout Structure

```
div.w-full
  ├─ div.filters (Search, Status, Tags, Columns)
  │   ├─ Input (Global search)
  │   ├─ Select (Status filter)
  │   ├─ DropdownMenu (Tags filter)
  │   └─ DropdownMenu (Column visibility)
  ├─ div.table-container
  │   └─ Table
  │       ├─ TableHeader
  │       │   └─ TableRow
  │       │       └─ TableHead[]
  │       └─ TableBody
  │           └─ TableRow[] (clickable)
  │               └─ TableCell[]
  └─ div.pagination
      ├─ span (Selection count)
      └─ Buttons (Previous/Next)
```

## Performance Considerations

### 1. Disabled Memoization
```typescript
"use no memo"; // Directive at top of component
```
This disables automatic memoization to prevent issues with table updates.

### 2. useMemo for Tags
Only recalculates unique tags when data changes.

### 3. Virtual Scrolling
Not implemented - could be added for very large datasets.

## Styling

### Table Styling
- Rounded border on table container
- Hover effects on rows
- Cursor pointer on clickable rows
- Selected row highlighting

### Filter Styling
- Dashed border on Tags filter button
- Badge count indicator
- Responsive flex layout

## Accessibility

### Keyboard Navigation
- Table supports standard keyboard navigation
- Dropdowns are keyboard accessible
- Buttons have proper focus states

### ARIA Labels
- Checkboxes have proper roles
- Buttons have descriptive text

## Error States

### Empty State
```typescript
{table.getRowModel().rows?.length ? (
    // Render rows
) : (
    <TableRow>
        <TableCell colSpan={columns.length}>
            No results.
        </TableCell>
    </TableRow>
)}
```

## Dependencies

- **@tanstack/react-table**: Table functionality
- **@inertiajs/react**: Navigation
- **lucide-react**: Icons
- **shadcn/ui**: UI components

## Usage Example

```typescript
import { DataTable } from '@/components/clients/DataTable';
import { columns } from '@/components/clients/Columns';

<DataTable columns={columns} data={clients} />
```

## Related Components
- [Columns.tsx](./COLUMNS.md) - Column definitions
- [index.tsx](../pages/clients/INDEX.md) - Parent page
