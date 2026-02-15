import type { ReactNode } from 'react';

interface DashboardLayoutProps {
    metrics: ReactNode;
    quickActions: ReactNode;
    weeklySummary: ReactNode;
    dueTodayTasks: ReactNode;
    todayReminders: ReactNode;
    clientHealth: ReactNode;
    activeProjects: ReactNode;
    activityFeed: ReactNode;
}

export function DashboardLayout({
    metrics,
    quickActions,
    weeklySummary,
    dueTodayTasks,
    todayReminders,
    clientHealth,
    activeProjects,
    activityFeed,
}: DashboardLayoutProps) {
    return (
        <div className="flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
            {/* 1. The Brief (Weekly Summary) - Moved to top, compact row */}
            <section className="w-full">
                {weeklySummary}
            </section>

            {/* 2. The Pulse (Metrics) - Health check */}
            <section className="w-full">
                {metrics}
            </section>

            {/* 3. The Command Center (Immediate) - Actions and Urgent Items */}
            <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                <div className="h-full">
                    {quickActions}
                </div>
                <div className="h-full rounded-xl border border-sidebar-border/70 bg-card/50 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md dark:border-sidebar-border">
                    {dueTodayTasks}
                </div>
                <div className="h-full rounded-xl border border-sidebar-border/70 bg-card/50 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md dark:border-sidebar-border">
                    {todayReminders}
                </div>
            </section>

            {/* 4. The Workspace (Primary) - Ongoing Projects and Activity/Health */}
            <section className="grid grid-cols-1 gap-6 xl:grid-cols-3">
                <div className="h-full rounded-xl border border-sidebar-border/70 bg-card shadow-sm xl:col-span-2 dark:border-sidebar-border">
                    {activeProjects}
                </div>
                <div className="flex flex-col gap-6 xl:col-span-1">
                    <div className="rounded-xl border border-sidebar-border/70 bg-card/50 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md dark:border-sidebar-border">
                        {clientHealth}
                    </div>
                    <div className="relative min-h-[400px] flex-1 overflow-hidden rounded-xl border border-sidebar-border/70 bg-card shadow-sm dark:border-sidebar-border">
                        {activityFeed}
                    </div>
                </div>
            </section>
        </div>
    );
}
