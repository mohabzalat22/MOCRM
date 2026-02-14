import { Link } from '@inertiajs/react';
import { formatDistanceToNow } from 'date-fns';
import { UserCheck, UserMinus, UserX, Clock, MessageSquare, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { Client } from '@/types';

interface ClientHealthOverviewProps {
    healthData: {
        healthy: Client[];
        needsAttention: Client[];
        atRisk: Client[];
    };
}

type HealthCategory = 'healthy' | 'needsAttention' | 'atRisk';

export function ClientHealthOverview({ healthData }: ClientHealthOverviewProps) {
    const [selectedCategory, setSelectedCategory] = useState<HealthCategory>('atRisk');

    const categories = [
        {
            key: 'healthy' as const,
            label: 'Healthy',
            icon: UserCheck,
            color: 'text-emerald-500',
            bgColor: 'bg-emerald-500/10',
            borderColor: 'border-emerald-500/20',
            activeBorder: 'border-emerald-500',
            clients: healthData.healthy,
        },
        {
            key: 'needsAttention' as const,
            label: 'Needs Attention',
            icon: UserMinus,
            color: 'text-amber-500',
            bgColor: 'bg-amber-500/10',
            borderColor: 'border-amber-500/20',
            activeBorder: 'border-amber-500',
            clients: healthData.needsAttention,
        },
        {
            key: 'atRisk' as const,
            label: 'At Risk',
            icon: UserX,
            color: 'text-destructive',
            bgColor: 'bg-destructive/10',
            borderColor: 'border-destructive/20',
            activeBorder: 'border-destructive',
            clients: healthData.atRisk,
        },
    ];

    const activeCategory = categories.find((c) => c.key === selectedCategory)!;

    return (
        <Card className="flex h-full flex-col overflow-hidden border-none bg-transparent shadow-none">
            <CardHeader className="pb-4">
                <CardTitle className="text-sm font-semibold">Client Health Overview</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-4 p-0">
                {/* Visual Breakdown Tabs */}
                <div className="grid grid-cols-3 gap-2 px-4">
                    {categories.map((cat) => (
                        <button
                            key={cat.key}
                            onClick={() => setSelectedCategory(cat.key)}
                            className={cn(
                                'flex flex-col items-center gap-1 rounded-lg border p-3 transition-all',
                                cat.bgColor,
                                cat.borderColor,
                                selectedCategory === cat.key ? cn('ring-2 ring-offset-2', cat.activeBorder) : 'opacity-60 hover:opacity-100'
                            )}
                        >
                            <cat.icon className={cn('h-5 w-5', cat.color)} />
                            <div className="flex flex-col items-center">
                                <span className="text-lg font-bold leading-tight">{cat.clients.length}</span>
                                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                                    {cat.label}
                                </span>
                            </div>
                        </button>
                    ))}
                </div>

                {/* Filtered List */}
                <div className="flex-1 overflow-hidden border-t border-sidebar-border/50">
                    <div className="bg-muted/30 px-4 py-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                        {activeCategory.label} Clients ({activeCategory.clients.length})
                    </div>
                    <div className="max-h-[300px] divide-y divide-border overflow-auto">
                        {activeCategory.clients.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <activeCategory.icon className="mb-2 h-8 w-8 opacity-20" />
                                <p className="px-4 text-xs text-muted-foreground">
                                    No clients in this category.
                                </p>
                            </div>
                        ) : (
                            activeCategory.clients.map((client) => {
                                const lastActivity = client.activities?.[0];
                                return (
                                    <Link
                                        key={client.id}
                                        href={`/clients/${client.id}`}
                                        className="group block p-4 transition-colors hover:bg-muted/50"
                                    >
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="min-w-0 flex-1 space-y-1">
                                                <div className="truncate text-sm font-medium group-hover:underline">
                                                    {client.name}
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                                                    <div className="flex items-center gap-1">
                                                        <Clock className="h-3 w-3" />
                                                        <span>
                                                            {lastActivity
                                                                ? `${formatDistanceToNow(new Date(lastActivity.created_at))} ago`
                                                                : 'No activity'}
                                                        </span>
                                                    </div>
                                                    {client.phone && (
                                                        <div className="flex items-center gap-1">
                                                            <MessageSquare className="h-3 w-3" />
                                                            <span className="truncate">{client.phone}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                                        </div>
                                    </Link>
                                );
                            })
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
