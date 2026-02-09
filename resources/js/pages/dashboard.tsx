import { Head } from '@inertiajs/react';
import { ActiveProjectsList } from '@/components/dashboard/active-projects-list';
import { TodayReminders } from '@/components/reminders/today-reminders';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem, Reminder, Project } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

interface DashboardProps {
    todayReminders: Reminder[];
    activeProjects: Project[];
}

export default function Dashboard({ todayReminders, activeProjects }: DashboardProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-4 overflow-x-auto rounded-xl p-4">
                <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                    <div className="min-h-[200px] overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border">
                        <TodayReminders reminders={todayReminders} />
                    </div>
                    <div className="col-span-1 md:col-span-2 min-h-[200px] overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-card">
                        <ActiveProjectsList projects={activeProjects} />
                    </div>
                </div>
                <div className="relative min-h-[100vh] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 md:min-h-min dark:border-sidebar-border">
                {/* Future widgets can go here */}
                    <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/20 dark:stroke-neutral-100/20" />
                </div>
            </div>
        </AppLayout>
    );
}
