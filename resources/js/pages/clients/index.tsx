import { Head } from '@inertiajs/react';
import { columns } from '@/components/clients/Columns';
import { DataTable } from '@/components/clients/DataTable';
import { ClientDialog } from '@/components/clients/dialog';
import AppLayout from '@/layouts/app-layout';
import type { Client, Tag } from '@/types';
import type { BreadcrumbItem } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Clients',
        href: '/clients',
    },
];

interface ClientsPageProps {
    clients: Client[];
    allTags: Tag[];
}

export default function clients({ clients, allTags }: ClientsPageProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Clients" />
            <div className="space-y-6 p-6">
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Clients
                        </h1>
                        <p className="text-muted-foreground">
                            Manage your client relationships and information.
                        </p>
                    </div>
                    <ClientDialog></ClientDialog>
                </div>
                <DataTable columns={columns} data={clients} allTags={allTags} />
            </div>
        </AppLayout>
    );
}
