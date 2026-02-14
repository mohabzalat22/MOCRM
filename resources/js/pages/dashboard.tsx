import { Head } from '@inertiajs/react';
import { ActiveProjectsList } from '@/components/dashboard/active-projects-list';
import { ActivityFeed } from '@/components/dashboard/activity-feed';
import { ClientHealthOverview } from '@/components/dashboard/client-health-overview';
import { DueTodayTasksList } from '@/components/dashboard/due-today-tasks-list';
import { MetricCards } from '@/components/dashboard/metric-cards';
import { TodayReminders } from '@/components/reminders/today-reminders';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';
import type {
    BreadcrumbItem,
    Reminder,
    Project,
    Task,
    Client,
    Activity,
} from '@/types';

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
    clientHealth: {
        healthy: Client[];
        needsAttention: Client[];
        atRisk: Client[];
    };
    activeProjects: Project[];
    recentActivities: Activity[];
}

export default function Dashboard({
    metrics,
    todayReminders,
    dueTodayTasks,
    clientHealth,
    activeProjects,
    recentActivities,
}: DashboardProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-4">
                {/* Metrics Section */}
                <MetricCards metrics={metrics} />

                {/* Top Priority Section */}
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                    <div className="rounded-xl border border-sidebar-border/70 bg-card/50 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md dark:border-sidebar-border">
                        <DueTodayTasksList tasks={dueTodayTasks} />
                    </div>
                    <div className="rounded-xl border border-sidebar-border/70 bg-card/50 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md dark:border-sidebar-border">
                        <TodayReminders reminders={todayReminders} />
                    </div>
                    <div className="rounded-xl border border-sidebar-border/70 bg-card/50 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md dark:border-sidebar-border">
                        <ClientHealthOverview healthData={clientHealth} />
                    </div>
                </div>

                {/* Main Content Sections */}
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                    <div className="rounded-xl border border-sidebar-border/70 bg-card shadow-sm xl:col-span-2 dark:border-sidebar-border">
                        <ActiveProjectsList projects={activeProjects} />
                    </div>

                    <div className="relative min-h-[400px] overflow-hidden rounded-xl border border-sidebar-border/70 bg-card shadow-sm dark:border-sidebar-border">
                        <ActivityFeed activities={recentActivities} />
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
