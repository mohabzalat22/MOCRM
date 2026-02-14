import { Link } from '@inertiajs/react';
import { Users, DollarSign, Briefcase, AlertCircle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface MetricProps {
    title: string;
    value: string | number;
    icon: React.ElementType;
    description?: string;
    href?: string;
    className?: string;
    iconClassName?: string;
}

function MetricCard({ title, value, icon: Icon, description, href, className, iconClassName }: MetricProps) {
    const content = (
        <Card className={cn("h-full overflow-hidden border-sidebar-border/70 dark:border-sidebar-border bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all duration-200", className)}>
            <CardContent className="p-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <p className="text-sm font-medium text-muted-foreground">{title}</p>
                        <div className="flex items-baseline gap-1">
                            <h2 className="text-3xl font-bold tracking-tight">{value}</h2>
                        </div>
                        {description && (
                            <p className="text-xs text-muted-foreground">{description}</p>
                        )}
                    </div>
                    <div className={cn("rounded-xl p-3 bg-primary/10", iconClassName)}>
                        <Icon className="size-6 text-primary" />
                    </div>
                </div>
            </CardContent>
        </Card>
    );

    if (href) {
        return (
            <Link href={href} className="block group h-full">
                {content}
            </Link>
        );
    }

    return content;
}

interface MetricCardsProps {
    metrics: {
        activeClients: number;
        monthlyRevenue: number;
        activeProjects: number;
        overdueTasks: number;
    };
}

export function MetricCards({ metrics }: MetricCardsProps) {
    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD',
            maximumFractionDigits: 0,
        }).format(value);
    };

    return (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <MetricCard
                title="Active Clients"
                value={metrics.activeClients}
                icon={Users}
                href="/clients?status=Active"
                iconClassName="bg-blue-500/10"
                className="hover:border-blue-500/50"
            />
            <MetricCard
                title="Monthly Revenue"
                value={formatCurrency(metrics.monthlyRevenue)}
                icon={DollarSign}
                description="Total from active clients"
                iconClassName="bg-green-500/10"
                className="hover:border-green-500/50"
            />
            <MetricCard
                title="Active Projects"
                value={metrics.activeProjects}
                icon={Briefcase}
                href="/projects"
                iconClassName="bg-purple-500/10"
                className="hover:border-purple-500/50"
            />
            <MetricCard
                title="Overdue Tasks"
                value={metrics.overdueTasks}
                icon={AlertCircle}
                iconClassName="bg-red-500/10"
                className="hover:border-red-500/50"
            />
        </div>
    );
}
