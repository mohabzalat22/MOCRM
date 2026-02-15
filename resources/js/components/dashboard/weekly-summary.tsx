import { MessageSquare, CheckCircle2, UserPlus, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface WeeklySummaryProps {
    summary: {
        interactionsCount: number;
        projectsCompletedCount: number;
        newClientsCount: number;
        revenueEarned: number;
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
        <Card className="border-sidebar-border/70 bg-card/50 backdrop-blur-sm dark:border-sidebar-border">
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">This Week Summary</CardTitle>
                <p className="text-xs text-muted-foreground">Activities from Monday to today</p>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                    {items.map((item) => (
                        <div key={item.label} className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <div className={`rounded-lg p-2 ${item.bgColor}`}>
                                    <item.icon className={`size-4 ${item.color}`} />
                                </div>
                                <span className="text-xs font-medium text-muted-foreground">{item.label}</span>
                            </div>
                            <div className="mt-1">
                                <span className="text-2xl font-bold tracking-tight">{item.value}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
