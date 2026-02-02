# Columns Component Documentation

## Overview
Defines the column configuration for the client data table using TanStack Table's column definition system. Includes custom rendering, filtering, and sorting logic.

## File Location
`resources/js/components/clients/Columns.tsx`

## Component Structure

This is not a React component but a configuration export:

```typescript
export const columns: ColumnDef<Client>[]
```

## Column Definitions

### 1. Name Column

```typescript
{
    accessorKey: 'name',
    header: ({ column }) => (
        <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
    ),
}
```

**Features**:
- Sortable (ascending/descending)
- Default rendering (text)
- Click header to toggle sort

### 2. Status Column

```typescript
{
    accessorKey: 'status',
    header: Sortable header,
    cell: ({ row }) => Custom badge rendering
}
```

**Features**:
- Sortable
- Custom cell rendering with colored badges
- Status-specific styling

**Status Mapping**:
```typescript
'Active' → Green badge (bg-green-100, text-green-800)
'Lead' → Blue badge (bg-blue-100, text-blue-800)
'At Risk' → Red badge (bg-red-100, text-red-800)
'In Active' → Gray badge (bg-gray-100, text-gray-800)
```

### 3. Tags Column

```typescript
{
    accessorKey: 'tags',
    header: 'Tags',
    filterFn: multiSelectFilter,
    cell: ({ row }) => Tag badges with custom colors
}
```

**Features**:
- Custom multi-select filter
- Displays multiple tags as badges
- Each tag uses its custom color
- White text for visibility

**Custom Filter Function**:
```typescript
const multiSelectFilter: FilterFn<Client> = (row, columnId, filterValue: string[]) => {
    // Empty filter = show all
    if (!filterValue || filterValue.length === 0) return true;
    
    const rowTags = row.original.tags;
    const filterHasNone = filterValue.includes('_none_');
    const rowHasNoTags = !rowTags || rowTags.length === 0;

    // Logic:
    // 1. If only '_none_' selected: show rows with no tags
    // 2. If tags selected: show rows with matching tags
    // 3. If '_none_' AND tags: show either no tags OR matching tags
    
    // Implementation handles all combinations
};
```

**Filter Value Types**:
- `[]` - Show all clients
- `['tag1']` - Show clients with tag1
- `['tag1', 'tag2']` - Show clients with tag1 OR tag2
- `['_none_']` - Show clients without any tags
- `['_none_', 'tag1']` - Show clients without tags OR with tag1

### 4. Company Name Column

```typescript
{
    accessorKey: 'company_name',
    header: 'Company Name',
}
```

**Features**:
- Simple text display
- No custom rendering

### 5. Email Column

```typescript
{
    accessorKey: 'email',
    header: 'Email',
}
```

### 6. Phone Column

```typescript
{
    accessorKey: 'phone',
    header: 'Phone',
}
```

### 7. Website Column

```typescript
{
    accessorKey: 'website',
    header: 'Website',
}
```

### 8. Address Column

```typescript
{
    accessorKey: 'address',
    header: 'Address',
}
```

## Data Flow

### Column Access
```
Client object → accessorKey → Cell value → Render function
```

### Sorting Flow
```
User clicks header → toggleSorting() → Table state updates → Re-render
```

### Filtering Flow
```
Filter value changes → filterFn() → Returns true/false → Row visibility
```

## Custom Rendering

### Status Badge
```typescript
cell: ({ row }) => {
    const status = row.getValue('status') as string;
    const badgeClass = getStatusClass(status);
    return <Badge variant="outline" className={badgeClass}>{status}</Badge>;
}
```

### Tags Display
```typescript
cell: ({ row }) => {
    const tags = row.original.tags;
    return (
        <div className="flex flex-wrap gap-1">
            {tags.map((tag) => (
                <Badge
                    key={tag.id}
                    style={{
                        backgroundColor: tag.color,
                        color: '#fff',
                    }}
                >
                    {tag.name}
                </Badge>
            ))}
        </div>
    );
}
```

## Data Transformations

### 1. Status to Badge Style
```typescript
status: string → badgeClass: string
'Active' → 'bg-green-100 text-green-800 border-green-200'
'Lead' → 'bg-blue-100 text-blue-800 border-blue-200'
'At Risk' → 'bg-red-100 text-red-800 border-red-200'
'In Active' → 'bg-gray-100 text-gray-800 border-gray-200'
```

### 2. Tags to Badges
```typescript
tags: Tag[] → Badge components with inline styles
Each tag: { id, name, color } → <Badge style={{ backgroundColor: color }}>
```

### 3. Filter Value Processing
```typescript
filterValue: string[] → boolean (show/hide row)

Examples:
['Active'] → row.status === 'Active'
['tag1', 'tag2'] → row.tags includes tag1 OR tag2
['_none_'] → row.tags.length === 0
```

## Filter Function Details

### multiSelectFilter Logic

```typescript
// Scenario 1: No filter applied
filterValue = [] → return true (show all)

// Scenario 2: Only "None" selected
filterValue = ['_none_']
rowHasNoTags = true → return true
rowHasNoTags = false → return false

// Scenario 3: Tags selected (no "None")
filterValue = ['tag1', 'tag2']
row.tags includes any → return true
row.tags includes none → return false

// Scenario 4: "None" + Tags selected
filterValue = ['_none_', 'tag1']
rowHasNoTags OR row.tags includes tag1 → return true
Otherwise → return false
```

## Components Used

### UI Components
- **Button**: Sortable column headers
- **Badge**: Status and tag display

### Icons
- **ArrowUpDown**: Sort indicator

## TypeScript Types

```typescript
import type { ColumnDef, FilterFn } from '@tanstack/react-table';
import type { Client } from '@/types';

// Column definition type
ColumnDef<Client>[]

// Filter function type
FilterFn<Client> = (
    row: Row<Client>,
    columnId: string,
    filterValue: any
) => boolean
```

## Usage

```typescript
import { columns } from '@/components/clients/Columns';
import { DataTable } from '@/components/clients/DataTable';

<DataTable columns={columns} data={clients} />
```

## Customization Points

### Adding a Column
```typescript
columns.push({
    accessorKey: 'new_field',
    header: 'New Field',
    cell: ({ row }) => customRenderFunction(row.getValue('new_field')),
});
```

### Custom Sort Function
```typescript
{
    accessorKey: 'field',
    header: 'Field',
    sortingFn: (rowA, rowB, columnId) => {
        // Custom sorting logic
        return comparison;
    },
}
```

### Custom Filter Function
```typescript
{
    accessorKey: 'field',
    header: 'Field',
    filterFn: (row, columnId, filterValue) => {
        // Custom filter logic
        return boolean;
    },
}
```

## Style Guide

### Status Colors
- **Active**: Green (success state)
- **Lead**: Blue (potential/new)
- **At Risk**: Red (warning/danger)
- **In Active**: Gray (neutral/disabled)

### Tag Badges
- Use tag's custom color as background
- White text for contrast
- Small gap (gap-1) between multiple tags
- Flex wrap for overflow

## Performance Notes

### Filter Function
The `multiSelectFilter` function is called for every row on every filter change. Keep logic efficient.

### Tag Rendering
Tags are rendered as individual Badge components. For clients with many tags, this could impact performance. Consider virtualization for large tag lists.

## Dependencies

- **@tanstack/react-table**: Column types and utilities
- **lucide-react**: Icons
- **shadcn/ui**: Badge, Button components
- **types**: Client type definition

## Related Components
- [DataTable.tsx](./DATATABLE.md) - Uses these columns
- [index.tsx](../pages/clients/INDEX.md) - Parent page
