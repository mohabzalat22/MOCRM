import { Head } from '@inertiajs/react';
import { columns } from '@/components/activities/Columns';
import { DataTable } from '@/components/activities/DataTable';
import AppLayout from '@/layouts/app-layout';
import type { BreadcrumbItem } from '@/types';
import type { Activity } from '@/types/activity';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Activities',
        href: '/activities',
    },
];

interface ActivitiesPageProps {
    activities: Activity[];
    clients: { id: number; name: string }[];
    activityTypes: string[];
    projectStatuses: string[];
}

export default function ActivitiesPage({
    activities,
    clients,
    activityTypes,
    projectStatuses,
}: ActivitiesPageProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Activities" />
            <div className="space-y-6 p-6">
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">
                            Activities
                        </h1>
                        <p className="text-muted-foreground">
                            View and filter all activities across your CRM.
                        </p>
                    </div>
                </div>
                <DataTable
                    columns={columns}
                    data={activities}
                    clients={clients}
                    activityTypes={activityTypes}
                    projectStatuses={projectStatuses}
                />
            </div>
        </AppLayout>
    );
}
