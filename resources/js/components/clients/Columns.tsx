import type { ColumnDef } from '@tanstack/react-table';
import type { CustomField } from './custom-fields';

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
};

export const columns: ColumnDef<Client>[] = [
    {
        accessorKey: 'name',
        header: 'Name',
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
