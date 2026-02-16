import type { DragEndEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { Head } from '@inertiajs/react';
import { Settings2, Check, RotateCcw } from 'lucide-react';
import { useState } from 'react';
import { ActiveProjectsList } from '@/components/dashboard/active-projects-list';
import { ActivityFeed } from '@/components/dashboard/activity-feed';
import { ClientHealthOverview } from '@/components/dashboard/client-health-overview';
import { DashboardLayout } from '@/components/dashboard/dashboard-layout';
import { DateRangeSelector } from '@/components/dashboard/date-range-selector';
import { DueTodayTasksList } from '@/components/dashboard/due-today-tasks-list';
import { MetricCards } from '@/components/dashboard/metric-cards';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { WeeklySummary } from '@/components/dashboard/weekly-summary';
import { TodayReminders } from '@/components/reminders/today-reminders';
import { Button } from '@/components/ui/button';
import { useDashboardPreferences } from '@/hooks/use-dashboard-preferences';
import AppLayout from '@/layouts/app-layout';
import { dashboard } from '@/routes';

import type {
    BreadcrumbItem,
    Reminder,
    Project,
    Task,
    Client,
    Activity,
    DashboardMetrics,
    DashboardSummary,
    DashboardPreference,
    WidgetConfig,
} from '@/types';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: dashboard().url,
    },
];

interface DashboardProps {
    metrics: DashboardMetrics;
    summary: DashboardSummary;
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
    preferences: DashboardPreference | null;
    currentDateRange: string;
}

const DEFAULT_LAYOUT: WidgetConfig[] = [
    { id: 'weeklySummary', visible: true, order: 0 },
    { id: 'metrics', visible: true, order: 1 },
    { id: 'quickActions', visible: true, order: 2 },
    { id: 'dueTodayTasks', visible: true, order: 3 },
    { id: 'todayReminders', visible: true, order: 4 },
    { id: 'activeProjects', visible: true, order: 5 },
    { id: 'clientHealth', visible: true, order: 6 },
    { id: 'activityFeed', visible: true, order: 7 },
];

export default function Dashboard({
    metrics,
    summary,
    todayReminders,
    dueTodayTasks,
    clientHealth,
    activeProjects,
    recentActivities,
    clients,
    preferences,
    currentDateRange,
}: DashboardProps) {
    const { layout, dateRange, updateLayout, updateDateRange } =
        useDashboardPreferences(
            preferences?.layout ? preferences : { ...preferences, layout: DEFAULT_LAYOUT } as DashboardPreference,
            currentDateRange
        );

    const [isEditMode, setIsEditMode] = useState(false);

    // If layout is empty (first load before preference save), use default
    const activeLayout = layout.length > 0 ? layout : DEFAULT_LAYOUT;

    const widgets = {
        weeklySummary: <WeeklySummary summary={summary} />,
        metrics: <MetricCards metrics={metrics} />,
        quickActions: <QuickActions clients={clients} />,
        dueTodayTasks: <DueTodayTasksList tasks={dueTodayTasks} />,
        todayReminders: <TodayReminders reminders={todayReminders} />,
        activeProjects: <ActiveProjectsList projects={activeProjects} />,
        clientHealth: <ClientHealthOverview healthData={clientHealth} />,
        activityFeed: <ActivityFeed activities={recentActivities} />,
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (active.id !== over?.id) {
            const oldIndex = activeLayout.findIndex((item) => item.id === active.id);
            const newIndex = activeLayout.findIndex((item) => item.id === over?.id);
            const newLayout = arrayMove(activeLayout, oldIndex, newIndex);
            updateLayout(newLayout);
        }
    };

    const handleHideWidget = (id: string) => {
        const newLayout = activeLayout.map(w => 
            w.id === id ? { ...w, visible: false } : w
        );
        updateLayout(newLayout);
    };

    const handleResetLayout = () => {
        updateLayout(DEFAULT_LAYOUT);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 p-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
                    <div className="flex items-center gap-2">
                         <DateRangeSelector 
                            value={dateRange} 
                            onChange={updateDateRange} 
                        />
                        {isEditMode ? (
                            <>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleResetLayout}
                                    title="Reset Layout"
                                >
                                    <RotateCcw className="mr-2 h-4 w-4" />
                                    Reset
                                </Button>
                                <Button
                                    size="sm"
                                    onClick={() => setIsEditMode(false)}
                                >
                                    <Check className="mr-2 h-4 w-4" />
                                    Done
                                </Button>
                            </>
                        ) : (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setIsEditMode(true)}
                            >
                                <Settings2 className="mr-2 h-4 w-4" />
                                Customize
                            </Button>
                        )}
                    </div>
                </div>

                <DashboardLayout
                    widgets={widgets}
                    layout={activeLayout}
                    onDragEnd={handleDragEnd}
                    isEditMode={isEditMode}
                    onHideWidget={handleHideWidget}
                />
            </div>
        </AppLayout>
    );
}
