export type DateRangeKey = '7d' | '30d' | '90d' | 'this_month' | 'last_month' | 'this_year';

export interface WidgetConfig {
    id: string;
    visible: boolean;
    order: number;
}

export interface DashboardPreference {
    layout: WidgetConfig[];
    date_range: DateRangeKey;
}

export interface DashboardSummary {
    interactionsCount: number;
    projectsCompletedCount: number;
    newClientsCount: number;
    revenueEarned: number;
    dateRangeLabel: string;
}

export interface DashboardMetrics {
    activeClients: number;
    monthlyRevenue: number;
    activeProjects: number;
    overdueTasks: number;
}
