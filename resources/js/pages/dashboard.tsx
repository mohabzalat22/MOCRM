import { Head } from '@inertiajs/react';
import { ActiveProjectsList } from '@/components/dashboard/active-projects-list';
import { AtRiskClientsList } from '@/components/dashboard/at-risk-clients-list';
import { DueTodayTasksList } from '@/components/dashboard/due-today-tasks-list';
import { MetricCards } from '@/components/dashboard/metric-cards';
import { TodayReminders } from '@/components/reminders/today-reminders';
import { PlaceholderPattern } from '@/components/ui/placeholder-pattern';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type { BreadcrumbItem, Reminder, Project, Task, Client } from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

interface DashboardProps {
    metrics: {
        activeClients: number;
        monthlyRevenue: number;
        activeProjects: number;
        overdueTasks: number;
    };
    todayReminders: Reminder[];
    dueTodayTasks: Task[];
    atRiskClients: Client[];
    activeProjects: Project[];
}

export default function Dashboard({ metrics, todayReminders, dueTodayTasks, atRiskClients, activeProjects }: DashboardProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4">
                {/* Metrics Section */}
                <MetricCards metrics={metrics} />

                {/* Top Priority Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
                        <DueTodayTasksList tasks={dueTodayTasks} />
                    </div>
                    <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
                        <TodayReminders reminders={todayReminders} />
                    </div>
                    <div className="rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
                        <AtRiskClientsList clients={atRiskClients} />
                    </div>
                </div>

                {/* Main Content Sections */}
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                    <div className="xl:col-span-2 rounded-xl border border-sidebar-border/70 dark:border-sidebar-border bg-card shadow-sm">
                        <ActiveProjectsList projects={activeProjects} />
                    </div>
                    
                    <div className="relative min-h-[300px] overflow-hidden rounded-xl border border-sidebar-border/70 dark:border-sidebar-border shadow-sm">
                        {/* Future widgets can go here */}
                        <div className="absolute inset-0 flex items-center justify-center p-6 text-center">
                            <div className="space-y-2">
                                <p className="text-sm font-medium text-muted-foreground">Insights Coming Soon</p>
                                <p className="text-xs text-muted-foreground/60">More powerful analytics and business health indicators are on the way.</p>
                            </div>
                        </div>
                        <PlaceholderPattern className="absolute inset-0 size-full stroke-neutral-900/10 dark:stroke-neutral-100/10" />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}

