import { Head } from '@inertiajs/react';
import { ActiveProjectsList } from '@/components/dashboard/active-projects-list';
import { ActivityFeed } from '@/components/dashboard/activity-feed';
import { ClientHealthOverview } from '@/components/dashboard/client-health-overview';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { DueTodayTasksList } from '@/components/dashboard/due-today-tasks-list';
import { MetricCards } from '@/components/dashboard/metric-cards';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { WeeklySummary } from '@/components/dashboard/weekly-summary';
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
    weeklySummary: {
        interactionsCount: number;
        projectsCompletedCount: number;
        newClientsCount: number;
        revenueEarned: number;
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
    clients: { id: number; name: string }[];
}

export default function Dashboard({
    metrics,
    weeklySummary,
    todayReminders,
    dueTodayTasks,
    clientHealth,
    activeProjects,
    recentActivities,
    clients,
}: DashboardProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <DashboardLayout
                metrics={<MetricCards metrics={metrics} />}
                weeklySummary={<WeeklySummary summary={weeklySummary} />}
                quickActions={<QuickActions clients={clients} />}
                dueTodayTasks={<DueTodayTasksList tasks={dueTodayTasks} />}
                todayReminders={<TodayReminders reminders={todayReminders} />}
                clientHealth={<ClientHealthOverview healthData={clientHealth} />}
                activeProjects={<ActiveProjectsList projects={activeProjects} />}
                activityFeed={<ActivityFeed activities={recentActivities} />}
            />
        </AppLayout>
    );
}
