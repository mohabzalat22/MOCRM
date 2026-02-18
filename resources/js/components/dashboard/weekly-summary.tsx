import {
    MessageSquare,
    CheckCircle2,
    UserPlus,
    TrendingUp,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface WeeklySummaryProps {
    summary: {
        interactionsCount: number;
        projectsCompletedCount: number;
        newClientsCount: number;
        revenueEarned: number;
        dateRangeLabel?: string;
    };
}

export function WeeklySummary({ summary }: WeeklySummaryProps) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0,
        }).format(value);
    };

    const items = [
        {
            label: 'Interactions',
            value: summary.interactionsCount,
            icon: MessageSquare,
            color: 'text-blue-500',
            bgColor: 'bg-blue-500/10',
        },
        {
            label: 'Projects Completed',
            value: summary.projectsCompletedCount,
            icon: CheckCircle2,
            color: 'text-green-500',
            bgColor: 'bg-green-500/10',
        },
        {
            label: 'New Clients',
            value: summary.newClientsCount,
            icon: UserPlus,
            color: 'text-purple-500',
            bgColor: 'bg-purple-500/10',
        },
        {
            label: 'Revenue Earned',
            value: formatCurrency(summary.revenueEarned),
            icon: TrendingUp,
            color: 'text-orange-500',
            bgColor: 'bg-orange-500/10',
        },
    ];

    return (
        <Card className="h-auto w-full border-sidebar-border/70 bg-white shadow-sm dark:border-sidebar-border dark:bg-transparent">
            <CardContent className="px-1 py-2">
                <div className="flex flex-col items-center gap-4">
                    <h3 className="text-[10px] font-bold tracking-[0.2em] text-muted-foreground/50 uppercase">
                        Summary ({summary.dateRangeLabel || 'Last 7 Days'})
                    </h3>
                    <div className="grid w-full max-w-4xl grid-cols-2 items-center justify-items-center gap-x-12 gap-y-4 md:grid-cols-4">
                        {items.map((item) => (
                            <div
                                key={item.label}
                                className="flex items-center gap-3"
                            >
                                <div
                                    className={`rounded-lg p-1.5 ${item.bgColor} shrink-0`}
                                >
                                    <item.icon
                                        className={`size-3.5 ${item.color}`}
                                    />
                                </div>
                                <div className="flex min-w-[90px] flex-col">
                                    <span className="mb-1 text-left text-[10px] leading-none font-semibold tracking-wider text-muted-foreground/70 uppercase">
                                        {item.label}
                                    </span>
                                    <span className="text-left text-lg leading-none font-bold tracking-tight">
                                        {item.value}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
