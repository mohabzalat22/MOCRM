import { Head } from '@inertiajs/react';
import { columns } from '@/components/clients/Columns';
import type { Client } from '@/components/clients/Columns';
import { DataTable } from '@/components/clients/DataTable';
import { ClientDialog } from '@/components/clients/dialog';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Clients',
        href: '/clients',
    },
];

interface ClientsPageProps {
    clients: Client[];
}

export default function clients({ clients }: ClientsPageProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Clients" />
            <div className="p-4">
                {/* bar */}
                <div className="mb-1 flex items-center justify-between">
                    <h2>My Clients</h2>
                    <ClientDialog></ClientDialog>
                </div>
                <DataTable columns={columns} data={clients} />
            </div>
        </AppLayout>
    );
}
