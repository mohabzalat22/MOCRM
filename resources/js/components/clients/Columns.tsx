import type { ColumnDef, FilterFn } from '@tanstack/react-table';
import { ArrowUpDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Tag } from '@/types';
import type { CustomField } from './custom-fields';

// Define custom filter function
const multiSelectFilter: FilterFn<Client> = (row, columnId, filterValue: string[]) => {
    if (!filterValue || filterValue.length === 0) return true;
    const rowTags = row.original.tags;
    
    // Check for "None" selection
    const filterHasNone = filterValue.includes('_none_');
    const rowHasNoTags = !rowTags || rowTags.length === 0;

    // If only "None" is selected, return rows with no tags
    if (filterValue.length === 1 && filterHasNone) {
        return rowHasNoTags;
    }

    // If we have "None" AND other tags, we want rows that match EITHER
    let matchesTags = false;
    if (rowTags && rowTags.length > 0) {
        matchesTags = rowTags.some(tag => filterValue.includes(tag.name));
    }

    if (filterHasNone) {
        return rowHasNoTags || matchesTags;
    }
    
    return matchesTags;
};

export type Client = {
    id: string;
    name: string;
    company_name?: string;
    email: string;
    phone?: string;
    website?: string;
    address?: string;
    image?: string;
    created_at: string;
    custom_fields: CustomField[];
    status: string;
    tags: Tag[];
};

export const columns: ColumnDef<Client>[] = [
    {
        accessorKey: 'name',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === 'asc')
                    }
                >
                    Name
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
    },
    {
        accessorKey: 'status',
        header: ({ column }) => {
            return (
                <Button
                    variant="ghost"
                    onClick={() =>
                        column.toggleSorting(column.getIsSorted() === 'asc')
                    }
                >
                    Status
                    <ArrowUpDown className="ml-2 h-4 w-4" />
                </Button>
            );
        },
        cell: ({ row }) => {
            const status = row.getValue('status') as string;
            
            // Map status to badge style
            const badgeVariant = "outline" as const;
            let badgeClass = "";
            
            // Using styles similar to StatusButton or custom colors
            switch (status) {
                case 'Active':
                    badgeClass = "bg-green-100 text-green-800 border-green-200 hover:bg-green-100";
                    break;
                case 'Lead':
                    badgeClass = "bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-100";
                    break;
                case 'At Risk':
                    badgeClass = "bg-red-100 text-red-800 border-red-200 hover:bg-red-100";
                    break;
                case 'In Active':
                    badgeClass = "bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-100";
                    break;
                default:
                    badgeClass = "";
            }

            return <Badge variant={badgeVariant} className={badgeClass}>{status}</Badge>;
        },
    },
    {
        accessorKey: 'tags',
        header: 'Tags',
        filterFn: multiSelectFilter, // Use the function reference directly
        cell: ({ row }) => {
            const tags = row.original.tags;
            return (
                <div className="flex flex-wrap gap-1">
                    {tags.map((tag) => (
                        <Badge
                            key={tag.id}
                            style={{
                                backgroundColor: tag.color,
                                color: '#fff', // Assuming white text
                            }}
                        >
                            {tag.name}
                        </Badge>
                    ))}
                </div>
            );
        },
    },
    {
        accessorKey: 'company_name',
        header: 'Company Name',
    },
    {
        accessorKey: 'email',
        header: 'Email',
    },
    {
        accessorKey: 'phone',
        header: 'Phone',
    },
    {
        accessorKey: 'website',
        header: 'Website',
    },
    {
        accessorKey: 'address',
        header: 'Address',
    },
];
